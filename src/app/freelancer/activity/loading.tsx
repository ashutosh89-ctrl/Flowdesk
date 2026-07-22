export default function ActivityLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="glass-card p-4">
          <div className="h-4 bg-black/5 rounded w-3/4 mb-2" />
          <div className="h-3 bg-black/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
