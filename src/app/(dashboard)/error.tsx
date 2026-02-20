"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-eo-danger-light mb-4">
          <AlertTriangle className="h-7 w-7 text-eo-danger" />
        </div>
        <h2 className="text-xl font-bold text-eo-text-primary mb-2">
          데이터를 불러올 수 없습니다
        </h2>
        <p className="text-sm text-eo-text-secondary mb-6">
          일시적인 오류가 발생했습니다. 다시 시도하거나 잠시 후 새로고침해 주세요.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-eo-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-eo-primary-hover transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </button>
      </div>
    </div>
  );
}
