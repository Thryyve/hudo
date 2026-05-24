import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateListSchema = z.object({
  title: z.string().min(1).max(50),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listId } = await params
    const body = await req.json()
    const validation = updateListSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const list = await db.list.update({
      where: { id: listId },
      data: { title: validation.data.title },
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error("[LIST_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listId } = await params

    await db.list.delete({ where: { id: listId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LIST_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
