import { createServer } from "http"
import { Server } from "socket.io"

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  // Join a board room
  socket.on("join-board", (boardId: string) => {
    socket.join(boardId)
    console.log(`[Socket] ${socket.id} joined board: ${boardId}`)
  })

  // Leave a board room
  socket.on("leave-board", (boardId: string) => {
    socket.leave(boardId)
    console.log(`[Socket] ${socket.id} left board: ${boardId}`)
  })

  // Card moved
  socket.on("card-moved", (data: {
    boardId: string
    cardId: string
    listId: string
    order: number
  }) => {
    socket.to(data.boardId).emit("card-moved", data)
  })

  // Card created
  socket.on("card-created", (data: {
    boardId: string
    listId: string
    card: unknown
  }) => {
    socket.to(data.boardId).emit("card-created", data)
  })

  // Card deleted
  socket.on("card-deleted", (data: {
    boardId: string
    cardId: string
    listId: string
  }) => {
    socket.to(data.boardId).emit("card-deleted", data)
  })

  // List created
  socket.on("list-created", (data: {
    boardId: string
    list: unknown
  }) => {
    socket.to(data.boardId).emit("list-created", data)
  })

  // List deleted
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

const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`[Socket] Server running on port ${PORT}`)
})
