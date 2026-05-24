"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import type { WorkspaceMember, User } from "@prisma/client"

type MemberWithUser = WorkspaceMember & { user: User }

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  members: MemberWithUser[]
  currentUserId: string
  onMemberAdded: (member: MemberWithUser) => void
  onMemberRemoved: (memberId: string) => void
}

export function InviteMemberModal({
  open,
  onClose,
  workspaceId,
  members,
  currentUserId,
  onMemberAdded,
  onMemberRemoved,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const currentMember = members.find((m) => m.userId === currentUserId)
  const canManage = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN"

  const handleInvite = async () => {
    if (!email.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to invite member")
        return
      }
      toast.success("Member added successfully!")
      onMemberAdded(data)
      setEmail("")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId)
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${memberId}`,
        { method: "DELETE" }
      )
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to remove member")
        return
      }
      onMemberRemoved(memberId)
      toast.success("Member removed")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setRemovingId(null)
    }
  }

  const roleColor = (role: string) => {
    if (role === "OWNER") return "bg-amber-100 text-amber-700 border-amber-200"
    if (role === "ADMIN") return "bg-blue-100 text-blue-700 border-blue-200"
    return "bg-slate-100 text-slate-600 border-slate-200"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Invite form */}
          {canManage && (
            <div className="flex flex-col gap-2">
              <Label>Invite by email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="colleague@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  type="email"
                />
                <Button
                  onClick={handleInvite}
                  disabled={isLoading || !email.trim()}
                  className="bg-slate-900 text-white hover:bg-slate-800 flex-shrink-0"
                >
                  {isLoading ? "Adding..." : "Invite"}
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                The user must have a Hudo account to be invited.
              </p>
            </div>
          )}

          {/* Members list */}
          <div className="flex flex-col gap-1">
            <Label className="mb-1">
              Members ({members.length})
            </Label>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 flex-shrink-0">
                      {member.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColor(member.role)}`}>
                      {member.role}
                    </span>
                    {canManage &&
                      member.role !== "OWNER" &&
                      member.userId !== currentUserId && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removingId === member.id}
                          className="text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
