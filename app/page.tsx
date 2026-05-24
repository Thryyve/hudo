import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
        <span className="text-xl font-bold tracking-tight text-slate-900">Hudo</span>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button className="bg-slate-900 text-white hover:bg-slate-800">
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-sm px-4 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Now in beta — free for teams
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight text-slate-900">
          Your team's work,{" "}
          <span className="text-slate-400">beautifully organized.</span>
        </h1>

        <p className="text-slate-500 text-lg max-w-xl">
          Hudo gives your team boards, lists, and cards to organize work. Simple, fast, and built for collaboration.
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Link href="/sign-in">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-8">
              Start for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-6 border-t border-slate-100">
        © {new Date().getFullYear()} Hudo. Built for teams.
      </footer>
    </main>
  )
}
