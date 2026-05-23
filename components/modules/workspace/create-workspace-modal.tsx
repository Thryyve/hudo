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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CreateWorkspaceModalProps {
  open: boolean
  onClose: () => void
}

export function CreateWorkspaceModal({ open, onClose }: CreateWorkspaceModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to create workspace")
        return
      }

      toast.success("Workspace created!")
      onClose()
      setName("")
      setDescription("")
      router.refresh()
      router.push(`/workspace/${data.id}`)
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
          <DialogTitle className="text-white">Create Workspace</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label className="text-slate-300">Workspace name</Label>
            <Input
              placeholder="e.g. My Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-slate-300">
              Description{" "}
              <span className="text-slate-500 font-normal">(optional)</span>
            </Label>
            <Textarea
              placeholder="What is this workspace for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              rows={3}
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
              disabled={isLoading || !name.trim()}
              className="bg-white text-slate-950 hover:bg-slate-100"
            >
              {isLoading ? "Creating..." : "Create workspace"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
