import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateCardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  listId: z.string().optional(),
  order: z.number().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cardId } = await params
    const body = await req.json()
    const validation = updateCardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const card = await db.card.update({
      where: { id: cardId },
      data: validation.data,
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error("[CARD_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cardId } = await params

    await db.card.delete({ where: { id: cardId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CARD_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
