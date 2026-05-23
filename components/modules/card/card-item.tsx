"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Card } from "@prisma/client"

interface CardItemProps {
  card: Card
  onDelete: (cardId: string) => void
  onUpdate: (cardId: string, title: string) => void
}

export function CardItem({ card, onDelete, onUpdate }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || title === card.title) {
      setTitle(card.title)
      setIsEditing(false)
      return
    }

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      })

      if (!res.ok) throw new Error()

      onUpdate(card.id, title.trim())
      setIsEditing(false)
    } catch {
      toast.error("Failed to update card")
      setTitle(card.title)
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      onDelete(card.id)
    } catch {
      toast.error("Failed to delete card")
      setIsDeleting(false)
    }
  }

  return (
    <div className="group bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors">
      {isEditing ? (
        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSave()
            }
            if (e.key === "Escape") {
              setTitle(card.title)
              setIsEditing(false)
            }
          }}
          className="w-full bg-transparent text-white text-sm resize-none outline-none"
          rows={2}
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-white text-sm cursor-pointer flex-1"
            onClick={() => setIsEditing(true)}
          >
            {card.title}
          </p>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
