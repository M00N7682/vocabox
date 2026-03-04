export default function Loading() {
  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-16 bg-eo-bg-surface rounded" />
        <div className="h-4 w-40 bg-eo-bg-surface rounded" />
      </div>
      <div className="h-[400px] bg-white rounded-xl border border-eo-border" />
    </div>
  );
}
