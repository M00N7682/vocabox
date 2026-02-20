import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "무료",
    price: "₩0",
    period: "월",
    description: "소규모 학원에 적합한 기본 플랜",
    features: [
      "학생 30명까지",
      "기본 성적 관리",
      "출결 관리",
      "이메일 지원",
    ],
    cta: "무료로 시작하기",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "프로",
    price: "₩49,000",
    period: "월",
    description: "성장하는 학원을 위한 프로 플랜",
    features: [
      "학생 무제한",
      "고급 분석 리포트",
      "과제 관리",
      "위험 알림",
      "우선 지원",
      "데이터 내보내기",
    ],
    cta: "프로 시작하기",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "엔터프라이즈",
    price: "맞춤",
    period: "",
    description: "대형 학원 및 프랜차이즈를 위한 맞춤 플랜",
    features: [
      "프로 플랜 전체 기능",
      "다중 캠퍼스 관리",
      "전용 매니저 배정",
      "API 연동",
      "SLA 보장",
      "맞춤 교육",
    ],
    cta: "문의하기",
    href: "mailto:contact@eduops.kr",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-eo-bg-page">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-eo-text-primary">
            합리적인 요금제
          </h2>
          <p className="mt-4 text-lg text-eo-text-secondary">
            학원 규모에 맞는 요금제를 선택하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-white ring-2 ring-eo-primary shadow-xl scale-[1.02]"
                  : "bg-white border border-eo-border"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-flex self-start items-center rounded-full bg-eo-primary-light px-3 py-1 text-xs font-semibold text-eo-primary mb-4">
                  인기
                </div>
              )}
              <h3 className="text-xl font-bold text-eo-text-primary">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-eo-text-primary">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-eo-text-secondary">/{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-eo-text-secondary">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-eo-success shrink-0 mt-0.5" />
                    <span className="text-sm text-eo-text-secondary">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-eo-primary text-white hover:bg-eo-primary-hover"
                    : "bg-eo-bg-surface text-eo-text-primary hover:bg-eo-border"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
