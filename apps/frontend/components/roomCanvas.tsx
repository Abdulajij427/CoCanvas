"use client";
import { useEffect, useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./canvas";

export function RoomCanvas({ roomId }: { roomId: number }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in first");
      return;
    }

    let active = true;
    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      if (!active) return;
      ws.send(JSON.stringify({ type: "join_room", roomId }));
      setSocket(ws);
    };
    ws.onclose = () => {
      if (active) setSocket(null);
    };

    return () => {
      active = false;
      ws.close();
    };
  }, [roomId]);

  if (error) return <div>{error}</div>;
  if (!socket) return <div>Connecting to server...</div>;

  return <Canvas roomId={roomId} socket={socket} />;
}