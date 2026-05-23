import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 bg-slate-800" />
          <Skeleton className="h-4 w-32 bg-slate-800" />
        </div>
        <Skeleton className="h-10 w-36 bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-slate-800" />
        ))}
      </div>
    </div>
  )
}
