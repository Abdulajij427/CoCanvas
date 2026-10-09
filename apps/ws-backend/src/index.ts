import { WebSocketServer, WebSocket } from 'ws';
import jwt from "jsonwebtoken";
import  JWT_SECRET  from '@repo/backend-common';
import { pool } from '@repo/db';

const wss = new WebSocketServer({ port: 8000 });

interface User {
    userId: number;
    rooms: number[];
    ws: WebSocket;
}
const users: User[] = [];

function checkUser(token: string): number | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string" || !decoded.id) return null;
        return decoded.id;
    } catch {
        return null;
    }
}

async function isMember(roomId: number, userId: number): Promise<boolean> {
    const { rowCount } = await pool.query(
        "SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2",
        [roomId, userId]
    );
    return (rowCount ?? 0) > 0;
}

wss.on("connection", function connection(ws, request) {
    ws.on("error", console.error);

    const url = request.url;
    if (!url) { ws.close(); return; }

    const params = new URLSearchParams(url.split("?")[1]);
    const userId = checkUser(params.get("token") || "");
    if (userId === null) { ws.close(1008, "Unauthorized"); return; }

    const me: User = { userId, rooms: [], ws };
    users.push(me);

    ws.on("close", () => {
        const i = users.indexOf(me);
        if (i !== -1) users.splice(i, 1);
    });

    ws.on("message", async function message(data) {
        try {
            const parsed = JSON.parse(data.toString());
            const roomId = Number(parsed.roomId);
            if (!Number.isInteger(roomId)) return;

            if (parsed.type === "join_room") {
                if (!(await isMember(roomId, userId))) {
                    ws.send(JSON.stringify({ type: "error", message: "Not a member" }));
                    return;
                }
                if (!me.rooms.includes(roomId)) me.rooms.push(roomId);
            }

            if (parsed.type === "leave_room") {
                me.rooms = me.rooms.filter(x => x !== roomId);
            }

            if (parsed.type === "chat") {
                if (!me.rooms.includes(roomId)) return;   // pehle join_room zaroori
                const message = String(parsed.message);

                await pool.query(
                    `INSERT INTO chats (room_id, user_id, message) VALUES ($1, $2, $3)`,
                    [roomId, userId, message]
                );

                users.forEach(u => {
                    if (u.rooms.includes(roomId)) {
                        u.ws.send(JSON.stringify({ type: "chat", message, roomId }));
                    }
                });
            }
        } catch (e) {
            console.error("ws message error:", e);
        }
    });
});