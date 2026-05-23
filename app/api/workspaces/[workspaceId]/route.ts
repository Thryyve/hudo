import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { include: { user: true } },
        owner: true,
        boards: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const isMember = workspace.members.some(
      (m) => m.userId === session.user!.id
    )

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(workspace)
  } catch (error) {
    console.error("[WORKSPACE_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
