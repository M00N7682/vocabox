import { SkeletonCard } from "@/components/shared/skeleton-card";

export default function DashboardGroupLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-40 rounded bg-eo-bg-surface mb-2" />
        <div className="h-4 w-64 rounded bg-eo-bg-surface" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-eo-border bg-white p-6 h-64" />
        <div className="rounded-lg border border-eo-border bg-white p-6 h-64" />
      </div>
    </div>
  );
}
