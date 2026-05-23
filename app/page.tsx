import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">Hudo</span>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button className="bg-white text-slate-950 hover:bg-slate-100">
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 text-sm px-4 py-1.5 rounded-full border border-slate-700">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          Now in beta — free for teams
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
          Your team's work,{" "}
          <span className="text-slate-400">beautifully organized.</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-xl">
          Hudo gives your team boards, lists, and cards to organize work. Simple, fast, and built for collaboration.
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Link href="/sign-in">
            <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-semibold px-8">
              Start for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-sm py-6 border-t border-slate-800">
        © {new Date().getFullYear()} Hudo. Built for teams.
      </footer>
    </main>
  )
}
