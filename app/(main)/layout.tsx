import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { MainShell } from "./main-shell"
import type { SafeUser } from "@/types"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const user: SafeUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  }

  return <MainShell user={user}>{children}</MainShell>
}
