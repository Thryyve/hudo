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
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100">
        <span className="text-xl font-bold text-slate-900 tracking-tight">Hudo</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <Link href="/dashboard">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </div>
        </Link>

        <div className="mt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 text-slate-400 hover:text-slate-900"
              onClick={onCreateWorkspace}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {workspaces.length === 0 ? (
            <p className="px-3 text-xs text-slate-400">No workspaces yet</p>
          ) : (
            workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname.startsWith(`/workspace/${workspace.id}`)
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}>
                  <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                    {workspace.name[0].toUpperCase()}
                  </div>
                  <span className="truncate">{workspace.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </Link>
      </div>
    </aside>
  )
}
