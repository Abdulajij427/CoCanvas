"use client";
import { useRef, useEffect, useState } from "react";
import { initDraw, type Tool } from "@/draw";

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  {
    id: "select",
    label: "Move",
    icon: <path d="M5 3l14 8-6 2-2 6z" />,
  },
  { id: "rect", label: "Rectangle", icon: <rect x="4" y="6" width="16" height="12" rx="1" /> },
  { id: "circle", label: "Circle", icon: <circle cx="12" cy="12" r="8" /> },
  { id: "pen", label: "Pen", icon: <path d="M4 20l4-1 11-11-3-3L5 16z" /> },
  {
    id: "eraser",
    label: "Eraser",
    icon: <path d="M16 4l5 5-9 9H7l-3-3z M9 18h11" />,
  },
];

export function Canvas({ roomId, socket }: { roomId: number; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("rect");
  const toolRef = useRef<Tool>("rect");

  // tool badalne par canvas dobara init nahi hota, sirf ref update hota hai
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    if (!canvasRef.current) return;
    return initDraw(canvasRef.current, roomId, socket, () => toolRef.current);
  }, [roomId, socket]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} width={1000} height={600} />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1 rounded-xl bg-zinc-800 p-2 shadow-lg">
        {tools.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setTool(t.id)}
            className={`p-2 rounded-lg cursor-pointer ${
              tool === t.id ? "bg-indigo-500 text-white" : "text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              {t.icon}
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}