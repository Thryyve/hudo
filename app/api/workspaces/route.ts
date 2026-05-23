import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createWorkspaceSchema } from "@/lib/validations/workspace"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() + "-" + Math.random().toString(36).substring(2, 7)
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = createWorkspaceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description } = validation.data

    const workspace = await db.workspace.create({
      data: {
        name,
        description,
        slug: generateSlug(name),
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        owner: true,
      },
    })

    return NextResponse.json(workspace, { status: 201 })
  } catch (error) {
    console.error("[WORKSPACE_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        owner: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(workspaces)
  } catch (error) {
    console.error("[WORKSPACE_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
