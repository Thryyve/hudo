import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (session?.user?.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {children}
    </div>
  )
}
