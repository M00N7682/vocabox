"use client";

import Link from "next/link";

type AssessmentScore = { student_id: string; score: number | null; status: string };
type AssessmentItem = {
  id: string;
  name: string;
  date: string;
  type: string;
  total_points: number;
  status: string;
  assessment_scores?: AssessmentScore[];
};

type Props = {
  classId: string;
  assessments: AssessmentItem[];
  students: { id: string; name: string }[];
};

const statusStyles: Record<string, string> = {
  예정: "bg-[#F1F5F9] text-[#6B7280]",
  진행중: "bg-[#FEF3C7] text-[#D97706]",
  완료: "bg-[#D1FAE5] text-[#065F46]",
};

const typeStyles: Record<string, string> = {
  시험: "bg-[#DBEAFE] text-[#1E40AF]",
  퀴즈: "bg-[#D1FAE5] text-[#065F46]",
  과제: "bg-[#FEF3C7] text-[#92400E]",
  수행평가: "bg-[#FCE7F3] text-[#9D174D]",
  출석점수: "bg-[#E0E7FF] text-[#3730A3]",
};

export function ClassAssessmentsTab({ classId, assessments, students }: Props) {
  const studentMap = new Map(students.map((s) => [s.id, s.name]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-eo-text-primary">
          평가 목록 ({assessments.length}건)
        </span>
        <Link
          href={`/assessments`}
          className="text-xs text-eo-primary hover:text-[#4338CA]"
        >
          평가 관리에서 추가 →
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">날짜</span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">평가명</span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">유형</span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">총점</span>
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">응시/대상</span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">평균</span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">상태</span>
        </div>

        {assessments.map((a, i) => {
          const scores = a.assessment_scores ?? [];
          const totalStudents = students.length;
          const responded = scores.filter((s) => s.score !== null).length;
          const avgScore = responded > 0
            ? Math.round(scores.reduce((sum: number, s) => sum + (s.score ?? 0), 0) / responded)
            : "-";

          return (
            <Link
              key={a.id}
              href={`/assessments/${a.id}`}
              className={`flex items-center px-5 py-3 hover:bg-eo-bg-page/50 transition-colors ${
                i < assessments.length - 1 ? "border-b border-eo-border" : ""
              }`}
            >
              <span className="w-[100px] text-[13px] text-eo-text-secondary">{a.date}</span>
              <span className="flex-1 text-[13px] font-medium text-eo-text-primary">{a.name}</span>
              <div className="w-[80px]">
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${typeStyles[a.type] ?? ""}`}>
                  {a.type}
                </span>
              </div>
              <span className="w-[80px] text-[13px] text-eo-text-secondary">{a.total_points}점</span>
              <span className="w-[100px] text-[13px] text-eo-text-secondary">
                {responded}/{totalStudents}명
              </span>
              <span className="w-[80px] text-[13px] font-medium text-eo-text-primary">
                {avgScore}
              </span>
              <div className="w-[80px]">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${statusStyles[a.status] ?? ""}`}>
                  {a.status}
                </span>
              </div>
            </Link>
          );
        })}

        {assessments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-sm text-eo-text-secondary">이 반의 평가가 없습니다.</span>
            <span className="text-xs text-eo-text-tertiary">
              평가 관리에서 평가를 추가할 때 이 반을 선택하면 여기에 표시됩니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
