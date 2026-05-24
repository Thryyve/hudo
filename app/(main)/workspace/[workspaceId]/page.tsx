"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Plus, Layout, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateBoardModal } from "@/components/modules/board/create-board-modal"
import { InviteMemberModal } from "@/components/modules/workspace/invite-member-modal"
import type { WorkspaceMember, User, Board } from "@prisma/client"

type MemberWithUser = WorkspaceMember & { user: User }
type WorkspaceWithDetails = {
  id: string
  name: string
  description: string | null
  ownerId: string
  members: MemberWithUser[]
  boards: Board[]
}

export default function WorkspacePage() {
  const params = useParams()
  const { data: session } = useSession()
  const workspaceId = params.workspaceId as string

  const [workspace, setWorkspace] = useState<WorkspaceWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}`)
      .then((res) => res.json())
      .then((data) => { if (data.id) setWorkspace(data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [workspaceId])

  const handleMemberAdded = (member: MemberWithUser) => {
    setWorkspace((prev) =>
      prev ? { ...prev, members: [...prev.members, member] } : prev
    )
  }

  const handleMemberRemoved = (memberId: string) => {
    setWorkspace((prev) =>
      prev
        ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) }
        : prev
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 bg-slate-100 mb-2" />
        <Skeleton className="h-4 w-64 bg-slate-100 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Workspace not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700">
            {workspace.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-slate-500 text-sm">{workspace.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowMembersModal(true)}
            variant="outline"
            className="gap-2 border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <Users className="w-4 h-4" />
            Members ({workspace.members.length})
          </Button>
          <Button
            onClick={() => setShowCreateBoard(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Board
          </Button>
        </div>
      </div>

      {/* Members avatars */}
      <div
        className="flex items-center gap-2 mb-8 cursor-pointer group w-fit"
        onClick={() => setShowMembersModal(true)}
      >
        <div className="flex -space-x-2">
          {workspace.members.slice(0, 5).map((member) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-700"
              title={member.user.name ?? ""}
            >
              {member.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          ))}
        </div>
        <span className="text-slate-400 text-sm group-hover:text-slate-600 transition-colors">
          {workspace.members.length > 5
            ? `+${workspace.members.length - 5} more`
            : "Manage members"}
        </span>
      </div>

      {/* Boards */}
      {workspace.boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Layout className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No boards yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Create your first board to start managing tasks.
          </p>
          <Button
            onClick={() => setShowCreateBoard(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspace.boards.map((board) => (
            <Link key={board.id} href={`/board/${board.id}`}>
              <div
                className="relative h-32 rounded-xl p-4 flex items-end cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: board.color }}
              >
                <div className="absolute inset-0 rounded-xl bg-black/10" />
                <h3 className="relative text-white font-semibold text-lg leading-tight">
                  {board.title}
                </h3>
              </div>
            </Link>
          ))}
          <button
            onClick={() => setShowCreateBoard(true)}
            className="h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-6 h-6" />
              <span className="text-sm">New board</span>
            </div>
          </button>
        </div>
      )}

      <CreateBoardModal
        open={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
        workspaceId={workspaceId}
      />

      {session?.user && (
        <InviteMemberModal
          open={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          workspaceId={workspaceId}
          members={workspace.members}
          currentUserId={session.user.id as string}
          onMemberAdded={handleMemberAdded}
          onMemberRemoved={handleMemberRemoved}
        />
      )}
    </div>
  )
}
