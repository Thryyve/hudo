import { createServer } from "http"
import { Server } from "socket.io"

const httpServer = createServer((req, res) => {
  // Health check endpoint for Railway
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok", service: "hudo-socket" }))
    return
  }
  res.writeHead(404)
  res.end()
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

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  socket.on("join-board", (boardId: string) => {
    socket.join(boardId)
    console.log(`[Socket] ${socket.id} joined board: ${boardId}`)
  })

  socket.on("leave-board", (boardId: string) => {
    socket.leave(boardId)
  })

  socket.on("card-moved", (data: {
    boardId: string
    cardId: string
    listId: string
    order: number
  }) => {
    socket.to(data.boardId).emit("card-moved", data)
  })

  socket.on("card-created", (data: {
    boardId: string
    listId: string
    card: unknown
  }) => {
    socket.to(data.boardId).emit("card-created", data)
  })

  socket.on("card-deleted", (data: {
    boardId: string
    cardId: string
    listId: string
  }) => {
    socket.to(data.boardId).emit("card-deleted", data)
  })

  socket.on("list-created", (data: {
    boardId: string
    list: unknown
  }) => {
    socket.to(data.boardId).emit("list-created", data)
  })

  socket.on("list-deleted", (data: {
    boardId: string
    listId: string
  }) => {
    socket.to(data.boardId).emit("list-deleted", data)
  })

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`[Socket] Server running on port ${PORT}`)
})
