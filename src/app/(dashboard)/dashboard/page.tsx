import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "@/lib/actions/dashboard";
import { RiskBanner } from "@/components/analytics/risk-banner";
import { getUnresolvedCount } from "@/lib/actions/risk-alerts";

function getScoreColor(avg: number): string {
  if (avg >= 80) return "text-eo-success";
  if (avg >= 70) return "text-eo-warning";
  return "text-eo-text-primary";
}

function getBarColor(pct: number): string {
  if (pct >= 70) return "bg-eo-primary";
  if (pct >= 50) return "bg-eo-warning";
  return "bg-eo-placeholder";
}

function getTextColor(pct: number): string {
  if (pct >= 70) return "text-eo-primary";
  if (pct >= 50) return "text-eo-warning";
  return "text-eo-text-secondary";
}

export default async function DashboardPage() {
  const [data, riskCount] = await Promise.all([
    getDashboardData(),
    getUnresolvedCount(),
  ]);

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="대시보드" description="학원 운영 현황을 한눈에 확인하세요" />

      {/* Risk Banner */}
      <RiskBanner count={riskCount} />

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="전체 학생" value={`${data.studentCount}명`} change="재원생" icon={Users} />
        <StatCard label="운영 과목" value={`${data.subjectCount}개`} change={data.subjectNames || "-"} icon={BookOpen} iconColor="text-eo-primary" changeColor="text-eo-primary" />
        <StatCard label="이번달 평가" value={`${data.monthAssessmentCount}건`} change="진행/완료" icon={ClipboardList} />
        <StatCard label="전체 평균" value={`${data.monthAvg}%`} change="이번달 기준" icon={TrendingUp} />
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Assessments */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-xl border border-eo-border">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-eo-text-primary">최근 평가</span>
            <Link href="/assessments" className="text-[13px] font-medium text-eo-primary">전체 보기 →</Link>
          </div>
          <div className="flex flex-col">
            {data.recentAssessments.length > 0 ? data.recentAssessments.map((r, i) => (
              <div key={r.id} className={`flex items-center gap-2 py-3 ${i < data.recentAssessments.length - 1 ? "border-b border-eo-border" : ""}`}>
                <span className="text-xs font-medium text-eo-text-secondary w-12">{r.date.slice(5).replace("-", "/")}</span>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${r.subjectColor}20`, color: r.subjectColor }}>{r.subject}</span>
                <span className="text-[13px] text-eo-text-primary">{r.name}</span>
                <span className={`ml-auto text-[13px] font-semibold ${getScoreColor(r.avg)}`}>평균 {r.avg}점</span>
              </div>
            )) : (
              <span className="text-sm text-eo-text-secondary py-4">최근 평가가 없습니다.</span>
            )}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-xl border border-eo-border">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-eo-text-primary">오늘의 출결</span>
            <span className="text-[13px] text-eo-text-secondary">{dateStr}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {data.todaySchedule.length > 0 ? data.todaySchedule.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-eo-bg-surface">
                <span className={`text-[13px] font-semibold ${s.status === "출석" ? "text-eo-success" : s.status === "지각" ? "text-eo-warning" : "text-eo-danger"}`}>{s.status}</span>
                <div className="w-px h-5 bg-eo-border" />
                <span className="text-[13px] text-eo-text-primary">{s.students?.name ?? "-"} — {s.subjects?.name ?? "-"}</span>
              </div>
            )) : (
              <span className="text-sm text-eo-text-secondary">오늘의 출결 기록이 없습니다.</span>
            )}
          </div>
        </div>
      </div>

      {/* Textbook Progress */}
      {data.textbookProgress.length > 0 && (
        <div className="flex flex-col gap-4 p-5 bg-white rounded-xl border border-eo-border">
          <span className="text-base font-semibold text-eo-text-primary">교재별 진도율</span>
          <div className="flex flex-col gap-3.5">
            {data.textbookProgress.map((t) => (
              <div key={t.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-eo-text-primary">{t.name}</span>
                  <span className={`text-[13px] font-semibold ${getTextColor(t.pct)}`}>{t.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-eo-bg-surface">
                  <div className={`h-full rounded-full ${getBarColor(t.pct)}`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
