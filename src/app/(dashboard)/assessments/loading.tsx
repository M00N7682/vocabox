import { SkeletonTable } from "@/components/shared/skeleton-table";

export default function AssessmentsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="h-7 w-24 rounded bg-eo-bg-surface animate-pulse mb-2" />
        <div className="h-4 w-56 rounded bg-eo-bg-surface animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-64 rounded-lg bg-eo-bg-surface animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-eo-bg-surface animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-eo-bg-surface animate-pulse" />
      </div>

      <SkeletonTable rows={6} />
    </div>
  );
}
