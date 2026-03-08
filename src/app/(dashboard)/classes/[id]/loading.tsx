export default function ClassDetailLoading() {
  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-eo-bg-surface animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="w-[200px] h-6 rounded bg-eo-bg-surface animate-pulse" />
          <div className="w-[300px] h-4 rounded bg-eo-bg-surface animate-pulse" />
        </div>
      </div>
      <div className="flex gap-1 border-b border-eo-border pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-[80px] h-8 rounded bg-eo-bg-surface animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[100px] rounded-xl bg-eo-bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  );
}
