"use client"

import { useState } from "react"
import { Plus, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CardItem } from "@/components/modules/card/card-item"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { List, Card } from "@prisma/client"

type ListWithCards = List & { cards: Card[] }

interface ListItemProps {
  list: ListWithCards
  onDelete: (listId: string) => void
  onUpdate: (listId: string, title: string) => void
}

export function ListItem({ list, onDelete, onUpdate }: ListItemProps) {
  const [cards, setCards] = useState<Card[]>(list.cards)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setNodeRef } = useDroppable({ id: list.id })

  if (list.cards !== cards && !isAddingCard) {
    setCards(list.cards)
  }

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newCardTitle.trim(), listId: list.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCards((prev) => [...prev, data])
      setNewCardTitle("")
      setIsAddingCard(false)
    } catch {
      toast.error("Failed to add card")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveTitle = async () => {
    if (!title.trim() || title === list.title) {
      setTitle(list.title)
      setIsEditingTitle(false)
      return
    }
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      })
      if (!res.ok) throw new Error()
      onUpdate(list.id, title.trim())
      setIsEditingTitle(false)
    } catch {
      toast.error("Failed to update list")
      setTitle(list.title)
      setIsEditingTitle(false)
    }
  }

  const handleDeleteList = async () => {
    try {
      const res = await fetch(`/api/lists/${list.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      onDelete(list.id)
    } catch {
      toast.error("Failed to delete list")
    }
  }

  const handleCardDelete = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  const handleCardUpdate = (cardId: string, newTitle: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, title: newTitle } : c))
    )
  }

  return (
    <div className="flex-shrink-0 w-72 bg-slate-900 border border-slate-800 rounded-xl flex flex-col max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle()
              if (e.key === "Escape") {
                setTitle(list.title)
                setIsEditingTitle(false)
              }
            }}
            className="flex-1 bg-slate-800 text-white text-sm font-semibold rounded px-2 py-1 outline-none"
          />
        ) : (
          <h3
            className="text-white font-semibold text-sm cursor-pointer flex-1 px-1"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h3>
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">{list.cards.length}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-slate-500 hover:text-white transition-colors p-1 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem
                onClick={handleDeleteList}
                className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-800 cursor-pointer gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 min-h-[40px]">
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onDelete={handleCardDelete}
              onUpdate={handleCardUpdate}
            />
          ))}
        </SortableContext>

        {isAddingCard && (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddCard()
                }
                if (e.key === "Escape") {
                  setIsAddingCard(false)
                  setNewCardTitle("")
                }
              }}
              placeholder="Card title..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2 resize-none outline-none placeholder:text-slate-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                disabled={isSubmitting || !newCardTitle.trim()}
                className="bg-white text-slate-950 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false)
                  setNewCardTitle("")
                }}
                className="text-slate-400 hover:text-white text-xs px-2 py-1.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Card */}
      {!isAddingCard && (
        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center gap-2 px-3 py-3 text-slate-500 hover:text-white text-sm transition-colors border-t border-slate-800 rounded-b-xl hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add card
        </button>
      )}
    </div>
  )
}
