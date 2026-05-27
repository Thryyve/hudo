"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/shared/sidebar"
import { Navbar } from "@/components/shared/navbar"
import { CreateWorkspaceModal } from "@/components/modules/workspace/create-workspace-modal"
import type { WorkspaceWithMembers, SafeUser } from "@/types"

interface MainShellProps {
  user: SafeUser
  children: React.ReactNode
}

export function MainShell({ user, children }: MainShellProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithMembers[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWorkspaces(data)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        workspaces={workspaces}
        onCreateWorkspace={() => setShowCreateModal(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Navbar user={user} />
        <main className="flex-1 overflow-auto bg-white p-6">{children}</main>
      </div>
      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
