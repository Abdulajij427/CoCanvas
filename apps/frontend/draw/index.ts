import axios from "axios";
import { HTTP_BACKEND } from "@/config";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number };

export function initDraw(
  canvas: HTMLCanvasElement,
  roomId: number,
  socket: WebSocket
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let shapes: Shape[] = [];
  let clicked = false;
  let startX = 0;
  let startY = 0;

  const getPos = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function drawShape(s: Shape) {
    if (s.type === "rect") {
      ctx!.strokeRect(s.x, s.y, s.width, s.height);
    } else {
      ctx!.beginPath();
      ctx!.arc(s.centerX, s.centerY, Math.abs(s.radius), 0, Math.PI * 2);
      ctx!.stroke();
    }
  }

  function redraw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.fillStyle = "black";
    ctx!.fillRect(0, 0, canvas.width, canvas.height);
    ctx!.strokeStyle = "white";
    shapes.forEach(drawShape);
  }

  // purane shapes (async, par initDraw khud async nahi)
  let active = true;
  getExistingShapes(roomId).then((old) => {
    if (!active) return;
    shapes = [...old, ...shapes];
    redraw();
  });

  const onMessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "chat" && Number(msg.roomId) === roomId) {
        shapes.push(JSON.parse(msg.message) as Shape);
        redraw();
      }
    } catch {
      /* ignore */
    }
  };
  socket.addEventListener("message", onMessage);

  const onDown = (e: MouseEvent) => {
    clicked = true;
    const p = getPos(e);
    startX = p.x;
    startY = p.y;
  };

  const onUp = (e: MouseEvent) => {
    if (!clicked) return;
    clicked = false;
    const { x, y } = getPos(e);
    const shape: Shape = {
      type: "rect",
      x: startX,
      y: startY,
      width: x - startX,
      height: y - startY,
    };
    // local push nahi: server broadcast se wapas aayega
    socket.send(
      JSON.stringify({ type: "chat", roomId, message: JSON.stringify(shape) })
    );
  };

  const onMove = (e: MouseEvent) => {
    if (!clicked) return;
    const { x, y } = getPos(e);
    redraw();
    ctx!.strokeStyle = "white";
    ctx!.strokeRect(startX, startY, x - startX, y - startY);
  };

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mouseup", onUp);
  canvas.addEventListener("mousemove", onMove);
  redraw();

  return () => {
    active = false;
    socket.removeEventListener("message", onMessage);
    canvas.removeEventListener("mousedown", onDown);
    canvas.removeEventListener("mouseup", onUp);
    canvas.removeEventListener("mousemove", onMove);
  };
}

async function getExistingShapes(roomId: number): Promise<Shape[]> {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const shapes: Shape[] = [];
    for (const c of res.data.chats as { message: string }[]) {
      try {
        shapes.push(JSON.parse(c.message));
      } catch {
        /* text chats skip */
      }
    }
    return shapes;
  } catch (e) {
    console.error("Failed to load shapes:", e);
    return [];
  }
}