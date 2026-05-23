import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  description: z.string().max(200).optional(),
  color: z.string().default("#0ea5e9"),
  workspaceId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = createBoardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, color, workspaceId } = validation.data

    // Verify user is a member of this workspace
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const board = await db.board.create({
      data: {
        title,
        description,
        color,
        workspaceId,
      },
    })

    return NextResponse.json(board, { status: 201 })
  } catch (error) {
    console.error("[BOARDS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
