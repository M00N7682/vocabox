import { PageHeader } from "@/components/shared/page-header";
import { getAssessment, getAssessmentScores, getAssessments } from "@/lib/actions/assessments";
import { getStudents } from "@/lib/actions/students";
import { getClasses } from "@/lib/actions/classes";
import { getSubjects } from "@/lib/actions/subjects";
import { ScoreInputClient } from "@/components/scores/score-input-client";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import Link from "next/link";

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ assessment?: string; class?: string; subject?: string; search?: string }>;
}) {
  const params = await searchParams;
  const assessmentId = params.assessment;

  if (!assessmentId) {
    const [classes, subjects] = await Promise.all([
      getClasses(),
      getSubjects({ isActive: true }),
    ]);

    const filters: { subjectId?: string; status?: string; search?: string } = {};
    if (params.subject) filters.subjectId = params.subject;
    if (params.search) filters.search = params.search;

    const assessments = await getAssessments(filters.subjectId || filters.search ? filters : { status: "진행중" });
    const allAssessments = assessments.length === 0 && !filters.subjectId && !filters.search ? await getAssessments({}) : assessments;
    const hasAny = allAssessments.length > 0 || assessments.length > 0;
    const displayAssessments = assessments.length > 0 ? assessments : allAssessments.slice(0, 10);

    // Filter by class if selected
    const filteredAssessments = params.class
      ? displayAssessments.filter((a: any) => a.class_id === params.class)
      : displayAssessments;

    const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));
    const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

    return (
      <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
        <PageHeader title="성적 관리" description="평가를 선택하여 성적을 입력합니다" />

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-[200px]">
            <SearchInput placeholder="평가명 검색..." />
          </div>
          <FilterDropdown paramKey="subject" label="과목" options={subjectOptions} allLabel="과목 전체" />
          <FilterDropdown paramKey="class" label="반" options={classOptions} allLabel="반 전체" />
        </div>

        {assessments.length === 0 && hasAny && !filters.subjectId && !filters.search && (
          <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[13px] text-[#92400E]">
            진행중인 평가가 없습니다. 아래 최근 평가 목록에서 선택하거나, <Link href="/assessments" className="underline font-medium">평가 관리</Link> → 평가 클릭 → 상태 배지를 클릭하면 &quot;예정 → 진행중 → 완료&quot;로 변경됩니다.
          </div>
        )}
        <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
          <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
            <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">날짜</span>
            <span className="flex-1 text-xs font-semibold text-eo-text-secondary">평가명</span>
            <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">과목</span>
            <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">채점방식</span>
            <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">상태</span>
          </div>
          {filteredAssessments.length > 0 ? filteredAssessments.map((a, i) => {
            const subjectColor = a.subjects?.color ?? "#6B7280";
            const scoringLabel = a.scoring_method === "score" ? "점수형" : a.scoring_method === "grade" ? "등급형" : "체크형";
            const statusStyle = a.status === "완료" ? "bg-[#ECFDF5] text-[#10B981]" : a.status === "진행중" ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F1F5F9] text-[#6B7280]";
            return (
              <Link key={a.id} href={`/scores?assessment=${a.id}`}
                className={`flex items-center px-5 py-3 hover:bg-eo-bg-page/50 transition-colors ${i < filteredAssessments.length - 1 ? "border-b border-eo-border" : ""}`}>
                <span className="w-[100px] text-[13px] text-eo-text-secondary">{a.date}</span>
                <span className="flex-1 text-[13px] font-medium text-eo-text-primary">{a.name}</span>
                <div className="w-[80px]">
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}>{a.subjects?.name ?? "-"}</span>
                </div>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">{scoringLabel}</span>
                <div className="w-[80px]">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusStyle}`}>{a.status}</span>
                </div>
              </Link>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-sm text-eo-text-secondary">등록된 평가가 없습니다.</span>
              <Link href="/assessments" className="text-sm text-eo-primary hover:text-[#4338CA] font-medium underline">
                평가 관리에서 평가를 먼저 추가해주세요
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const [assessment, scores, allStudents] = await Promise.all([
    getAssessment(assessmentId),
    getAssessmentScores(assessmentId),
    getStudents({ activeOnly: true }),
  ]);

  const enrolledIds = new Set(scores.map((s) => s.student_id));
  const availableStudents = allStudents
    .filter((s) => !enrolledIds.has(s.id))
    .map((s) => ({ id: s.id, name: s.name, grade: s.grade }));

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="성적 입력" description={`${assessment.name} (${assessment.scoring_method === "score" ? "점수형" : assessment.scoring_method === "grade" ? "등급형" : "체크형"})`} />
      <ScoreInputClient
        assessmentId={assessmentId}
        subjectId={assessment.subject_id}
        totalPoints={assessment.total_points}
        scoringMethod={assessment.scoring_method}
        scores={scores}
        availableStudents={availableStudents}
      />
    </div>
  );
}
