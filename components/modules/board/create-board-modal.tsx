"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const BOARD_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
]

interface CreateBoardModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
}

export function CreateBoardModal({
  open,
  onClose,
  workspaceId,
}: CreateBoardModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [color, setColor] = useState(BOARD_COLORS[0])

  const handleSubmit = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          color,
          workspaceId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to create board")
        return
      }

      toast.success("Board created!")
      onClose()
      setTitle("")
      setColor(BOARD_COLORS[0])
      router.push(`/board/${data.id}`)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create Board</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Preview */}
          <div
            className="w-full h-24 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="text-white font-semibold text-lg opacity-90">
              {title || "Board name"}
            </span>
          </div>

          {/* Color Picker */}
          <div className="flex gap-2 flex-wrap">
            {BOARD_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform",
                  color === c && "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label className="text-slate-300">Board title</Label>
            <Input
              placeholder="e.g. Product Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title.trim()}
              className="bg-white text-slate-950 hover:bg-slate-100"
            >
              {isLoading ? "Creating..." : "Create board"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
