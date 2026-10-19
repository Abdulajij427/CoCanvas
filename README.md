# CoCanvas

**Built from scratch, with no drawing library: the canvas, shape engine and real-time sync are all hand-written on the HTML Canvas API and raw WebSockets.**

CoCanvas is a real-time collaborative whiteboard, an Excalidraw-style app. Sign in, create or join a room, and draw together: every rectangle, circle, pen stroke, move and erase shows up instantly on everyone's screen.

## Features

- **Auth:** signup and signin with bcrypt-hashed passwords and JWT tokens
- **Rooms:** create a room by name, or join an existing one with the same name
- **Drawing tools:** rectangle, circle, freehand pen, eraser, and a move tool to drag shapes around
- **Live collaboration:** changes sync to everyone in the room over WebSockets
- **Persistence:** every action is saved in PostgreSQL, so reopening a room restores the canvas
- **Access control:** only room members can read history or send drawings, checked on both HTTP and WebSocket

## Tech stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, HTML Canvas API |
| HTTP backend | Node.js, Express, TypeScript |
| Real-time backend | `ws` (WebSocket server), TypeScript |
| Database | PostgreSQL with `pg` (plain SQL, no ORM) |
| Validation | Zod |
| Auth | bcrypt, jsonwebtoken |

## Project structure

```
CoCanvas/
├── apps/
│   ├── frontend/        # Next.js app (landing, auth, dashboard, canvas)
│   ├── http-backend/    # REST API: auth, rooms, chat history  (port 3000)
│   └── ws-backend/      # WebSocket server: live drawing sync  (port 8000)
└── packages/
    ├── db/              # PostgreSQL pool + table creation
    ├── schema/          # Shared Zod schemas
    ├── backend-common/  # Shared config (JWT secret)
    └── typescript-config/
```

## How it works

Drawing is **event-based**. Shapes are never saved directly. Every action is an event:

```
add    -> a new shape
update -> a shape moved to a new position
erase  -> a shape deleted
```

```
Mouse action -> event -> WebSocket server -> saved in PostgreSQL
             -> broadcast to everyone in the room -> each client applies it -> redraw
```

When you open a room, the client fetches the saved events over HTTP and replays them in order to rebuild the canvas. Because events are applied by shape `id`, applying the same event twice is harmless, so no duplicates appear.

HTTP handles setup and history (auth, rooms, old events). WebSockets handle everything live.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL running locally

### 1. Clone and install

```bash
git clone https://github.com/Abdulajij427/CoCanvas.git
cd CoCanvas
pnpm install
```

If pnpm blocks build scripts, allow them in `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  bcrypt: true
  unrs-resolver: true
```

### 2. Environment variables

Create `packages/db/.env`:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME
```

Set the JWT secret in `packages/backend-common` (use a long random value, never commit it).

### 3. Build shared packages

```bash
pnpm --filter @repo/db build
pnpm --filter @repo/schema build
pnpm --filter @repo/backend-common build
```

Run this again whenever you change a shared package.

### 4. Run the three servers

Use three terminals:

```bash
pnpm --filter http-backend dev     # http://localhost:3000
pnpm --filter ws-backend dev       # ws://localhost:8000
pnpm --filter frontend dev         # http://localhost:3001
```

Tables are created automatically when the HTTP backend starts.

### 5. Try it

1. Open `http://localhost:3001/signup` and create an account, then sign in.
2. Go to `/dashboard`, enter a room name and click **Create room**.
3. In a second browser (or incognito), sign up another user, then **Join room** with the same name.
4. Draw on one screen and watch it appear on the other.

## API overview

Base URL: `http://localhost:3000/api/v1/user`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/signup` | No | Create an account |
| POST | `/signin` | No | Get a JWT |
| POST | `/room` | Yes | Create a room |
| GET | `/room/:slug` | No | Get room id from its name |
| POST | `/room/:slug/join` | Yes | Join a room |
| GET | `/chat/:roomId` | Yes | Load saved drawing events |

Protected routes expect `Authorization: Bearer <token>`. The WebSocket connects to `ws://localhost:8000?token=<token>` and understands `join_room`, `leave_room` and `chat` messages.

## Roadmap

- [ ] Pagination for long drawing history
- [ ] Colors, stroke width and text tool
- [ ] Undo / redo
- [ ] Live cursors for other users
- [ ] Shareable room links
- [ ] httpOnly cookie auth instead of localStorage

## Author

Built by [Abdul](https://github.com/Abdulajij427).
