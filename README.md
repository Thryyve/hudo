# Hudo — Team Task Manager

A real-time collaborative task management SaaS built with Next.js, TypeScript, and Socket.io. Organize work with boards, lists, and cards — inspired by Trello.

![Hudo Dashboard](https://placehold.co/1200x630/f8fafc/1e293b?text=Hudo+Task+Manager)

## Features

- **Authentication** — Secure sign in with GitHub and Google via Auth.js v5
- **Workspaces** — Create and manage team workspaces with role-based access
- **Boards** — Organize work with color-coded boards inside workspaces
- **Lists & Cards** — Full CRUD for lists and cards with inline editing
- **Drag and Drop** — Reorder and move cards across lists with @dnd-kit
- **Real-time Sync** — Live updates across all connected clients via Socket.io
- **Responsive UI** — Clean light theme built with Tailwind CSS and shadcn/ui

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Auth.js v5 (NextAuth) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Styling | Tailwind CSS + shadcn/ui |
| Real-time | Socket.io |
| State | React hooks + Zustand |
| Drag & Drop | @dnd-kit |
| Deployment | Vercel + Railway |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- GitHub OAuth app

### Installation

1. Clone the repository

```bash
git clone https://github.com/Thryyve/hudo.git
cd hudo
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="your-supabase-transaction-pooler-url"
DIRECT_URL="your-supabase-direct-connection-url"
AUTH_SECRET="your-auth-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

4. Set up the database

```bash
npx prisma migrate dev
```

5. Run the development servers

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Socket.io
npm run socket
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
hudo/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages
│   ├── (main)/                 # Protected app pages
│   │   ├── dashboard/          # Workspace overview
│   │   ├── workspace/[id]/     # Workspace boards
│   │   └── board/[id]/         # Board with lists and cards
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── shared/                 # Sidebar, Navbar
│   └── modules/                # Board, Card, Workspace components
├── lib/
│   ├── auth.ts                 # Auth.js config
│   ├── db.ts                   # Prisma client
│   └── validations/            # Zod schemas
├── server/
│   └── index.ts                # Socket.io server
├── hooks/                      # Custom React hooks
├── store/                      # Zustand stores
├── types/                      # TypeScript types
└── prisma/
└── schema.prisma           # Database schema

## Architecture

- **Next.js App Router** with route groups for auth and protected pages
- **Server-side API routes** with Zod validation and proper error handling
- **Prisma ORM** with PostgreSQL for type-safe database access
- **Auth.js** database sessions with OAuth providers
- **Socket.io** standalone server for real-time events across board rooms
- **@dnd-kit** for accessible drag and drop with optimistic UI updates

## License

MIT
