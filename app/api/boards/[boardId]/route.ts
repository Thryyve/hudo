import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = await params

    const board = await db.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: { members: true },
        },
        lists: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const isMember = board.workspace.members.some(
      (m) => m.userId === session.user!.id
    )

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error("[BOARD_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = await params

    await db.board.delete({ where: { id: boardId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[BOARD_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
