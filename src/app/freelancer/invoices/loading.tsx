export default function InvoicesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2].map(i => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-black/5 rounded w-1/4" />
            <div className="h-6 w-20 bg-black/5 rounded-full" />
          </div>
          <div className="h-8 bg-black/5 rounded w-1/3 mb-2" />
          <div className="h-3 bg-black/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
