# Hudo

> A modern team task manager with real-time Kanban boards — built for teams that ship and collaborators who stay in sync.

Hudo lets teams organize work in workspaces, boards, lists, and cards — with drag-and-drop ordering and live updates across every connected client. Sign in with GitHub or Google via Auth.js, with database-backed sessions so every API route and board action stays protected. The UI is fast, clean, and built around real collaboration flows.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169e1?style=flat-square&logo=postgresql)](https://supabase.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Stars](https://img.shields.io/github/stars/Thryyve/hudo?style=flat-square)](https://github.com/Thryyve/hudo/stargazers)
[![Forks](https://img.shields.io/github/forks/Thryyve/hudo?style=flat-square)](https://github.com/Thryyve/hudo/network/members)

---

<!-- Add a screenshot or demo GIF here — recommended size: 1280×720 -->
## 📸 Screenshots

| Dashboard | Kanban Board |
|---|---|
| ![Dashboard](./docs/dashboard-demo.png) | ![Kanban Board](./docs/board-demo.png) |

🌐 **Live Demo:** [hudo.vercel.app](https://hudo.vercel.app)  
⚡ **Real-time Server:** Deploy the `server/` Socket.io service separately (e.g. Render) and set `NEXT_PUBLIC_SOCKET_URL` on Vercel

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#️-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Real-time Events](#-real-time-events)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

- [x] OAuth sign-in with GitHub and Google via Auth.js v5 — database sessions with the Prisma adapter
- [x] Workspaces with slug-based routing, descriptions, and owner management
- [x] Invite teammates by email with role checks (`OWNER` · `ADMIN` · `MEMBER`)
- [x] Color-coded boards inside each workspace
- [x] Lists and cards with full CRUD and inline editing
- [x] Drag-and-drop card reordering and cross-list moves via `@dnd-kit`
- [x] Real-time sync across clients with a standalone Socket.io server and board-scoped rooms
- [x] Zod validation on REST API routes and socket event payloads
- [x] Activity logging model for workspace audit trails (schema-ready)
- [x] Responsive UI with Tailwind CSS 4 and shadcn/ui components

---

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| **Framework** | Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5 |
| **Auth** | Auth.js v5 (NextAuth), `@auth/prisma-adapter`, GitHub + Google OAuth |
| **Database** | PostgreSQL (Supabase) via Prisma 6.19.3 and `@prisma/adapter-pg` |
| **Real-time** | Socket.io 4.8.3 (standalone `server/index.ts`) |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons |
| **Interactions** | `@dnd-kit` (drag-and-drop), Sonner (toasts) |
| **Validation** | Zod 4 |
| **DevOps** | Vercel (app + API), Render (socket server), Supabase (database) |

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) **v20+**
- [PostgreSQL](https://www.postgresql.org/) — local instance or [Supabase](https://supabase.com) project
- OAuth apps for [GitHub](https://github.com/settings/developers) and/or [Google](https://console.cloud.google.com/apis/credentials)

### Installation

**1. Clone the repository**

```bash
git clone git@github.com:Thryyve/hudo.git
cd hudo
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment**

Create a `.env` file in the project root:

```env
# Database (Supabase: use Transaction pooler + Direct connection)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth.js
AUTH_SECRET="your_auth_secret_from_openssl_rand_base64_32"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

**4. Set up the database**

```bash
npx prisma migrate dev
```

**5. Generate Prisma client** (if needed)

```bash
npx prisma generate
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection (pooled) | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_URL` | Direct PostgreSQL URL for migrations | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | Auth.js encryption secret | `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | — |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | — |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `NEXT_PUBLIC_APP_URL` | Public app URL (CORS + redirects) | `http://localhost:3000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:3001` |
| `PORT` | Socket server port (production) | `3001` |

### Running the Project

Run Next.js and the Socket.io server together:

```bash
npm run dev:all
```

Or in separate terminals:

**Terminal 1 — Next.js**

```bash
npm run dev
```

**Terminal 2 — Socket.io server**

```bash
npm run socket
```

Open [http://localhost:3000](http://localhost:3000).

**Production build**

```bash
# Next.js
npm run build
npm run start   # runs socket server via package.json "start" script

# For local production preview of the app only:
npx next start
```

> **Note:** In production, deploy the Next.js app and the Socket.io server as separate services. The `start` script runs `server/index.ts`; host the Next.js app on Vercel (or similar) with `next build` + platform start command.

---

## 📁 Project Structure

```
hudo/
├── app/
│   ├── (auth)/                      # Sign-in flow
│   │   └── sign-in/
│   ├── (main)/                      # Protected app shell
│   │   ├── dashboard/               # Workspace overview
│   │   ├── workspace/[workspaceId]/ # Boards in a workspace
│   │   └── board/[boardId]/         # Kanban view + real-time sync
│   └── api/                         # REST API routes
│       ├── auth/[...nextauth]/      # Auth.js handlers
│       ├── workspaces/              # Workspace CRUD + invites + members
│       ├── boards/                  # Board CRUD
│       ├── lists/                   # List CRUD
│       └── cards/                   # Card CRUD + reorder
├── components/
│   ├── ui/                          # shadcn/ui primitives
│   ├── shared/                      # Navbar, sidebar, layout
│   └── modules/                     # Workspace, board, card features
├── lib/
│   ├── auth.ts                      # Auth.js + Prisma adapter config
│   ├── db.ts                        # Prisma client singleton (pg pool)
│   └── validations/                 # Zod schemas per domain
├── server/
│   └── index.ts                     # Standalone Socket.io server
├── prisma/
│   ├── schema.prisma                # Auth.js + app models
│   └── migrations/
└── types/                           # Shared TypeScript types
```

---

## 🌐 API Documentation

All JSON API routes require an authenticated session (Auth.js cookie) unless noted. Unauthorized requests return `401`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/workspaces` | List workspaces for the signed-in user | ✅ |
| `POST` | `/api/workspaces` | Create a workspace (owner membership auto-created) | ✅ |
| `GET` | `/api/workspaces/:workspaceId` | Get workspace with boards | ✅ |
| `POST` | `/api/workspaces/:workspaceId/invite` | Invite member by email (`OWNER` / `ADMIN` only) | ✅ |
| `DELETE` | `/api/workspaces/:workspaceId/members/:memberId` | Remove a workspace member | ✅ |
| `POST` | `/api/boards` | Create a board in a workspace | ✅ |
| `GET` | `/api/boards/:boardId` | Get board with lists and cards | ✅ |
| `DELETE` | `/api/boards/:boardId` | Delete a board | ✅ |
| `POST` | `/api/lists` | Create a list on a board | ✅ |
| `PATCH` | `/api/lists/:listId` | Update list title | ✅ |
| `DELETE` | `/api/lists/:listId` | Delete a list | ✅ |
| `POST` | `/api/cards` | Create a card in a list | ✅ |
| `PATCH` | `/api/cards/:cardId` | Update title, description, `listId`, or `order` | ✅ |
| `DELETE` | `/api/cards/:cardId` | Delete a card | ✅ |

Auth routes are handled by Auth.js at `/api/auth/*` (sign-in, sign-out, callbacks).

**Workspace member roles:** `OWNER` · `ADMIN` · `MEMBER`

---

## ⚡ Real-time Events

Clients connect to the Socket.io server, join a board room, and broadcast changes to other viewers.

| Client → Server | Server → Room | Payload |
|---|---|---|
| `join-board` | — | `boardId` |
| `leave-board` | — | `boardId` |
| `card-created` | `card-created` | `{ boardId, listId, card }` |
| `card-deleted` | `card-deleted` | `{ boardId, cardId, listId }` |
| `card-moved` | `card-moved` | `{ boardId, cardId, listId, order }` |
| `list-created` | `list-created` | `{ boardId, list }` |
| `list-deleted` | `list-deleted` | `{ boardId, listId }` |

Payloads are validated with Zod on the server. Sockets must be in the board room before broadcasting.

---

## 🧪 Testing

This project uses **ESLint** (Next.js config) for static analysis. Run:

```bash
npm run lint
```

Automated unit or E2E tests are not configured yet — contributions welcome.

---

## 🚢 Deployment

| Service | Purpose |
|---|---|
| **Vercel** | Next.js app + API routes |
| **Render** | Socket.io server (`npm start` → `server/index.ts`) |
| **Supabase** | PostgreSQL (`DATABASE_URL` + `DIRECT_URL`) |

**Frontend → Vercel**

1. Import the repository and deploy with the default Next.js settings.
2. Add environment variables: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, OAuth credentials, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SOCKET_URL`.
3. Set OAuth callback URLs to `https://<your-domain>/api/auth/callback/github` (and `/google`).

**Socket server → Render**

1. Create a Web Service pointing at this repo.
2. Build command: `npm install`
3. Start command: `npm start` (runs `npx tsx server/index.ts`)
4. Set `PORT`, `NEXT_PUBLIC_APP_URL` (your Vercel URL), and allow Vercel origins (built into `server/index.ts`).

**Database → Supabase**

1. Create a project and copy the **Transaction** pooler URL → `DATABASE_URL`.
2. Copy the **Direct** connection URL → `DIRECT_URL`.
3. Run `npx prisma migrate deploy` against production.

> **Note:** Render’s free tier spins down after inactivity. The first WebSocket connection after idle may take ~30 seconds on cold start.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `feat/<short-description>`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add card due-date filters
   fix: sync cross-list drag on socket reconnect
   docs: improve deployment notes
   ```
4. Push your branch and open a Pull Request

**Code style:** ESLint via `eslint-config-next` — run `npm run lint` before submitting.

---

## 📄 License

Distributed under the **MIT License**. See the project repository for details.

---

## 👤 Author

Made by **[Aayam Sinha](https://github.com/Thryyve)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0a66c2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/aayam-sinha/)
[![Email](https://img.shields.io/badge/Email-Say%20Hi-ea4335?style=flat-square&logo=gmail)](mailto:sinhaaayam12@gmail.com)
