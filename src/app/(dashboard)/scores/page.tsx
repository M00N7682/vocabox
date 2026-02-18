import { PageHeader } from "@/components/shared/page-header";
import { getAssessment, getAssessmentScores, getAssessments } from "@/lib/actions/assessments";
import { ScoreInputClient } from "@/components/scores/score-input-client";
import Link from "next/link";

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ assessment?: string }>;
}) {
  const params = await searchParams;
  const assessmentId = params.assessment;

  if (!assessmentId) {
    // Show recent assessments list for selection
    const assessments = await getAssessments({ status: "진행중" });
    return (
      <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
        <PageHeader title="성적 관리" description="평가를 선택하여 성적을 입력합니다" />
        <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
          <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
            <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">날짜</span>
            <span className="flex-1 text-xs font-semibold text-eo-text-secondary">평가명</span>
            <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">과목</span>
            <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">채점방식</span>
            <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">상태</span>
          </div>
          {assessments.length > 0 ? assessments.map((a, i) => {
            const subjectColor = a.subjects?.color ?? "#6B7280";
            const scoringLabel = a.scoring_method === "score" ? "점수형" : a.scoring_method === "grade" ? "등급형" : "체크형";
            return (
              <Link key={a.id} href={`/scores?assessment=${a.id}`}
                className={`flex items-center px-5 py-3 hover:bg-eo-bg-page/50 transition-colors ${i < assessments.length - 1 ? "border-b border-eo-border" : ""}`}>
                <span className="w-[100px] text-[13px] text-eo-text-secondary">{a.date}</span>
                <span className="flex-1 text-[13px] font-medium text-eo-text-primary">{a.name}</span>
                <div className="w-[80px]">
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}>{a.subjects?.name ?? "-"}</span>
                </div>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">{scoringLabel}</span>
                <div className="w-[80px]">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[#FEF3C7] text-[#D97706]">{a.status}</span>
                </div>
              </Link>
            );
          }) : (
            <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
              진행중인 평가가 없습니다.
            </div>
          )}
        </div>
      </div>
    );
  }

  const [assessment, scores] = await Promise.all([
    getAssessment(assessmentId),
    getAssessmentScores(assessmentId),
  ]);

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="성적 입력" description={`${assessment.name} (${assessment.scoring_method === "score" ? "점수형" : assessment.scoring_method === "grade" ? "등급형" : "체크형"})`} />
      <ScoreInputClient
        assessmentId={assessmentId}
        totalPoints={assessment.total_points}
        scoringMethod={assessment.scoring_method}
        scores={scores}
      />
    </div>
  );
}
