import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-eo-bg-page px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-eo-primary-light mb-6">
          <GraduationCap className="h-8 w-8 text-eo-primary" />
        </div>
        <h1 className="text-6xl font-bold text-eo-text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-eo-text-primary mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-eo-text-secondary mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-eo-primary px-6 py-3 text-sm font-medium text-white hover:bg-eo-primary-hover transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-eo-border px-6 py-3 text-sm font-medium text-eo-text-primary hover:bg-eo-bg-surface transition-colors"
          >
            대시보드로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
