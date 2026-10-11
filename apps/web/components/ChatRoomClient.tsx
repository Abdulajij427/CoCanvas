"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { BACKEND_URL } from "../app/config";

interface Chat {
  id?: number;
  message: string;
  user_id?: number;
  name?: string;
  created_at?: string;
}

export function ChatRoomClient({ id, slug }: { id: number; slug: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const { socket, loading } = useSocket();

  // 1. HTTP: room ka member banao, phir purani chats lao
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in first (token missing)");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    async function init() {
      try {
        await axios.post(`${BACKEND_URL}/room/${slug}/join`, {}, { headers });
        const res = await axios.get(`${BACKEND_URL}/chat/${id}`, { headers });
        if (!active) return;
        // live messages jo beech me aa gaye unhe na udao
        setChats((live) => {
          const oldIds = new Set(res.data.chats.map((c: Chat) => c.id));
          return [...res.data.chats, ...live.filter((c) => !c.id || !oldIds.has(c.id))];
        });
        setJoined(true);
      } catch (e: any) {
        console.error("Init failed:", e.response?.status, e.message);
        if (active) setError("Could not join room");
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [id, slug]);

  // 2. WebSocket: membership ban jaane ke baad hi join_room bhejo
  useEffect(() => {
    if (!joined || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ type: "join_room", roomId: id }));

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat" && Number(data.roomId) === id) {
          setChats((prev) => [
            ...prev,
            { id: data.id, message: data.message, name: data.name },
          ]);
        }
        if (data.type === "error") console.error("Chat server error:", data.message);
      } catch (e) {
        console.error("Invalid WebSocket message:", e);
      }
    };

    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave_room", roomId: id }));
      }
    };
  }, [socket, id, joined]);

  function sendMessage() {
    const message = currentMessage.trim();
    if (!message) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }
    socket.send(JSON.stringify({ type: "chat", roomId: id, message }));
    setCurrentMessage("");
  }

  const ready = !!socket && socket.readyState === WebSocket.OPEN && joined;

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && !error && <p>Connecting to chat...</p>}

      <div>
        {chats.map((chat, i) => (
          <div key={chat.id ?? `live-${i}`}>
            {chat.name ? `${chat.name}: ` : ""}
            {chat.message}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage} disabled={!ready}>
        Send message
      </button>
    </div>
  );
}