import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export type Tool = "select" | "rect" | "circle" | "pen" | "eraser";

type Point = { x: number; y: number };
type Shape =
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number }
  | { id: string; type: "circle"; centerX: number; centerY: number; radius: number }
  | { id: string; type: "pen"; points: Point[] };

type Event =
  | { kind: "add"; shape: Shape }
  | { kind: "update"; shape: Shape }
  | { kind: "erase"; id: string };

// events ko shapes par apply karo (idempotent: dobara aaye to problem nahi)
function applyEvent(shapes: Shape[], ev: Event): Shape[] {
  if (ev.kind === "add") {
    return shapes.some((s) => s.id === ev.shape.id) ? shapes : [...shapes, ev.shape];
  }
  if (ev.kind === "update") {
    return shapes.map((s) => (s.id === ev.shape.id ? ev.shape : s));
  }
  return shapes.filter((s) => s.id !== ev.id);
}

function distToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function hitTest(s: Shape, p: Point): boolean {
  const tol = 8;
  if (s.type === "rect") {
    const x1 = Math.min(s.x, s.x + s.width), x2 = Math.max(s.x, s.x + s.width);
    const y1 = Math.min(s.y, s.y + s.height), y2 = Math.max(s.y, s.y + s.height);
    return p.x >= x1 - tol && p.x <= x2 + tol && p.y >= y1 - tol && p.y <= y2 + tol;
  }
  if (s.type === "circle") {
    return Math.hypot(p.x - s.centerX, p.y - s.centerY) <= Math.abs(s.radius) + tol;
  }
  for (let i = 0; i < s.points.length - 1; i++) {
    if (distToSegment(p, s.points[i], s.points[i + 1]) <= tol) return true;
  }
  return s.points.length === 1 && Math.hypot(p.x - s.points[0].x, p.y - s.points[0].y) <= tol;
}

function translate(s: Shape, dx: number, dy: number): Shape {
  if (s.type === "rect") return { ...s, x: s.x + dx, y: s.y + dy };
  if (s.type === "circle") return { ...s, centerX: s.centerX + dx, centerY: s.centerY + dy };
  return { ...s, points: s.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
}

export function initDraw(
  canvas: HTMLCanvasElement,
  roomId: number,
  socket: WebSocket,
  getTool: () => Tool
    ): () => void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

  let shapes: Shape[] = [];
  let loaded = false;
  let pending: Event[] = []; // history aane se pehle ke live events
  let active = true;

  // drawing state
  let down = false;
  let start: Point = { x: 0, y: 0 };
  let last: Point = { x: 0, y: 0 };
  let penPoints: Point[] = [];
  let draggingId: string | null = null;
  let moved = false;

  const getPos = (e: MouseEvent): Point => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const send = (ev: Event) =>
    socket.send(JSON.stringify({ type: "chat", roomId, message: JSON.stringify(ev) }));

  function drawShape(s: Shape) {
    ctx!.beginPath();
    if (s.type === "rect") {
      ctx!.strokeRect(s.x, s.y, s.width, s.height);
    } else if (s.type === "circle") {
      ctx!.arc(s.centerX, s.centerY, Math.abs(s.radius), 0, Math.PI * 2);
      ctx!.stroke();
    } else {
      s.points.forEach((p, i) => (i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y)));
      ctx!.stroke();
    }
  }

  function redraw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.fillStyle = "black";
    ctx!.fillRect(0, 0, canvas.width, canvas.height);
    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 2;
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    shapes.forEach(drawShape);
  }

  // preview (mouse drag ke dauran, abhi server ko nahi bheja)
  function drawPreview(p: Point) {
    const tool = getTool();
    ctx!.strokeStyle = "white";
    ctx!.beginPath();
    if (tool === "rect") {
      ctx!.strokeRect(start.x, start.y, p.x - start.x, p.y - start.y);
    } else if (tool === "circle") {
      const c = circleFrom(start, p);
      ctx!.arc(c.centerX, c.centerY, c.radius, 0, Math.PI * 2);
      ctx!.stroke();
    } else if (tool === "pen") {
      penPoints.forEach((q, i) => (i === 0 ? ctx!.moveTo(q.x, q.y) : ctx!.lineTo(q.x, q.y)));
      ctx!.stroke();
    }
  }

  function circleFrom(a: Point, b: Point) {
    return {
      centerX: a.x + (b.x - a.x) / 2,
      centerY: a.y + (b.y - a.y) / 2,
      radius: Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) / 2,
    };
  }

  const topShapeAt = (p: Point) => [...shapes].reverse().find((s) => hitTest(s, p));

  // ---------- history load ----------
  getExistingEvents(roomId).then((events) => {
    if (!active) return;
    let result: Shape[] = [];
    [...events, ...pending].forEach((ev) => (result = applyEvent(result, ev)));
    shapes = result;
    pending = [];
    loaded = true;
    redraw();
  });

  // ---------- live events ----------
  const onMessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type !== "chat" || Number(msg.roomId) !== roomId) return;
      const ev = JSON.parse(msg.message) as Event;
      if (!ev.kind) return;
      if (!loaded) {
        pending.push(ev);
        return;
      }
      shapes = applyEvent(shapes, ev);
      redraw();
    } catch {
      /* ignore */
    }
  };
  socket.addEventListener("message", onMessage);

  // ---------- mouse ----------
  const onDown = (e: MouseEvent) => {
    down = true;
    moved = false;
    start = last = getPos(e);
    const tool = getTool();

    if (tool === "pen") penPoints = [start];
    if (tool === "select") draggingId = topShapeAt(start)?.id ?? null;
    if (tool === "eraser") eraseAt(start);
  };

  function eraseAt(p: Point) {
    const hit = topShapeAt(p);
    if (!hit) return;
    shapes = applyEvent(shapes, { kind: "erase", id: hit.id }); // turant local
    send({ kind: "erase", id: hit.id });
    redraw();
  }

  const onMove = (e: MouseEvent) => {
    const p = getPos(e);
    const tool = getTool();

    // cursor hint
    canvas.style.cursor =
      tool === "select" ? (topShapeAt(p) ? "move" : "default") : tool === "eraser" ? "cell" : "crosshair";

    if (!down) return;

    if (tool === "select" && draggingId) {
      const dx = p.x - last.x, dy = p.y - last.y;
      shapes = shapes.map((s) => (s.id === draggingId ? translate(s, dx, dy) : s));
      last = p;
      moved = true;
      redraw();
      return;
    }
    if (tool === "eraser") {
      eraseAt(p);
      return;
    }
    if (tool === "pen") penPoints.push(p);

    redraw();
    drawPreview(p);
  };

  const onUp = (e: MouseEvent) => {
    if (!down) return;
    down = false;
    const p = getPos(e);
    const tool = getTool();
    const id = crypto.randomUUID();

    if (tool === "select") {
      if (draggingId && moved) {
        const s = shapes.find((x) => x.id === draggingId);
        if (s) send({ kind: "update", shape: s }); // sirf final position bhejo
      }
      draggingId = null;
      return;
    }

    let shape: Shape | null = null;
    if (tool === "rect") {
      if (Math.abs(p.x - start.x) < 3 && Math.abs(p.y - start.y) < 3) return redraw();
      shape = { id, type: "rect", x: start.x, y: start.y, width: p.x - start.x, height: p.y - start.y };
    } else if (tool === "circle") {
      const c = circleFrom(start, p);
      if (c.radius < 2) return redraw();
      shape = { id, type: "circle", ...c };
    } else if (tool === "pen" && penPoints.length > 1) {
      shape = { id, type: "pen", points: penPoints };
    }
    penPoints = [];

    // local push nahi: server broadcast se wapas aayega (sender ko bhi)
    if (shape) send({ kind: "add", shape });
    else redraw();
  };

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  redraw();

  return () => {
    active = false;
    socket.removeEventListener("message", onMessage);
    canvas.removeEventListener("mousedown", onDown);
    canvas.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}

async function getExistingEvents(roomId: number): Promise<Event[]> {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const events: Event[] = [];
    for (const c of res.data.chats as { message: string }[]) {
      try {
        const ev = JSON.parse(c.message);
        if (ev.kind) events.push(ev); // purane format wale skip
      } catch {
        /* text chats skip */
      }
    }
    return events;
  } catch (e) {
    console.error("Failed to load shapes:", e);
    return [];
  }
}