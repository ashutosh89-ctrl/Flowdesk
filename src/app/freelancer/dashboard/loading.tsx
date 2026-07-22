export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 glass-card rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 glass-card rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 glass-card rounded-2xl" />
        <div className="h-64 glass-card rounded-2xl" />
      </div>
    </div>
  );
}
