import { PageHeader } from "@/components/shared/page-header";
import { AssignmentAddButton } from "@/components/assignments/assignment-add-button";
import { getAssignments } from "@/lib/actions/assignments";
import { getSubjects } from "@/lib/actions/subjects";
import { getStudents } from "@/lib/actions/students";
import { SearchInput } from "@/components/shared/search-input";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import type { AssignmentWithDetails } from "@/lib/actions/assignments";
import Link from "next/link";

const submissionTypeLabel: Record<string, string> = {
  photo: "사진",
  file: "파일",
  check: "체크",
};

const difficultyLabel: Record<string, string> = {
  easy: "하",
  medium: "중",
  hard: "상",
};

const difficultyStyles: Record<string, string> = {
  easy: "bg-[#ECFDF5] text-[#10B981]",
  medium: "bg-[#FEF3C7] text-[#D97706]",
  hard: "bg-[#FEE2E2] text-[#EF4444]",
};

function getRelativeDueDate(dueDateStr: string): {
  label: string;
  isOverdue: boolean;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}일 초과`, isOverdue: true };
  }
  if (diffDays === 0) {
    return { label: "오늘 마감", isOverdue: false };
  }
  if (diffDays === 1) {
    return { label: "내일 마감", isOverdue: false };
  }
  return { label: `${diffDays}일 후`, isOverdue: false };
}

function ProgressBar({
  submitted,
  total,
}: {
  submitted: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full bg-eo-primary rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-eo-text-secondary whitespace-nowrap">
        {submitted}/{total}
      </span>
    </div>
  );
}

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; search?: string }>;
}) {
  const params = await searchParams;

  const [assignments, subjects, students] = await Promise.all([
    getAssignments({
      subjectId: params.subject,
      search: params.search,
    }),
    getSubjects({ isActive: true }),
    getStudents({ activeOnly: true }),
  ]);

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="과제 관리"
        description="학생 과제를 관리하고 제출 현황을 확인합니다"
      >
        <AssignmentAddButton
          subjects={subjects.map((s) => ({
            id: s.id,
            name: s.name,
            studentIds: (s.subject_students ?? []).map((ss: { student_id: string }) => ss.student_id),
          }))}
          students={students.map((s) => ({ id: s.id, name: s.name, grade: s.grade }))}
        />
      </PageHeader>

      {/* Filter Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="w-[240px]">
          <SearchInput placeholder="과제명 검색..." />
        </div>
        <FilterDropdown
          paramKey="subject"
          label="과목"
          options={subjectOptions}
          allLabel="과목 전체"
        />
        <span className="text-[13px] font-medium text-eo-text-secondary ml-auto">
          총 {assignments.length}건
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            등록일
          </span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">
            과제명
          </span>
          <span className="w-[90px] text-xs font-semibold text-eo-text-secondary">
            과목
          </span>
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">
            마감일
          </span>
          <span className="w-[70px] text-xs font-semibold text-eo-text-secondary">
            제출방식
          </span>
          <span className="w-[50px] text-xs font-semibold text-eo-text-secondary">
            난이도
          </span>
          <span className="w-[130px] text-xs font-semibold text-eo-text-secondary">
            이행률
          </span>
          <span className="w-[60px] text-xs font-semibold text-eo-text-secondary">
            필수
          </span>
        </div>

        {assignments.map((a: AssignmentWithDetails, i) => {
          const createdDate = a.created_at
            ? a.created_at.slice(5, 10).replace("-", ".")
            : "-";
          const subjectColor = a.subjects?.color ?? "#6B7280";
          const submissionLabel =
            submissionTypeLabel[a.submission_type ?? "check"] ?? "체크";
          const diffKey = a.difficulty ?? "";
          const diffLabel = difficultyLabel[diffKey] ?? "-";
          const diffStyle =
            difficultyStyles[diffKey] ?? "bg-[#F3F4F6] text-[#374151]";
          const total = a.assignment_students?.length ?? 0;
          const submitted = a.assignment_students?.filter(
            (s) => s.status === "submitted"
          ).length ?? 0;
          const { label: dueLabel, isOverdue } = a.due_date
            ? getRelativeDueDate(a.due_date)
            : { label: "-", isOverdue: false };

          return (
            <Link
              key={a.id}
              href={`/assignments/${a.id}`}
              className={`flex items-center px-5 py-3 hover:bg-eo-bg-surface transition-colors cursor-pointer ${
                i < assignments.length - 1 ? "border-b border-eo-border" : ""
              }`}
            >
              <span className="w-[80px] text-[13px] text-eo-text-secondary">
                {createdDate}
              </span>

              <span className="flex-1 text-[13px] font-medium text-eo-text-primary">
                {a.title}
              </span>

              <div className="w-[90px]">
                <span
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${subjectColor}20`,
                    color: subjectColor,
                  }}
                >
                  {a.subjects?.name ?? "-"}
                </span>
              </div>

              <span
                className={`w-[100px] text-[13px] ${
                  isOverdue ? "text-eo-danger font-medium" : "text-eo-text-secondary"
                }`}
              >
                {dueLabel}
              </span>

              <span className="w-[70px] text-[13px] text-eo-text-secondary">
                {submissionLabel}
              </span>

              <div className="w-[50px]">
                {diffKey ? (
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${diffStyle}`}
                  >
                    {diffLabel}
                  </span>
                ) : (
                  <span className="text-[13px] text-eo-text-secondary">-</span>
                )}
              </div>

              <div className="w-[130px] pr-4">
                <ProgressBar submitted={submitted} total={total} />
              </div>

              <div className="w-[60px]">
                {a.is_required ? (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5]">
                    필수
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280]">
                    선택
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {assignments.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            등록된 과제가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
