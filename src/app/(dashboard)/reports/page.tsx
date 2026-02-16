import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/shared/stat-card";
import { getScores } from "@/lib/actions/scores";
import { getClasses } from "@/lib/actions/classes";

export default async function ReportsPage() {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const [allScores, classes] = await Promise.all([
    getScores({ dateFrom: monthStart }),
    getClasses(),
  ]);

  const totalTests = allScores.length;
  const avgScore =
    totalTests > 0
      ? Math.round(
          (allScores.reduce((sum, s) => sum + Number(s.score_percentage), 0) /
            totalTests) *
            10
        ) / 10
      : 0;

  const completionRate =
    totalTests > 0
      ? Math.round(
          (allScores.filter((s) => Number(s.score_percentage) >= 60).length /
            totalTests) *
            1000
        ) / 10
      : 0;

  // Class averages for bar chart
  const classAverages = classes.map((cls) => {
    const studentIds = (cls.class_students ?? []).map(
      (cs) => cs.student_id
    );
    const classScores = allScores.filter((s) =>
      studentIds.includes(s.student_id)
    );
    const avg =
      classScores.length > 0
        ? Math.round(
            (classScores.reduce(
              (sum, s) => sum + Number(s.score_percentage),
              0
            ) /
              classScores.length) *
              10
          ) / 10
        : 0;
    return { name: cls.name, avg, count: classScores.length };
  });

  const maxAvg = Math.max(...classAverages.map((c) => c.avg), 1);

  // Top 5 students
  const studentScores: Record<
    string,
    { name: string; total: number; count: number }
  > = {};
  for (const s of allScores) {
    const name = s.students?.name ?? "Unknown";
    if (!studentScores[s.student_id]) {
      studentScores[s.student_id] = { name, total: 0, count: 0 };
    }
    studentScores[s.student_id].total += Number(s.score_percentage);
    studentScores[s.student_id].count += 1;
  }
  const rankings = Object.entries(studentScores)
    .map(([, v]) => ({
      name: v.name,
      avg: Math.round((v.total / v.count) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  const barColors = [
    "bg-vb-primary",
    "bg-vb-success",
    "bg-vb-warning",
    "bg-vb-info",
    "bg-vb-danger",
  ];

  return (
    <>
      <Header title="리포트" />
      <div className="flex flex-col gap-6 p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="평균 점수"
            value={avgScore > 0 ? `${avgScore}%` : "-"}
            change="이번 달 기준"
          />
          <StatCard
            label="시험 완료율"
            value={completionRate > 0 ? `${completionRate}%` : "-"}
            change="60점 이상 기준"
          />
          <StatCard
            label="총 시험 횟수"
            value={`${totalTests}회`}
            change="이번 달 기준"
          />
          <StatCard
            label="등록 반 수"
            value={`${classes.length}개`}
            change="전체"
          />
        </div>

        {/* Bottom Row */}
        <div className="flex gap-6">
          {/* Chart Card */}
          <div className="flex-1 bg-white rounded-xl border border-vb-border p-6">
            <h2 className="text-base font-semibold text-vb-text-primary mb-4">
              반별 평균 점수
            </h2>
            <div className="bg-vb-bg-muted rounded-lg p-6">
              {classAverages.length === 0 ? (
                <p className="text-sm text-vb-text-tertiary text-center py-8">
                  데이터가 없습니다.
                </p>
              ) : (
                <div className="flex items-end justify-around h-[200px]">
                  {classAverages.map((bar, i) => (
                    <div
                      key={bar.name}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-xs font-semibold text-vb-text-primary">
                        {bar.avg > 0 ? `${bar.avg}%` : "-"}
                      </span>
                      <div
                        className={`w-12 rounded-t ${barColors[i % barColors.length]}`}
                        style={{
                          height:
                            bar.avg > 0
                              ? `${(bar.avg / maxAvg) * 160}px`
                              : "4px",
                        }}
                      />
                      <span className="text-xs text-vb-text-secondary">
                        {bar.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rankings Card */}
          <div className="w-[360px] shrink-0 bg-white rounded-xl border border-vb-border p-6">
            <h2 className="text-base font-semibold text-vb-text-primary mb-4">
              학생 성적 순위 (상위 5명)
            </h2>
            <div className="flex flex-col">
              {rankings.length === 0 ? (
                <p className="text-sm text-vb-text-tertiary text-center py-8">
                  데이터가 없습니다.
                </p>
              ) : (
                rankings.map((r, i) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between py-3 border-b border-vb-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-bold ${
                          i === 0
                            ? "text-vb-primary"
                            : "text-vb-text-secondary"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-vb-text-primary">
                        {r.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        i === 0 ? "text-vb-primary" : "text-vb-text-primary"
                      }`}
                    >
                      {r.avg}점
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
