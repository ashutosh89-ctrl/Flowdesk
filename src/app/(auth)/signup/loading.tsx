export default function SignupLoading() {
  return (
    <div className="glass-window w-full max-w-[420px] p-8 animate-pulse">
      <div className="h-8 bg-black/5 rounded w-3/4 mb-6 mx-auto" />
      <div className="space-y-4">
        <div className="h-12 bg-black/5 rounded-xl" />
        <div className="h-12 bg-black/5 rounded-xl" />
        <div className="h-12 bg-black/5 rounded-xl" />
        <div className="h-10 bg-black/5 rounded-full w-1/2 mx-auto" />
      </div>
    </div>
  );
}
