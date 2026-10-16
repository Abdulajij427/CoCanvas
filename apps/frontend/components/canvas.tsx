"use client";
import { useRef, useEffect } from "react";
import { initDraw } from "@/draw";

export function Canvas({ roomId, socket }: { roomId: number; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const cleanup = initDraw(canvasRef.current, roomId, socket);
    return cleanup;
  }, [roomId, socket]);

  return (
    <div>
      <canvas ref={canvasRef} width={1000} height={600} />
      <div className="absolute bottom-0 right-0">
        <button>Rect</button>
        <button>Circle</button>
      </div>
    </div>
  );
}