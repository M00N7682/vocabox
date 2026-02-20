export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-eo-border bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-eo-border bg-eo-bg-surface px-6 py-3 flex gap-4">
        {[120, 80, 100, 60, 80].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded bg-eo-border animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 flex gap-4 items-center border-b border-eo-border last:border-b-0"
        >
          <div className="h-4 w-28 rounded bg-eo-bg-surface animate-pulse" />
          <div className="h-4 w-20 rounded bg-eo-bg-surface animate-pulse" />
          <div className="h-4 w-24 rounded bg-eo-bg-surface animate-pulse" />
          <div className="h-4 w-16 rounded bg-eo-bg-surface animate-pulse" />
          <div className="h-4 w-20 rounded bg-eo-bg-surface animate-pulse" />
        </div>
      ))}
    </div>
  );
}
