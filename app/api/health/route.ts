import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to keep Supabase active
    await db.user.count()
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}
