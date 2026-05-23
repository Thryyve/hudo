"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WorkspaceWithMembers } from "@/types"

interface SidebarProps {
  workspaces: WorkspaceWithMembers[]
  onCreateWorkspace: () => void
}

export function Sidebar({ workspaces, onCreateWorkspace }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-xl font-bold text-white tracking-tight">Hudo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <Link href="/dashboard">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </div>
        </Link>

        {/* Workspaces */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workspaces
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 text-slate-500 hover:text-white"
              onClick={onCreateWorkspace}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {workspaces.length === 0 ? (
            <p className="px-3 text-xs text-slate-600">No workspaces yet</p>
          ) : (
            workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname.startsWith(`/workspace/${workspace.id}`)
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}>
                  <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {workspace.name[0].toUpperCase()}
                  </div>
                  <span className="truncate">{workspace.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-800">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </Link>
      </div>
    </aside>
  )
}
