export default function Loading() {
  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-24 bg-eo-bg-surface rounded" />
        <div className="h-4 w-48 bg-eo-bg-surface rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 bg-eo-bg-surface rounded" />
        <div className="h-10 w-24 bg-eo-bg-surface rounded-lg" />
      </div>
      <div className="flex gap-5 flex-wrap">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-[340px] h-[160px] bg-white rounded-xl border border-eo-border p-6">
            <div className="h-5 w-32 bg-eo-bg-surface rounded mb-4" />
            <div className="h-4 w-48 bg-eo-bg-surface rounded mb-2" />
            <div className="h-4 w-24 bg-eo-bg-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
