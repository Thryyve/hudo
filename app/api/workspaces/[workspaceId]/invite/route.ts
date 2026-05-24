import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params
    const body = await req.json()
    const validation = inviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Check if inviter is OWNER or ADMIN
    const inviterMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!inviterMember || inviterMember.role === "MEMBER") {
      return NextResponse.json(
        { error: "Only owners and admins can invite members" },
        { status: 403 }
      )
    }

    // Find user by email
    const userToInvite = await db.user.findUnique({
      where: { email },
    })

    if (!userToInvite) {
      return NextResponse.json(
        { error: "No user found with that email. They must sign up first." },
        { status: 404 }
      )
    }

    // Check if already a member
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userToInvite.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 409 }
      )
    }

    // Add member
    const member = await db.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToInvite.id,
        role: "MEMBER",
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("[INVITE_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
