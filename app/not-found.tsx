import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-slate-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-2">Page not found</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button className="bg-white text-slate-950 hover:bg-slate-100">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}
