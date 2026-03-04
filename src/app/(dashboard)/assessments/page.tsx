import { PageHeader } from "@/components/shared/page-header";
import { AssessmentAddButton } from "@/components/assessments/assessment-add-button";
import Link from "next/link";
import { getAssessments } from "@/lib/actions/assessments";
import { getSubjects } from "@/lib/actions/subjects";
import { getStudents } from "@/lib/actions/students";
import { SearchInput } from "@/components/shared/search-input";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { Suspense } from "react";

const statusStyles: Record<string, string> = {
  완료: "bg-[#ECFDF5] text-[#10B981]",
  진행중: "bg-[#FEF3C7] text-[#D97706]",
  예정: "bg-[#F1F5F9] text-[#6B7280]",
};

const scoringMethodLabels: Record<string, string> = {
  score: "점수",
  grade: "등급",
  check: "체크",
};

function getAvgColor(avg: number): string {
  if (avg >= 80) return "text-eo-success";
  if (avg >= 70) return "text-eo-warning";
  if (avg > 0) return "text-eo-text-primary";
  return "text-eo-text-secondary";
}

const typeOptions = [
  { value: "시험", label: "시험" },
  { value: "퀴즈", label: "퀴즈" },
  { value: "과제", label: "과제" },
  { value: "수행평가", label: "수행평가" },
  { value: "출석점수", label: "출석점수" },
];

const statusOptions = [
  { value: "완료", label: "완료" },
  { value: "진행중", label: "진행중" },
  { value: "예정", label: "예정" },
];

function FiltersRow({
  subjects,
  totalCount,
}: {
  subjects: { id: string; name: string }[];
  totalCount: number;
}) {
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[280px]">
        <SearchInput placeholder="평가명 검색..." />
      </div>
      <FilterDropdown
        paramKey="subject"
        label="과목"
        options={subjectOptions}
        allLabel="과목: 전체"
      />
      <FilterDropdown
        paramKey="type"
        label="유형"
        options={typeOptions}
        allLabel="유형: 전체"
      />
      <FilterDropdown
        paramKey="status"
        label="상태"
        options={statusOptions}
        allLabel="상태: 전체"
      />
      <span className="text-[13px] font-medium text-eo-text-secondary">
        총 {totalCount}건
      </span>
    </div>
  );
}

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string;
    type?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const [assessments, subjects, allStudents] = await Promise.all([
    getAssessments({
      subjectId: params.subject,
      type: params.type,
      status: params.status,
      search: params.search,
    }),
    getSubjects(),
    getStudents({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="평가 관리"
        description="시험, 퀴즈, 과제 등 평가를 관리합니다"
      >
        <AssessmentAddButton
          subjects={subjects.map((s) => ({
            id: s.id,
            name: s.name,
            studentIds: (s.subject_students ?? []).map((ss) => ss.student_id),
          }))}
          students={allStudents.map((s) => ({ id: s.id, name: s.name, grade: s.grade }))}
        />
      </PageHeader>

      {/* Filter Row — client components need Suspense */}
      <Suspense
        fallback={
          <div className="h-9 flex items-center text-sm text-eo-text-secondary">
            필터 로딩 중...
          </div>
        }
      >
        <FiltersRow subjects={subjects} totalCount={assessments.length} />
      </Suspense>

      {/* Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        {/* Table Head */}
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            날짜
          </span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">
            평가명
          </span>
          <span className="w-[90px] text-xs font-semibold text-eo-text-secondary">
            과목
          </span>
          <span className="w-[70px] text-xs font-semibold text-eo-text-secondary">
            유형
          </span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            채점방식
          </span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            응시/총원
          </span>
          <span className="w-[70px] text-xs font-semibold text-eo-text-secondary">
            평균
          </span>
          <span className="w-[70px] text-xs font-semibold text-eo-text-secondary">
            상태
          </span>
        </div>

        {/* Table Body */}
        {assessments.map((a, i) => {
          const dateStr = a.date.slice(5).replace("-", ".");
          const totalStudents = a.assessment_scores?.length ?? 0;
          const presentStudents =
            a.assessment_scores?.filter((s) => s.status === "응시").length ?? 0;
          const scores =
            a.assessment_scores
              ?.filter((s) => s.score !== null)
              .map((s) => s.score as number) ?? [];
          const avg =
            scores.length > 0
              ? Math.round(
                  scores.reduce((x, y) => x + y, 0) / scores.length
                )
              : 0;
          const subjectColor = a.subjects?.color ?? "#6B7280";

          return (
            <Link
              key={a.id}
              href={`/assessments/${a.id}`}
              className={`flex items-center px-5 py-3 hover:bg-eo-bg-page/50 transition-colors cursor-pointer ${
                i < assessments.length - 1 ? "border-b border-eo-border" : ""
              }`}
            >
              <span className="w-[80px] text-[13px] text-eo-text-secondary">
                {dateStr}
              </span>
              <span className="flex-1 text-[13px] font-medium text-eo-text-primary">
                {a.name}
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
              <span className="w-[70px] text-[13px] text-eo-text-primary">
                {a.type}
              </span>
              <span className="w-[80px] text-[13px] text-eo-text-secondary">
                {scoringMethodLabels[a.scoring_method] ?? a.scoring_method}
              </span>
              <span className="w-[80px] text-[13px] text-eo-text-primary">
                {presentStudents}/{totalStudents}
              </span>
              <span
                className={`w-[70px] text-[13px] font-semibold ${getAvgColor(avg)}`}
              >
                {avg > 0 ? `${avg}점` : "-"}
              </span>
              <div className="w-[70px]">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    statusStyles[a.status] ?? statusStyles["예정"]
                  }`}
                >
                  {a.status}
                </span>
              </div>
            </Link>
          );
        })}

        {assessments.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            등록된 평가가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
