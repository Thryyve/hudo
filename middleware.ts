import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const session = await auth()
  const isAuthed = !!session?.user?.id

  const { pathname } = req.nextUrl

  // Keep auth routes accessible when signed out.
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Protect everything else under the app surface.
  if (!isAuthed) {
    const url = req.nextUrl.clone()
    url.pathname = "/sign-in"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Protect all app routes except:
     * - Next.js internals
     * - Static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}

