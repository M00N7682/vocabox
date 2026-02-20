"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
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
    <div className="flex min-h-screen items-center justify-center bg-eo-bg-page px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-eo-danger-light mb-6">
          <AlertTriangle className="h-8 w-8 text-eo-danger" />
        </div>
        <h1 className="text-2xl font-bold text-eo-text-primary mb-2">
          오류가 발생했습니다
        </h1>
        <p className="text-eo-text-secondary mb-8">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-eo-primary px-6 py-3 text-sm font-medium text-white hover:bg-eo-primary-hover transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
