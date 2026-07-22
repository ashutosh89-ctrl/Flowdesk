export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 glass-card rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 glass-card rounded-2xl" />
          <div className="h-48 glass-card rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-32 glass-card rounded-2xl" />
          <div className="h-32 glass-card rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
