export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-950">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-moonstone-blue animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-moonstone-blue animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-moonstone-blue animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest animate-pulse">
        Loading the archives...
      </p>
    </div>
  )
}
