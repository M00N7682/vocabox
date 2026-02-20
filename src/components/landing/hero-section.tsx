import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-eo-primary-light via-white to-white -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-eo-primary-light px-4 py-1.5 text-sm font-medium text-eo-primary mb-6">
          학원 관리의 새로운 기준
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-eo-text-primary leading-tight">
          학원 운영의 모든 것을
          <br />
          <span className="text-eo-primary">하나의 플랫폼</span>에서
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-eo-text-secondary max-w-2xl mx-auto">
          학생 관리, 성적 분석, 출결 관리, 과제 관리까지.
          <br className="hidden sm:block" />
          EduOps로 학원 운영을 효율적으로 혁신하세요.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-eo-primary px-6 py-3 text-base font-semibold text-white hover:bg-eo-primary-hover transition-colors shadow-lg shadow-eo-primary/25"
          >
            무료로 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-lg border border-eo-border px-6 py-3 text-base font-semibold text-eo-text-primary hover:bg-eo-bg-surface transition-colors"
          >
            자세히 보기
          </a>
        </div>
      </div>
    </section>
  );
}
