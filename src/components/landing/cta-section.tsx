import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-eo-primary to-indigo-700 px-8 py-16 sm:px-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-indigo-200 max-w-xl mx-auto">
            회원가입 후 바로 사용할 수 있습니다. 신용카드 없이 무료로 체험해 보세요.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-eo-primary hover:bg-indigo-50 transition-colors"
          >
            무료로 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
