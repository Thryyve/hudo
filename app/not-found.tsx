import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-slate-200 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Page not found</h2>
      <p className="text-slate-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}
