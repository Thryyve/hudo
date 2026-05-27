import { createServer } from "http"
import { Server } from "socket.io"
import { z } from "zod"

const httpServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ status: "ok", service: "hudo" }))
})

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://hudo.vercel.app",
  /\.vercel\.app$/,
]

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
})

// Zod schemas for socket event validation
const CardSchema = z.object({
  id: z.string(),
  title: z.string(),
  listId: z.string(),
  order: z.number(),
  description: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

const ListSchema = z.object({
  id: z.string(),
  title: z.string(),
  boardId: z.string(),
  order: z.number(),
  cards: z.array(CardSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

const CardCreatedSchema = z.object({
  boardId: z.string().min(1),
  listId: z.string().min(1),
  card: CardSchema,
})

const CardDeletedSchema = z.object({
  boardId: z.string().min(1),
  cardId: z.string().min(1),
  listId: z.string().min(1),
})

const CardMovedSchema = z.object({
  boardId: z.string().min(1),
  cardId: z.string().min(1),
  listId: z.string().min(1),
  order: z.number(),
})

const ListCreatedSchema = z.object({
  boardId: z.string().min(1),
  list: ListSchema,
})

const ListDeletedSchema = z.object({
  boardId: z.string().min(1),
  listId: z.string().min(1),
})

// Track which boards each socket has joined
const socketBoardMap = new Map<string, Set<string>>()

io.on("connection", (socket) => {
  socketBoardMap.set(socket.id, new Set())

  socket.on("join-board", (boardId: unknown) => {
    const result = z.string().min(1).safeParse(boardId)
    if (!result.success) {
      socket.emit("error", "Invalid board ID")
      return
    }
    socket.join(result.data)
    socketBoardMap.get(socket.id)?.add(result.data)
  })

  socket.on("leave-board", (boardId: unknown) => {
    const result = z.string().min(1).safeParse(boardId)
    if (!result.success) return
    socket.leave(result.data)
    socketBoardMap.get(socket.id)?.delete(result.data)
  })

  socket.on("card-created", (data: unknown) => {
    const result = CardCreatedSchema.safeParse(data)
    if (!result.success) {
      socket.emit("error", "Invalid card-created payload")
      return
    }
    // Only broadcast if socket is in the board room
    const joinedBoards = socketBoardMap.get(socket.id)
    if (!joinedBoards?.has(result.data.boardId)) {
      socket.emit("error", "Not authorized for this board")
      return
    }
    socket.to(result.data.boardId).emit("card-created", result.data)
  })

  socket.on("card-deleted", (data: unknown) => {
    const result = CardDeletedSchema.safeParse(data)
    if (!result.success) {
      socket.emit("error", "Invalid card-deleted payload")
      return
    }
    const joinedBoards = socketBoardMap.get(socket.id)
    if (!joinedBoards?.has(result.data.boardId)) {
      socket.emit("error", "Not authorized for this board")
      return
    }
    socket.to(result.data.boardId).emit("card-deleted", result.data)
  })

  socket.on("card-moved", (data: unknown) => {
    const result = CardMovedSchema.safeParse(data)
    if (!result.success) {
      socket.emit("error", "Invalid card-moved payload")
      return
    }
    const joinedBoards = socketBoardMap.get(socket.id)
    if (!joinedBoards?.has(result.data.boardId)) {
      socket.emit("error", "Not authorized for this board")
      return
    }
    socket.to(result.data.boardId).emit("card-moved", result.data)
  })

  socket.on("list-created", (data: unknown) => {
    const result = ListCreatedSchema.safeParse(data)
    if (!result.success) {
      socket.emit("error", "Invalid list-created payload")
      return
    }
    const joinedBoards = socketBoardMap.get(socket.id)
    if (!joinedBoards?.has(result.data.boardId)) {
      socket.emit("error", "Not authorized for this board")
      return
    }
    socket.to(result.data.boardId).emit("list-created", result.data)
  })

  socket.on("list-deleted", (data: unknown) => {
    const result = ListDeletedSchema.safeParse(data)
    if (!result.success) {
      socket.emit("error", "Invalid list-deleted payload")
      return
    }
    const joinedBoards = socketBoardMap.get(socket.id)
    if (!joinedBoards?.has(result.data.boardId)) {
      socket.emit("error", "Not authorized for this board")
      return
    }
    socket.to(result.data.boardId).emit("list-deleted", result.data)
  })

  socket.on("disconnect", () => {
    socketBoardMap.delete(socket.id)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
})
