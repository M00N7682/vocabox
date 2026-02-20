import {
  Users,
  ClipboardCheck,
  CalendarCheck,
  BookOpen,
  BarChart3,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "학생 관리",
    description:
      "학생 정보, 반 배정, 과목 등록을 한 곳에서 관리하세요. 학부모 연락처와 메모까지 체계적으로 기록됩니다.",
    color: "bg-eo-primary-light text-eo-primary",
  },
  {
    icon: ClipboardCheck,
    title: "평가 / 성적",
    description:
      "시험, 퀴즈, 수행평가를 유연하게 생성하고 점수를 기록하세요. 과목별 성적 추이를 한눈에 파악할 수 있습니다.",
    color: "bg-eo-success-light text-eo-success",
  },
  {
    icon: CalendarCheck,
    title: "출결 관리",
    description:
      "QR코드, PIN 입력, 수동 체크 등 다양한 방식으로 출석을 기록하고 출석률을 자동으로 집계합니다.",
    color: "bg-eo-info-light text-eo-info",
  },
  {
    icon: BookOpen,
    title: "과제 관리",
    description:
      "과제 배정, 제출 현황 추적, 피드백 제공까지. 학생별 과제 완료율과 미제출 현황을 실시간으로 확인하세요.",
    color: "bg-eo-warning-light text-eo-warning",
  },
  {
    icon: BarChart3,
    title: "분석 / 리포트",
    description:
      "과목별, 학생별, 기간별 성적 분석과 출석 통계를 시각적 차트로 제공하여 데이터 기반 의사결정을 지원합니다.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Bell,
    title: "위험 알림",
    description:
      "성적 하락, 출석률 저하, 과제 미제출 등 위험 신호를 자동으로 감지하고 즉시 알림을 제공합니다.",
    color: "bg-eo-danger-light text-eo-danger",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-eo-text-primary">
            학원 운영에 필요한 모든 기능
          </h2>
          <p className="mt-4 text-lg text-eo-text-secondary max-w-2xl mx-auto">
            하나의 플랫폼에서 학원의 모든 업무를 효율적으로 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-eo-border p-6 hover:shadow-lg transition-shadow"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-eo-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-eo-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
