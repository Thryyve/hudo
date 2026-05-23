"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { io, type Socket } from "socket.io-client"
import { Skeleton } from "@/components/ui/skeleton"
import { ListItem } from "@/components/modules/board/list-item"
import { CardItem } from "@/components/modules/card/card-item"
import type { Board, List, Card } from "@prisma/client"

type ListWithCards = List & { cards: Card[] }
type BoardWithLists = Board & {
  lists: ListWithCards[]
  workspace: { id: string; name: string }
}

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string

  const [board, setBoard] = useState<BoardWithLists | null>(null)
  const [lists, setLists] = useState<ListWithCards[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Socket setup
  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      { transports: ["websocket"] }
    )
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("join-board", boardId)
    })

    socket.on("card-moved", (data: { cardId: string; listId: string; order: number }) => {
      setLists((prev) => {
        const card = prev.flatMap((l) => l.cards).find((c) => c.id === data.cardId)
        if (!card) return prev
        return prev.map((list) => {
          if (list.id === card.listId && list.id !== data.listId) {
            return { ...list, cards: list.cards.filter((c) => c.id !== data.cardId) }
          }
          if (list.id === data.listId) {
            const exists = list.cards.some((c) => c.id === data.cardId)
            if (!exists) return { ...list, cards: [...list.cards, { ...card, listId: data.listId }] }
          }
          return list
        })
      })
    })

    socket.on("card-created", (data: { listId: string; card: Card }) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === data.listId
            ? { ...list, cards: [...list.cards, data.card] }
            : list
        )
      )
    })

    socket.on("card-deleted", (data: { cardId: string }) => {
      setLists((prev) =>
        prev.map((list) => ({
          ...list,
          cards: list.cards.filter((c) => c.id !== data.cardId),
        }))
      )
    })

    socket.on("list-created", (data: { list: ListWithCards }) => {
      setLists((prev) => [...prev, data.list])
    })

    socket.on("list-deleted", (data: { listId: string }) => {
      setLists((prev) => prev.filter((l) => l.id !== data.listId))
    })

    return () => {
      socket.emit("leave-board", boardId)
      socket.disconnect()
    }
  }, [boardId])

  // Fetch board
  useEffect(() => {
    fetch(`/api/boards/${boardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setBoard(data)
          setLists(data.lists)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [boardId])

  const handleDragStart = (event: DragStartEvent) => {
    const card = lists.flatMap((l) => l.cards).find((c) => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeList = lists.find((l) => l.cards.some((c) => c.id === activeId))
    const overList =
      lists.find((l) => l.cards.some((c) => c.id === overId)) ||
      lists.find((l) => l.id === overId)

    if (!activeList || !overList || activeList.id === overList.id) return

    setLists((prev) => {
      const activeCard = activeList.cards.find((c) => c.id === activeId)!
      return prev.map((list) => {
        if (list.id === activeList.id) {
          return { ...list, cards: list.cards.filter((c) => c.id !== activeId) }
        }
        if (list.id === overList.id) {
          return { ...list, cards: [...list.cards, activeCard] }
        }
        return list
      })
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeList = lists.find((l) => l.cards.some((c) => c.id === activeId))
    if (!activeList) return

    if (activeList.cards.some((c) => c.id === overId)) {
      const oldIndex = activeList.cards.findIndex((c) => c.id === activeId)
      const newIndex = activeList.cards.findIndex((c) => c.id === overId)
      setLists((prev) =>
        prev.map((list) => {
          if (list.id !== activeList.id) return list
          return { ...list, cards: arrayMove(list.cards, oldIndex, newIndex) }
        })
      )
    }

    const updatedList = lists.find((l) => l.cards.some((c) => c.id === activeId))
    if (!updatedList) return

    const newOrder = updatedList.cards.findIndex((c) => c.id === activeId)

    try {
      await fetch(`/api/cards/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: updatedList.id, order: newOrder }),
      })

      socketRef.current?.emit("card-moved", {
        boardId,
        cardId: activeId,
        listId: updatedList.id,
        order: newOrder,
      })
    } catch {
      toast.error("Failed to save card position")
    }
  }

  const handleAddList = async () => {
    if (!newListTitle.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newListTitle.trim(), boardId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLists((prev) => [...prev, data])
      setNewListTitle("")
      setIsAddingList(false)

      socketRef.current?.emit("list-created", { boardId, list: data })
    } catch {
      toast.error("Failed to add list")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleListDelete = (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId))
    socketRef.current?.emit("list-deleted", { boardId, listId })
  }

  const handleListUpdate = (listId: string, title: string) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, title } : l))
    )
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 p-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-72 h-96 rounded-xl bg-slate-800 flex-shrink-0" />
        ))}
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Board not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-6 py-4 flex items-center gap-4 border-b border-white/10"
        style={{ backgroundColor: board.color + "33" }}
      >
        <button
          onClick={() => router.push(`/workspace/${board.workspace.id}`)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white font-bold text-xl">{board.title}</h1>
          <p className="text-white/60 text-sm">{board.workspace.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 min-h-full items-start">
            {lists.map((list) => (
              <ListItem
                key={list.id}
                list={list}
                onDelete={handleListDelete}
                onUpdate={handleListUpdate}
                socket={socketRef.current}
                boardId={boardId}
              />
            ))}

            {isAddingList ? (
              <div className="flex-shrink-0 w-72 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <input
                  autoFocus
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList()
                    if (e.key === "Escape") {
                      setIsAddingList(false)
                      setNewListTitle("")
                    }
                  }}
                  placeholder="List title..."
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-slate-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddList}
                    disabled={isSubmitting || !newListTitle.trim()}
                    className="bg-white text-slate-950 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  >
                    Add list
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false)
                      setNewListTitle("")
                    }}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="flex-shrink-0 w-72 h-12 bg-slate-900/50 border border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-slate-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add list</span>
              </button>
            )}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-2 opacity-90">
                <CardItem
                  card={activeCard}
                  onDelete={() => {}}
                  onUpdate={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
