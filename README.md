# Hudo

A real-time collaborative task management SaaS. Organize your team's work with boards, lists, and cards — with live updates across all connected clients.

**Live Demo:** [hudo.vercel.app](https://hudo.vercel.app)

---

## Screenshots

> Dashboard · Workspace · Board

![Hudo](https://placehold.co/1200x600/f8fafc/0f172a?text=Hudo+—+Team+Task+Manager)

---

## Features

- **Authentication** — Sign in with GitHub or Google via Auth.js v5
- **Workspaces** — Create workspaces, invite members by email, manage roles
- **Boards** — Color-coded boards inside each workspace
- **Lists & Cards** — Full CRUD with inline editing and instant feedback
- **Drag and Drop** — Reorder cards within lists and move them across lists
- **Real-time Sync** — All connected clients see changes instantly via Socket.io
- **Role-based Access** — Owner, Admin, and Member roles per workspace
- **Responsive UI** — Clean light theme, works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Authentication | Auth.js v5 (NextAuth) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Styling | Tailwind CSS + shadcn/ui |
| Real-time | Socket.io |
| Drag & Drop | @dnd-kit |
| Validation | Zod |
| Deployment | Vercel + Render |

---

## Architecture
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   Supabase DB    │     │  Socket Server  │
│   (Vercel)      │     │   (PostgreSQL)   │     │  (Render)       │
│                 │     │                  │     │                 │
│  App Router     │     │  Prisma ORM      │     │  Socket.io      │
│  API Routes     │     │  6 tables        │     │  Room-based     │
│  Auth.js        │     │                  │     │  broadcasting   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
│                                                  │
└──────────────────────────────────────────────────┘
WebSocket connection

**Key decisions:**
- App Router with route groups `(auth)` and `(main)` for clean separation
- Database sessions via Auth.js + Prisma adapter for secure, persistent auth
- Standalone Socket.io server separate from Next.js for true WebSocket support
- All state managed at the board level and passed down — no unnecessary re-renders
- Zod validation on every API route with proper HTTP status codes

---

## Database Schema
User ──────── WorkspaceMember ──── Workspace
│
Board
│
List
│
Card
│
Activity

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- GitHub OAuth app credentials
- Google OAuth app credentials (optional)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Thryyve/hudo.git
cd hudo
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# Database
DATABASE_URL="your-supabase-transaction-pooler-url"
DIRECT_URL="your-supabase-direct-connection-url"

# Auth
AUTH_SECRET="your-auth-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

**4. Set up the database**

```bash
npx prisma migrate dev
```

**5. Run the development servers**

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Socket.io server
npm run socket
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure
hudo/
├── app/
│   ├── (auth)/                 # Sign in page
│   ├── (main)/                 # Protected pages
│   │   ├── dashboard/          # Workspace overview
│   │   ├── workspace/[id]/     # Boards inside workspace
│   │   └── board/[id]/         # Lists and cards
│   └── api/                    # REST API routes
│       ├── auth/               # Auth.js handlers
│       ├── workspaces/         # Workspace + invite APIs
│       ├── boards/             # Board CRUD
│       ├── lists/              # List CRUD
│       └── cards/              # Card CRUD
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── shared/                 # Sidebar, Navbar
│   └── modules/                # Feature components
│       ├── board/              # Board, List, Create modal
│       ├── card/               # Card item
│       └── workspace/          # Workspace, Invite modals
├── lib/
│   ├── auth.ts                 # Auth.js configuration
│   ├── db.ts                   # Prisma client singleton
│   └── validations/            # Zod schemas
├── server/
│   └── index.ts                # Standalone Socket.io server
├── hooks/                      # Custom React hooks
├── types/                      # Global TypeScript types
└── prisma/
├── schema.prisma            # Database schema
└── migrations/             # Migration history

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workspaces` | Get user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/:id` | Get workspace with boards |
| POST | `/api/workspaces/:id/invite` | Invite member by email |
| DELETE | `/api/workspaces/:id/members/:memberId` | Remove member |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with lists and cards |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/lists` | Create list |
| PATCH | `/api/lists/:id` | Update list title |
| DELETE | `/api/lists/:id` | Delete list |
| POST | `/api/cards` | Create card |
| PATCH | `/api/cards/:id` | Update card (title, order, listId) |
| DELETE | `/api/cards/:id` | Delete card |

---

## Real-time Events

The Socket.io server broadcasts these events to all clients in the same board room:

| Event | Trigger | Payload |
|---|---|---|
| `card-created` | Card added | `{ boardId, listId, card }` |
| `card-deleted` | Card removed | `{ boardId, cardId, listId }` |
| `card-moved` | Card dragged | `{ boardId, cardId, listId, order }` |
| `list-created` | List added | `{ boardId, list }` |
| `list-deleted` | List removed | `{ boardId, listId }` |

---

## Deployment

| Service | Purpose | Plan |
|---|---|---|
| Vercel | Next.js app + API routes | Free |
| Render | Socket.io server | Free |
| Supabase | PostgreSQL database | Free |

**Note:** Render's free tier spins down after 15 minutes of inactivity. The first real-time connection after a period of inactivity may take ~30 seconds to establish while the server warms up.

---

## Local Development Notes

- Prisma migrations use `DIRECT_URL` (direct connection) and the app uses `DATABASE_URL` (transaction pooler) for Supabase compatibility
- Auth.js v5 uses database sessions — all session data is stored in PostgreSQL
- The Socket.io server runs on port 3001 separately from Next.js on port 3000
- `allowDangerousEmailAccountLinking: true` is set to allow the same email to sign in with both GitHub and Google

---

## License

MIT

---

Built by [Aayam Sinha](https://github.com/Thryyve)
