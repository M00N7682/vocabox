import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { getSubjects } from "@/lib/actions/subjects";
import { getAssessmentScoresByStudent } from "@/lib/actions/assessments";
import { createClient } from "@/lib/supabase/server";

const statusStyles: Record<string, string> = {
  응시: "bg-[#ECFDF5] text-[#10B981]",
  결시: "bg-[#FEE2E2] text-[#EF4444]",
  지각: "bg-[#FEF3C7] text-[#D97706]",
  미제출: "bg-[#FEE2E2] text-[#EF4444]",
  보강예정: "bg-[#EEF2FF] text-[#4F46E5]",
  면제: "bg-[#F1F5F9] text-[#6B7280]",
};

async function getStudents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

async function HistoryTable({
  studentId,
  subjectId,
}: {
  studentId?: string;
  subjectId?: string;
}) {
  if (!studentId) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-eo-text-secondary">
        학생을 선택하면 성적 이력이 표시됩니다.
      </div>
    );
  }

  const allScores = await getAssessmentScoresByStudent(studentId);

  const scores = subjectId
    ? allScores.filter(
        (s) => s.assessments?.subject_id === subjectId
      )
    : allScores;

  return (
    <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
      <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
        <span className="w-[50px] text-xs font-semibold text-eo-text-secondary">
          #
        </span>
        <span className="w-[140px] text-xs font-semibold text-eo-text-secondary">
          날짜
        </span>
        <span className="flex-1 text-xs font-semibold text-eo-text-secondary">
          평가명
        </span>
        <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">
          과목
        </span>
        <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
          유형
        </span>
        <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
          점수
        </span>
        <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
          상태
        </span>
      </div>

      {scores.length > 0 ? (
        scores.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center px-5 py-2.5 ${
              i < scores.length - 1 ? "border-b border-eo-border" : ""
            }`}
          >
            <span className="w-[50px] text-[13px] text-eo-text-secondary">
              {i + 1}
            </span>
            <span className="w-[140px] text-[13px] text-eo-text-secondary">
              {s.assessments?.date ?? "-"}
            </span>
            <span className="flex-1 text-[13px] font-medium text-eo-text-primary truncate pr-2">
              {s.assessments?.name ?? "-"}
            </span>
            <span className="w-[100px] text-[13px] text-eo-text-secondary truncate">
              {s.assessments?.subjects?.name ?? "-"}
            </span>
            <span className="w-[80px] text-[13px] text-eo-text-secondary">
              {s.assessments?.type ?? "-"}
            </span>
            <span className="w-[80px] text-[13px] font-semibold text-eo-text-primary">
              {s.score !== null
                ? `${s.score}점`
                : s.grade_value
                  ? s.grade_value
                  : s.check_value !== null
                    ? s.check_value
                      ? "완료"
                      : "미완료"
                    : "-"}
            </span>
            <div className="w-[80px]">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  statusStyles[s.status] ?? "bg-[#F1F5F9] text-[#6B7280]"
                }`}
              >
                {s.status}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
          성적 이력이 없습니다.
        </div>
      )}
    </div>
  );
}

export default async function ScoreHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; subject?: string }>;
}) {
  const { student, subject } = await searchParams;

  const [subjects, students] = await Promise.all([
    getSubjects(),
    getStudents(),
  ]);

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="성적 이력"
        description="학생별 평가 성적 이력을 조회합니다."
      />

      <div className="flex items-center gap-3">
        <Suspense>
          <FilterDropdown
            paramKey="student"
            label="학생"
            allLabel="학생 선택"
            options={studentOptions}
          />
          <FilterDropdown
            paramKey="subject"
            label="과목"
            allLabel="과목: 전체"
            options={subjectOptions}
          />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-sm text-eo-text-secondary">
            로딩 중...
          </div>
        }
      >
        <HistoryTable studentId={student} subjectId={subject} />
      </Suspense>
    </div>
  );
}
