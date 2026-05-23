"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/shared/sidebar"
import { Navbar } from "@/components/shared/navbar"
import { CreateWorkspaceModal } from "@/components/modules/workspace/create-workspace-modal"
import type { WorkspaceWithMembers, SafeUser } from "@/types"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<WorkspaceWithMembers[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetch("/api/workspaces")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setWorkspaces(data)
        })
        .catch(console.error)
    }
  }, [session])

  const user: SafeUser | null = session?.user
    ? {
        id: session.user.id as string,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar
        workspaces={workspaces}
        onCreateWorkspace={() => setShowCreateModal(true)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
