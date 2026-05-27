"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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

let boardSocket: Socket | null = null

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
  const listsRef = useRef<ListWithCards[]>([])
  const dragSourceListIdRef = useRef<string | null>(null)

  useEffect(() => {
    listsRef.current = lists
  }, [lists])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    if (!boardSocket) {
      boardSocket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        { transports: ["websocket"] }
      )
    }

    const socket = boardSocket

    socket.on("connect", () => { socket.emit("join-board", boardId) })
    socket.on("card-moved", (data: { cardId: string; listId: string; order: number }) => {
      setLists((prev) => {
        // Find the card in any list
        const movedCard = prev.flatMap((l) => l.cards).find((c) => c.id === data.cardId)
        if (!movedCard) return prev

        // Remove from all lists first
        const listsWithoutCard = prev.map((list) => ({
          ...list,
          cards: list.cards.filter((c) => c.id !== data.cardId),
        }))

        // Add to target list at correct position
        return listsWithoutCard.map((list) => {
          if (list.id === data.listId) {
            const updatedCard = { ...movedCard, listId: data.listId }
            const newCards = [...list.cards]
            newCards.splice(data.order, 0, updatedCard)
            return { ...list, cards: newCards }
          }
          return list
        })
      })
    })
    socket.on("card-created", (data: { listId: string; card: Card }) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === data.listId ? { ...list, cards: [...list.cards, data.card] } : list
        )
      )
    })
    socket.on("card-deleted", (data: { cardId: string; listId: string }) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === data.listId
            ? { ...list, cards: list.cards.filter((c) => c.id !== data.cardId) }
            : list
        )
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
      boardSocket = null
    }
  }, [boardId])

  useEffect(() => {
    fetch(`/api/boards/${boardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) { setBoard(data); setLists(data.lists) }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [boardId])

  const handleCardAdd = (listId: string, card: Card) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, card] } : list
      )
    )
  }

  const handleCardDelete = (listId: string, cardId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, cards: list.cards.filter((c) => c.id !== cardId) }
          : list
      )
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    const card = listsRef.current.flatMap((l) => l.cards).find((c) => c.id === event.active.id)
    if (!card) return
    const sourceList = listsRef.current.find((l) => l.cards.some((c) => c.id === card.id))
    dragSourceListIdRef.current = sourceList?.id ?? card.listId
    setActiveCard(card)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const currentLists = listsRef.current
    const activeList = currentLists.find((l) => l.cards.some((c) => c.id === activeId))
    const overList =
      currentLists.find((l) => l.cards.some((c) => c.id === overId)) ||
      currentLists.find((l) => l.id === overId)

    if (!activeList || !overList || activeList.id === overList.id) return

    setLists((prev) => {
      const activeCard = prev.flatMap((l) => l.cards).find((c) => c.id === activeId)!
      const movedCard = { ...activeCard, listId: overList.id }
      return prev.map((list) => {
        if (list.id === activeList.id) return { ...list, cards: list.cards.filter((c) => c.id !== activeId) }
        if (list.id === overList.id) return { ...list, cards: [...list.cards, movedCard] }
        return list
      })
    })
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    const sourceListId = dragSourceListIdRef.current
    dragSourceListIdRef.current = null

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const currentLists = listsRef.current
    const overList =
      currentLists.find((l) => l.id === overId) ||
      currentLists.find((l) => l.cards.some((c) => c.id === overId))
    if (!overList) return

    const activeList = currentLists.find((l) => l.cards.some((c) => c.id === activeId))
    if (!activeList) return

    const isCrossList = sourceListId !== null && sourceListId !== overList.id

    if (!isCrossList) {
      if (!activeList.cards.some((c) => c.id === overId)) return

      const oldIndex = activeList.cards.findIndex((c) => c.id === activeId)
      const newIndex = activeList.cards.findIndex((c) => c.id === overId)
      if (oldIndex === newIndex) return

      const reordered = arrayMove(activeList.cards, oldIndex, newIndex)

      setLists((prev) =>
        prev.map((list) =>
          list.id === activeList.id ? { ...list, cards: reordered } : list
        )
      )

      try {
        const results = await Promise.all(
          reordered.map((card, index) =>
            fetch(`/api/cards/${card.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: index }),
            })
          )
        )
        if (results.some((r) => !r.ok)) throw new Error()
        boardSocket?.emit("card-moved", {
          boardId,
          cardId: activeId,
          listId: activeList.id,
          order: newIndex,
        })
      } catch {
        toast.error("Failed to save card order")
      }
      return
    }

    const destWithoutActive = overList.cards.filter((c) => c.id !== activeId)
    const newOrder = overList.cards.some((c) => c.id === overId)
      ? destWithoutActive.findIndex((c) => c.id === overId)
      : destWithoutActive.length

    const card = currentLists.flatMap((l) => l.cards).find((c) => c.id === activeId)
    if (!card) return

    const updatedCard = { ...card, listId: overList.id }

    setLists((prev) => {
      const listsWithoutCard = prev.map((list) => ({
        ...list,
        cards: list.cards.filter((c) => c.id !== activeId),
      }))
      return listsWithoutCard.map((list) => {
        if (list.id !== overList.id) return list
        const cards = [...list.cards]
        cards.splice(newOrder, 0, updatedCard)
        return { ...list, cards }
      })
    })

    try {
      const res = await fetch(`/api/cards/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: overList.id, order: newOrder }),
      })
      if (!res.ok) throw new Error()
      boardSocket?.emit("card-moved", {
        boardId,
        cardId: activeId,
        listId: overList.id,
        order: newOrder,
      })
    } catch {
      toast.error("Failed to save card position")
    }
  }, [boardId])

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
      boardSocket?.emit("list-created", { boardId, list: data })
    } catch {
      toast.error("Failed to add list")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleListDelete = (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId))
    boardSocket?.emit("list-deleted", { boardId, listId })
  }

  const handleListUpdate = (listId: string, title: string) => {
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, title } : l)))
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 p-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-72 h-96 rounded-xl bg-slate-100 flex-shrink-0" />
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
    <div className="flex flex-col h-full bg-white">
      <div
        className="px-6 py-4 flex items-center gap-4 border-b border-black/10"
        style={{ backgroundColor: board.color + "22" }}
      >
        <button
          onClick={() => router.push(`/workspace/${board.workspace.id}`)}
          className="text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-slate-900 font-bold text-xl">{board.title}</h1>
          <p className="text-slate-500 text-sm">{board.workspace.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-slate-50">
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
                onCardAdd={handleCardAdd}
                onCardDelete={handleCardDelete}
                socket={boardSocket}
                boardId={boardId}
              />
            ))}

            {isAddingList ? (
              <div className="flex-shrink-0 w-72 bg-slate-100 rounded-xl p-3 flex flex-col gap-2">
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
                  className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2 outline-none placeholder:text-slate-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddList}
                    disabled={isSubmitting || !newListTitle.trim()}
                    className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    Add list
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false)
                      setNewListTitle("")
                    }}
                    className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="flex-shrink-0 w-72 h-12 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
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
