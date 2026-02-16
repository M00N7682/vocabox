import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/actions/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statusColors: Record<string, string> = {
    scheduled: "bg-vb-primary",
    in_progress: "bg-vb-warning",
    completed: "bg-vb-success",
    missed: "bg-vb-danger",
  };

  return (
    <>
      <Header title="대시보드" />
      <div className="flex flex-col gap-6 p-8 flex-1">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="전체 학생 수"
            value={`${data.studentCount}명`}
            change="재원생 기준"
          />
          <StatCard
            label="등록 단어장 수"
            value={`${data.vocabBookCount}개`}
            change="전체"
          />
          <StatCard
            label="이번 달 시험 횟수"
            value={`${data.monthTestCount}회`}
            change="이번 달 기준"
          />
          <StatCard
            label="이번 달 평균점수"
            value={data.monthAvg > 0 ? `${data.monthAvg}%` : "-"}
            change="이번 달 기준"
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Today's Schedule */}
          <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-vb-border">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-vb-text-primary">
                오늘의 스케줄
              </h2>
              <Badge
                variant="secondary"
                className="bg-vb-info-light text-vb-info"
              >
                {data.todaySchedules.length}건 예정
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {data.todaySchedules.length === 0 ? (
                <p className="text-sm text-vb-text-tertiary py-4 text-center">
                  오늘 예정된 스케줄이 없습니다.
                </p>
              ) : (
                data.todaySchedules.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3.5 bg-vb-bg-muted rounded-lg"
                  >
                    <div
                      className={`w-1 h-10 rounded-sm ${statusColors[item.status] ?? "bg-vb-primary"}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-vb-text-primary">
                        {item.students?.name}
                      </span>
                      <span className="text-[13px] text-vb-text-secondary">
                        {item.vocab_books?.title} 시험 예정
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Scores */}
          <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-vb-border">
            <h2 className="text-base font-semibold text-vb-text-primary">
              최근 점수 입력
            </h2>
            <div className="flex flex-col">
              {data.recentScores.length === 0 ? (
                <p className="text-sm text-vb-text-tertiary py-4 text-center">
                  아직 입력된 점수가 없습니다.
                </p>
              ) : (
                data.recentScores.map((item, i) => {
                  const pct = Number(item.score_percentage);
                  const color =
                    pct >= 90
                      ? "text-vb-success"
                      : pct >= 80
                        ? "text-vb-warning"
                        : "text-vb-danger";
                  const typeLabel =
                    item.test_type === "eng_to_kor" ? "영→한" : "한→영";
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between py-3 ${
                        i < data.recentScores.length - 1
                          ? "border-b border-vb-border"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-vb-text-primary">
                          {item.students?.name} - {item.vocab_books?.title} (
                          {typeLabel})
                        </span>
                        <span className="text-xs text-vb-text-tertiary">
                          {item.test_date}
                        </span>
                      </div>
                      <span className={`text-base font-bold ${color}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
