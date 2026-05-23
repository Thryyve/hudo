import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createListSchema = z.object({
  title: z.string().min(1).max(50),
  boardId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = createListSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, boardId } = validation.data

    // Verify board exists and user has access
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: { workspace: { include: { members: true } } },
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 })
    }

    const isMember = board.workspace.members.some(
      (m) => m.userId === session.user!.id
    )

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the highest order value
    const lastList = await db.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    })

    const order = lastList ? lastList.order + 1 : 0

    const list = await db.list.create({
      data: { title, boardId, order },
      include: { cards: true },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error("[LISTS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
