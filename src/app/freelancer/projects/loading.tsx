export default function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[1,2,3,4].map(i => (
        <div key={i} className="glass-card p-4">
          <div className="h-5 bg-black/5 rounded w-2/3 mb-3" />
          <div className="h-3 bg-black/5 rounded w-full mb-2" />
          <div className="h-3 bg-black/5 rounded w-3/4 mb-4" />
          <div className="h-2 bg-black/5 rounded-full w-full" />
        </div>
      ))}
    </div>
  );
}
