import { SkeletonCard } from "@/components/shared/skeleton-card";
import { SkeletonTable } from "@/components/shared/skeleton-table";

export default function AttendanceLoading() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="h-7 w-28 rounded bg-eo-bg-surface animate-pulse mb-2" />
        <div className="h-4 w-48 rounded bg-eo-bg-surface animate-pulse" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <SkeletonTable rows={8} />
    </div>
  );
}
