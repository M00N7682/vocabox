import { SkeletonCard } from "@/components/shared/skeleton-card";

export default function DashboardMainLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="h-7 w-32 rounded bg-eo-bg-surface animate-pulse mb-2" />
        <div className="h-4 w-48 rounded bg-eo-bg-surface animate-pulse" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-eo-border bg-white p-6 animate-pulse">
          <div className="h-5 w-28 rounded bg-eo-bg-surface mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-eo-bg-surface" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-eo-border bg-white p-6 animate-pulse">
          <div className="h-5 w-24 rounded bg-eo-bg-surface mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-eo-bg-surface" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
