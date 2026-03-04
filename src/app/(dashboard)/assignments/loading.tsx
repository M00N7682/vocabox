export default function Loading() {
  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-24 bg-eo-bg-surface rounded" />
        <div className="h-4 w-48 bg-eo-bg-surface rounded" />
      </div>
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <div className="h-4 w-full bg-eo-bg-surface rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center px-5 py-3 border-b border-eo-border">
            <div className="h-4 w-full bg-eo-bg-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
