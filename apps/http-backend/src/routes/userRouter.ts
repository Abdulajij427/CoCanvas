import {Router , type Request , type Response} from 'express';
import bcrypt from 'bcrypt'
import {User , UserSchema ,SigninSchema , RoomSchema} from "@repo/schema"
import {pool} from "@repo/db"
import  generateToken from '../config.js'
import {middleware} from '../middleware/middleware.js'

const userRouter: Router = Router();

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
    // 23505 = unique constraint violation (username already exists)
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username is already taken" });
    }
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});



userRouter.post("/signin", async (req: Request, res: Response) => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { username, password } = parsed.data;

  try {
    const { rows } = await pool.query(
      `SELECT id, password FROM users WHERE username = $1`,
      [username]
    );

    const user = rows[0];

    // user na mile ya password galat ho: same message (attacker ko hint nahi milta)
    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    return res.status(200).json({ message: "Signin successful", token });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});



// for userId 
interface AuthRequest extends Request {
    userId?: number;
}


userRouter.post("/room", middleware, async (req: AuthRequest, res: Response) => {
  const parsed = RoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Incorrect inputs" });
  }

  const { name } = parsed.data;   // DB me ye slug column me jayega

  try {
    // ek hi query me: room banao + admin ko member banao
    const { rows } = await pool.query(
      `WITH new_room AS (
         INSERT INTO rooms (slug, admin_id)
         VALUES ($1, $2)
         RETURNING id
       )
       INSERT INTO room_members (room_id, user_id)
       SELECT id, $2 FROM new_room
       RETURNING room_id`,
      [name, req.userId]
    );

    return res.status(201).json({ roomId: rows[0].room_id });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Room name already taken" });
    }
    console.error("Create room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


export default userRouter;