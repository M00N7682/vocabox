import { PageHeader } from "@/components/shared/page-header";
import { getAssessment, getAssessmentScores } from "@/lib/actions/assessments";
import { ScoreInputClient } from "@/components/scores/score-input-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeleteAssessmentButton } from "@/components/assessments/delete-assessment-button";

const typeStyles: Record<string, string> = {
  시험: "bg-[#DBEAFE] text-[#1E40AF]",
  퀴즈: "bg-[#D1FAE5] text-[#065F46]",
  과제: "bg-[#FEF3C7] text-[#92400E]",
  수행평가: "bg-[#FCE7F3] text-[#9D174D]",
  출석점수: "bg-[#E0E7FF] text-[#3730A3]",
};

const statusStyles: Record<string, string> = {
  예정: "bg-[#F1F5F9] text-[#6B7280]",
  진행중: "bg-[#DBEAFE] text-[#1E40AF]",
  완료: "bg-[#D1FAE5] text-[#065F46]",
};

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let assessment;
  try {
    assessment = await getAssessment(id);
  } catch {
    notFound();
  }

  const scores = await getAssessmentScores(id);

  const scoringMethodLabel =
    assessment.scoring_method === "score"
      ? "점수형"
      : assessment.scoring_method === "grade"
        ? "등급형"
        : "체크형";

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/assessments"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-eo-bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-eo-text-secondary" />
        </Link>
        <PageHeader
          title={assessment.name}
          description={`${assessment.subjects?.name ?? "-"} | ${assessment.date}`}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <DeleteAssessmentButton
          assessmentId={id}
          assessmentName={assessment.name}
        />
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeStyles[assessment.type] ?? "bg-[#F1F5F9] text-[#6B7280]"}`}
        >
          {assessment.type}
        </span>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[assessment.status] ?? "bg-[#F1F5F9] text-[#6B7280]"}`}
        >
          {assessment.status}
        </span>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#6B7280]">
          {scoringMethodLabel}
        </span>
        {assessment.scoring_method === "score" && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#6B7280]">
            총점 {assessment.total_points}점
          </span>
        )}
        {assessment.textbooks && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
            교재: {assessment.textbooks.name}
          </span>
        )}
      </div>

      <ScoreInputClient
        assessmentId={id}
        subjectId={assessment.subject_id ?? null}
        totalPoints={assessment.total_points}
        scoringMethod={assessment.scoring_method as "score" | "grade" | "check"}
        scores={scores}
      />
    </div>
  );
}
