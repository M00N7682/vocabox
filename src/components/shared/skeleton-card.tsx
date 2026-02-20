export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-eo-border bg-white p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-20 rounded bg-eo-bg-surface" />
        <div className="h-8 w-8 rounded bg-eo-bg-surface" />
      </div>
      <div className="h-8 w-24 rounded bg-eo-bg-surface mb-2" />
      <div className="h-3 w-16 rounded bg-eo-bg-surface" />
    </div>
  );
}
