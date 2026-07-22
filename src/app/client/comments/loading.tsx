export default function CommentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-black/5 rounded w-1/3 mb-6" />
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 bg-black/5 rounded-full shrink-0" />
          <div className="flex-1 glass-card p-3">
            <div className="h-3 bg-black/5 rounded w-1/4 mb-2" />
            <div className="h-4 bg-black/5 rounded w-3/4 mb-1" />
            <div className="h-4 bg-black/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
