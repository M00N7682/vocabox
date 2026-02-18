import { PageHeader } from "@/components/shared/page-header";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { GrowthLineChart } from "@/components/analytics/growth-line-chart";
import { HeatmapChart } from "@/components/analytics/heatmap-chart";
import { getScoreTrends, getUnitAchievement, getWeakAreas, getGrowthSummary } from "@/lib/actions/analytics";
import { getSubjects } from "@/lib/actions/subjects";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; subject?: string; months?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    studentId: params.student,
    subjectId: params.subject,
    months: params.months ? Number(params.months) : 6,
  };

  const [chartData, unitScores, weakAreas, growthItems, subjects] = await Promise.all([
    getScoreTrends(filters),
    getUnitAchievement(filters),
    getWeakAreas(filters),
    getGrowthSummary(filters),
    getSubjects(),
  ]);

  // Prepare heatmap data from unit scores
  const heatmapData = unitScores.map((u) => ({ name: u.name, score: u.score }));

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="분석/리포트" description="성적 추이와 취약 영역을 분석합니다" />

      {/* Filter Row */}
      <div className="flex items-center gap-2.5">
        <FilterDropdown paramKey="subject" label="과목" allLabel="과목: 전체"
          options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
        <FilterDropdown paramKey="months" label="기간" allLabel="기간: 6개월"
          options={[
            { value: "1", label: "1개월" },
            { value: "3", label: "3개월" },
            { value: "6", label: "6개월" },
            { value: "12", label: "12개월" },
          ]} />
      </div>

      {/* Charts Row */}
      <div className="flex gap-5">
        <div className="flex flex-col gap-5 p-6 bg-white rounded-xl border border-eo-border flex-1">
          <span className="text-base font-semibold text-eo-text-primary">성적 추이</span>
          <GrowthLineChart data={chartData} />
        </div>

        <div className="flex flex-col gap-5 p-6 bg-white rounded-xl border border-eo-border w-[380px]">
          <span className="text-base font-semibold text-eo-text-primary">영역별 성취도</span>
          <div className="flex flex-col gap-4">
            {unitScores.length > 0 ? unitScores.map((u) => (
              <div key={u.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-eo-text-primary">{u.name}</span>
                  <span className="text-[13px] font-semibold text-eo-text-primary">{u.score}점</span>
                </div>
                <div className="w-full h-2 rounded-full bg-eo-bg-surface">
                  <div className={`h-full rounded-full ${u.color}`} style={{ width: `${u.score}%` }} />
                </div>
              </div>
            )) : (
              <span className="text-sm text-eo-text-secondary">데이터가 없습니다.</span>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      {heatmapData.length > 0 && (
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border">
          <span className="text-base font-semibold text-eo-text-primary">단원별 성취도 히트맵</span>
          <HeatmapChart data={heatmapData} />
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex gap-5">
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border flex-1">
          <span className="text-base font-semibold text-eo-text-primary">취약 영역</span>
          <div className="flex flex-col gap-3">
            {weakAreas.length > 0 ? weakAreas.map((w) => (
              <div key={w.area} className="flex items-center gap-3 p-3 rounded-lg bg-eo-bg-page border border-eo-border">
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${w.color}20`, color: w.color }}>{w.subject}</span>
                <span className="text-[13px] font-medium text-eo-text-primary flex-1">{w.area}</span>
                <span className="text-[13px] font-semibold text-eo-danger">{w.avg}</span>
                <span className="text-xs text-eo-text-secondary">{w.status}</span>
              </div>
            )) : (
              <span className="text-sm text-eo-text-secondary">취약 영역이 없습니다.</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border w-[380px]">
          <span className="text-base font-semibold text-eo-text-primary">성장 요약</span>
          <div className="flex flex-col gap-3">
            {growthItems.map((g) => (
              <div key={g.label} className="flex items-center justify-between p-3 rounded-lg bg-eo-bg-page">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-eo-text-secondary">{g.label}</span>
                  <span className="text-sm font-bold text-eo-text-primary">{g.value}</span>
                </div>
                <span className={g.positive ? "text-xs text-eo-success" : "text-xs text-eo-danger"}>{g.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
