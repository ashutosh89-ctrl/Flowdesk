export default function DocumentsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-black/5 rounded w-1/3 mb-6" />
      {[1,2,3,4].map(i => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-black/5 rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-black/5 rounded w-2/3 mb-2" />
            <div className="h-3 bg-black/5 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
