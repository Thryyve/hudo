"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Plus, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateWorkspaceModal } from "@/components/modules/workspace/create-workspace-modal"
import type { WorkspaceWithMembers } from "@/types"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<WorkspaceWithMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setWorkspaces(data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good day, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here are your workspaces</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Layout className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No workspaces yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Create your first workspace to start organizing your team's work.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
              <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700 group-hover:bg-slate-200 transition-colors">
                    {workspace.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 font-semibold truncate">{workspace.name}</h3>
                    <p className="text-slate-400 text-xs">
                      {workspace.members.length}{" "}
                      {workspace.members.length === 1 ? "member" : "members"}
                    </p>
                  </div>
                </div>
                {workspace.description && (
                  <p className="text-slate-500 text-sm line-clamp-2">{workspace.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
