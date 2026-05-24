import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, memberId } = await params

    // Check if requester is OWNER or ADMIN
    const requesterMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!requesterMember || requesterMember.role === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Cannot remove owner
    const memberToRemove = await db.workspaceMember.findUnique({
      where: { id: memberId },
    })

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (memberToRemove.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the workspace owner" },
        { status: 403 }
      )
    }

    await db.workspaceMember.delete({ where: { id: memberId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MEMBER_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
