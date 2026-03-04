export default function Loading() {
  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-32 bg-eo-bg-surface rounded" />
        <div className="h-4 w-56 bg-eo-bg-surface rounded" />
      </div>
      <div className="flex gap-5">
        <div className="flex-1 h-[300px] bg-white rounded-xl border border-eo-border" />
        <div className="w-[380px] h-[300px] bg-white rounded-xl border border-eo-border" />
      </div>
    </div>
  );
}
