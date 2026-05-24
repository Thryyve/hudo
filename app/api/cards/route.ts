import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createCardSchema = z.object({
  title: z.string().min(1).max(100),
  listId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = createCardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, listId } = validation.data

    const lastCard = await db.card.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
    })

    const order = lastCard ? lastCard.order + 1 : 0

    const card = await db.card.create({
      data: { title, listId, order },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error("[CARDS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
