


import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import {
  UserSchema,
  SigninSchema,
  RoomSchema,
} from "@repo/schema";
import { pool } from "@repo/db";
import generateToken from "../config.js";
import { middleware } from "../middleware/middleware.js";

const userRouter: Router = Router();

interface AuthRequest extends Request {
  userId?: number;
}

// Signup
userRouter.post("/signup", async (req: Request, res: Response) => {
  const parsed = UserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { username, password, name } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, username, password)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, username, hashedPassword]
    );

    return res.status(201).json({
      message: "User created successfully",
      userId: rows[0].id,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Username is already taken",
      });
    }

    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Signin
userRouter.post("/signin", async (req: Request, res: Response) => {
  const parsed = SigninSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { username, password } = parsed.data;

  try {
    const { rows } = await pool.query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      message: "Signin successful",
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create room
userRouter.post(
  "/room",
  middleware,
  async (req: AuthRequest, res: Response) => {
    const parsed = RoomSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Incorrect inputs",
      });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name } = parsed.data;

    try {
      const { rows } = await pool.query(
        `WITH new_room AS (
           INSERT INTO rooms (slug, admin_id)
           VALUES ($1, $2)
           RETURNING id
         )
         INSERT INTO room_members (room_id, user_id)
         SELECT id, $2::int FROM new_room
         RETURNING room_id`,
        [name, req.userId]
      );

      return res.status(201).json({
        roomId: rows[0].room_id,
      });
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(409).json({
          message: "Room name already taken",
        });
      }

      console.error("Create room error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Get numeric room ID from slug
userRouter.get("/room/:slug", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT id FROM rooms WHERE slug = $1",
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json({ roomId: rows[0].id });
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Join room
userRouter.post(
  "/room/:slug/join",
  middleware,
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const room = await pool.query(
        "SELECT id FROM rooms WHERE slug = $1",
        [req.params.slug]
      );

      if (room.rows.length === 0) {
        return res.status(404).json({ message: "Room not found" });
      }

      await pool.query(
        `INSERT INTO room_members (room_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [room.rows[0].id, req.userId]
      );

      return res.json({ roomId: room.rows[0].id });
    } catch (error) {
      console.error("Join room error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Get chat history — FIXED ROUTE
userRouter.get(
  "/chat/:roomId",
  middleware,
  async (req: AuthRequest, res: Response) => {
    const roomId = Number(req.params.roomId);

    if (!Number.isSafeInteger(roomId) || roomId <= 0) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const beforeValue = req.query.before;
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 50, 1),
      100
    );

    let before: number | null = null;

    if (beforeValue !== undefined) {
      before = Number(beforeValue);

      if (!Number.isSafeInteger(before) || before <= 0) {
        return res.status(400).json({
          message: "Invalid before cursor",
        });
      }
    }

    try {
      const member = await pool.query(
        `SELECT 1
         FROM room_members
         WHERE room_id = $1 AND user_id = $2`,
        [roomId, req.userId]
      );

      if (member.rowCount === 0) {
        return res.status(403).json({
          message: "You are not a member of this room",
        });
      }

      const { rows } = await pool.query(
        `SELECT
           c.id,
           c.message,
           c.user_id,
           u.name,
           c.created_at
         FROM chats c
         JOIN users u ON u.id = c.user_id
         WHERE c.room_id = $1
           AND ($2::int IS NULL OR c.id < $2)
         ORDER BY c.id DESC
         LIMIT $3`,
        [roomId, before, limit]
      );

      const chats = rows.reverse();

      return res.json({
        chats,
        nextBefore: chats.length === limit ? chats[0].id : null,
      });
    } catch (error) {
      console.error("Get chats error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default userRouter;

