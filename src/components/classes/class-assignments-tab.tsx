"use client";

import Link from "next/link";

type AssignmentStudent = { student_id: string; status: string; submitted_at: string | null };
type AssignmentItem = {
  id: string;
  title: string;
  due_date: string | null;
  difficulty: string | null;
  is_required: boolean;
  created_at: string | null;
  assignment_students?: AssignmentStudent[];
};

type Props = {
  assignments: AssignmentItem[];
  students: { id: string; name: string }[];
};

const submissionTypeLabel: Record<string, string> = {
  photo: "사진",
  file: "파일",
  check: "체크",
};

const difficultyStyles: Record<string, string> = {
  easy: "bg-[#ECFDF5] text-[#10B981]",
  medium: "bg-[#FEF3C7] text-[#D97706]",
  hard: "bg-[#FEE2E2] text-[#EF4444]",
};

const difficultyLabel: Record<string, string> = {
  easy: "하",
  medium: "중",
  hard: "상",
};

function getRelativeDueDate(dueDateStr: string): { label: string; isOverdue: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}일 초과`, isOverdue: true };
  if (diffDays === 0) return { label: "오늘 마감", isOverdue: false };
  if (diffDays === 1) return { label: "내일 마감", isOverdue: false };
  return { label: `${diffDays}일 후`, isOverdue: false };
}

export function ClassAssignmentsTab({ assignments, students }: Props) {
  const studentIds = new Set(students.map((s) => s.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-eo-text-primary">
          과제 목록 ({assignments.length}건)
        </span>
        <Link href="/assignments" className="text-xs text-eo-primary hover:text-[#4338CA]">
          과제 관리에서 추가 →
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">등록일</span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">과제명</span>
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">마감일</span>
          <span className="w-[60px] text-xs font-semibold text-eo-text-secondary">난이도</span>
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">제출 현황</span>
          <span className="w-[60px] text-xs font-semibold text-eo-text-secondary">필수</span>
        </div>

        {assignments.map((a, i) => {
          const createdDate = a.created_at?.slice(5, 10).replace("-", ".") ?? "-";
          const assignmentStudents = (a.assignment_students ?? []).filter((s) => studentIds.has(s.student_id));
          const total = assignmentStudents.length;
          const submitted = assignmentStudents.filter((s) => s.status === "submitted").length;
          const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
          const { label: dueLabel, isOverdue } = a.due_date ? getRelativeDueDate(a.due_date) : { label: "-", isOverdue: false };
          const diffKey = a.difficulty ?? "";

          return (
            <Link
              key={a.id}
              href={`/assignments/${a.id}`}
              className={`flex items-center px-5 py-3 hover:bg-eo-bg-page/50 transition-colors ${
                i < assignments.length - 1 ? "border-b border-eo-border" : ""
              }`}
            >
              <span className="w-[80px] text-[13px] text-eo-text-secondary">{createdDate}</span>
              <span className="flex-1 text-[13px] font-medium text-eo-text-primary">{a.title}</span>
              <span className={`w-[100px] text-[13px] ${isOverdue ? "text-eo-danger font-medium" : "text-eo-text-secondary"}`}>
                {dueLabel}
              </span>
              <div className="w-[60px]">
                {diffKey ? (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${difficultyStyles[diffKey] ?? ""}`}>
                    {difficultyLabel[diffKey] ?? "-"}
                  </span>
                ) : (
                  <span className="text-[13px] text-eo-text-secondary">-</span>
                )}
              </div>
              <div className="w-[100px]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-eo-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-eo-text-secondary">{submitted}/{total}</span>
                </div>
              </div>
              <div className="w-[60px]">
                {a.is_required ? (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5]">필수</span>
                ) : (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280]">선택</span>
                )}
              </div>
            </Link>
          );
        })}

        {assignments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-sm text-eo-text-secondary">이 반의 과제가 없습니다.</span>
            <span className="text-xs text-eo-text-tertiary">
              과제 관리에서 과제를 추가해주세요.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
