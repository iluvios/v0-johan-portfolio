export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12 animate-pulse">
        <div className="h-12 w-64 bg-slate-800 rounded-md mx-auto mb-4" />
        <div className="h-6 w-96 bg-slate-800/60 rounded-md mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-md bg-slate-800/40 border border-slate-700/50 animate-pulse p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-5 bg-slate-700/60 rounded w-1/3" />
              <div className="h-6 bg-slate-700/80 rounded w-5/6" />
              <div className="h-4 bg-slate-700/40 rounded w-full" />
              <div className="h-4 bg-slate-700/40 rounded w-2/3" />
            </div>
            <div className="h-4 bg-slate-700/30 rounded w-1/4 mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
