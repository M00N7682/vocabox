import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getStudent,
  getStudentAssessmentScores,
  getStudentAttendance,
  getStudentAssignments,
} from "@/lib/actions/students";
import { getSubjects } from "@/lib/actions/subjects";

function getScoreColor(score: number, total: number): string {
  const pct = total > 0 ? (score / total) * 100 : 0;
  if (pct >= 80) return "text-eo-success";
  if (pct >= 60) return "text-eo-warning";
  return "text-eo-danger";
}

const tabs = [
  { key: "scores", label: "성적" },
  { key: "attendance", label: "출결" },
  { key: "assignments", label: "과제" },
  { key: "analytics", label: "분석" },
  { key: "info", label: "정보" },
];

function AttendanceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    출석: "bg-green-100 text-green-700",
    지각: "bg-yellow-100 text-yellow-700",
    결석: "bg-red-100 text-red-700",
    인정결석: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function AssignmentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    pending: { label: "예정", cls: "bg-gray-100 text-gray-600" },
    submitted: { label: "제출", cls: "bg-green-100 text-green-700" },
    not_submitted: { label: "미제출", cls: "bg-red-100 text-red-700" },
    resubmit: { label: "재제출요청", cls: "bg-yellow-100 text-yellow-700" },
  };
  const c = config[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const activeTab = tabParam ?? "scores";

  const [student, assessmentScores, attendance, assignments, subjects] =
    await Promise.all([
      getStudent(id),
      getStudentAssessmentScores(id),
      getStudentAttendance(id),
      getStudentAssignments(id),
      getSubjects(),
    ]);

  // Resolve student's enrolled subjects
  const studentSubjectIds = new Set<string>();
  for (const sub of subjects) {
    for (const ss of sub.subject_students ?? []) {
      if (ss.student_id === id) {
        studentSubjectIds.add(sub.id);
      }
    }
  }
  const studentSubjects = subjects.filter((s) => studentSubjectIds.has(s.id));

  // Stats
  const allScores = assessmentScores
    .filter((s) => s.score !== null)
    .map((s) => s.score as number);
  const avg =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const attendanceCount = attendance.length;
  const absentCount = attendance.filter((a) => a.status === "결석").length;
  const assignmentSubmittedCount = assignments.filter(
    (a) => a.status === "submitted"
  ).length;

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      {/* Back link */}
      <Link
        href="/students"
        className="flex items-center gap-1.5 text-[13px] text-eo-text-secondary hover:text-eo-text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        학생 목록으로 돌아가기
      </Link>

      <PageHeader
        title={student.name}
        description={`${student.school ?? ""} ${student.grade ?? ""}`}
      >
        <Link
          href={`/students/${id}?tab=info`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-eo-border text-eo-text-primary hover:bg-eo-bg-surface transition-colors"
        >
          정보 수정
        </Link>
        <Link
          href="/scores"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-eo-primary hover:bg-[#4338CA] text-white transition-colors"
        >
          성적 입력
        </Link>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-eo-border">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/students/${id}?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm ${
              activeTab === t.key
                ? "font-semibold text-eo-primary border-b-2 border-eo-primary"
                : "text-eo-text-secondary hover:text-eo-text-primary"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex gap-6 flex-1">
        {/* Left: Profile Column */}
        <div className="flex flex-col gap-4 w-[280px] shrink-0">
          {/* Profile Card */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-eo-border">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#DBEAFE]">
              <span className="text-2xl font-bold text-[#1E40AF]">
                {student.name[0]}
              </span>
            </div>
            <span className="text-lg font-bold text-eo-text-primary">
              {student.name}
            </span>
            <span className="text-[13px] text-eo-text-secondary">
              {student.school ?? "-"} {student.grade ?? ""}
            </span>
            <div className="grid grid-cols-2 gap-2 w-full">
              {[
                { label: "평균", value: avg > 0 ? `${avg}점` : "-" },
                { label: "평가 횟수", value: `${allScores.length}회` },
                { label: "출석", value: `${attendanceCount}회` },
                { label: "결석", value: `${absentCount}회` },
                {
                  label: "과제 제출",
                  value: `${assignmentSubmittedCount}건`,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg bg-eo-bg-page"
                >
                  <span className="text-xs text-eo-text-secondary">
                    {s.label}
                  </span>
                  <span className="text-sm font-bold text-eo-text-primary">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Card */}
          <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
            <span className="text-[13px] font-semibold text-eo-text-primary">
              수강 과목
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {studentSubjects.length > 0 ? (
                studentSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="text-[13px] font-medium px-3 py-1.5 rounded-md"
                    style={{
                      backgroundColor: `${sub.color}20`,
                      color: sub.color,
                    }}
                  >
                    {sub.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-eo-text-secondary">
                  수강 과목 없음
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tab-specific Content */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* ── 성적 tab ── */}
          {activeTab === "scores" && (
            <>
              <span className="text-base font-bold text-eo-text-primary">
                최근 성적 기록
              </span>
              <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
                <div className="flex items-center px-4 py-2.5 bg-eo-bg-surface border-b border-eo-border">
                  <span className="text-xs font-semibold text-eo-text-secondary w-[100px]">
                    날짜
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    평가명
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
                    과목
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
                    점수
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
                    유형
                  </span>
                </div>
                {assessmentScores.length > 0 ? (
                  assessmentScores.map((s, i) => {
                    const assessment = s.assessments;
                    const subjectName = assessment?.subjects?.name ?? "-";
                    const subjectColor =
                      assessment?.subjects?.color ?? "#6B7280";
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center px-4 py-2.5 ${
                          i < assessmentScores.length - 1
                            ? "border-b border-eo-border"
                            : ""
                        }`}
                      >
                        <span className="text-[13px] text-eo-text-secondary w-[100px]">
                          {assessment?.date ?? "-"}
                        </span>
                        <span className="text-[13px] font-medium text-eo-text-primary flex-1 truncate pr-2">
                          {assessment?.name ?? "-"}
                        </span>
                        <div className="w-[80px]">
                          <span
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${subjectColor}20`,
                              color: subjectColor,
                            }}
                          >
                            {subjectName}
                          </span>
                        </div>
                        <span
                          className={`text-[13px] font-semibold w-[80px] ${
                            s.score !== null
                              ? getScoreColor(
                                  s.score,
                                  assessment?.total_points ?? 100
                                )
                              : "text-eo-text-secondary"
                          }`}
                        >
                          {s.score !== null ? `${s.score}점` : "-"}
                        </span>
                        <span className="text-[13px] text-eo-text-secondary w-[80px]">
                          {assessment?.type ?? "-"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
                    성적 기록이 없습니다.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── 출결 tab ── */}
          {activeTab === "attendance" && (
            <>
              <span className="text-base font-bold text-eo-text-primary">
                출결 기록
              </span>
              <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
                <div className="flex items-center px-4 py-2.5 bg-eo-bg-surface border-b border-eo-border">
                  <span className="text-xs font-semibold text-eo-text-secondary w-[100px]">
                    날짜
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    과목
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
                    상태
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[100px]">
                    체크인 시간
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    사유
                  </span>
                </div>
                {attendance.length > 0 ? (
                  attendance.map((a, i) => {
                    const subjectName = a.subjects?.name ?? "-";
                    const subjectColor = a.subjects?.color ?? "#6B7280";
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center px-4 py-2.5 ${
                          i < attendance.length - 1
                            ? "border-b border-eo-border"
                            : ""
                        }`}
                      >
                        <span className="text-[13px] text-eo-text-secondary w-[100px]">
                          {a.date}
                        </span>
                        <div className="flex-1">
                          <span
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${subjectColor}20`,
                              color: subjectColor,
                            }}
                          >
                            {subjectName}
                          </span>
                        </div>
                        <div className="w-[80px]">
                          <AttendanceStatusBadge status={a.status} />
                        </div>
                        <span className="text-[13px] text-eo-text-secondary w-[100px]">
                          {a.check_in_time
                            ? a.check_in_time.slice(0, 5)
                            : "-"}
                        </span>
                        <span className="text-[13px] text-eo-text-secondary flex-1 truncate">
                          {a.reason ?? "-"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
                    출결 기록이 없습니다.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── 과제 tab ── */}
          {activeTab === "assignments" && (
            <>
              <span className="text-base font-bold text-eo-text-primary">
                과제 현황
              </span>
              <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
                <div className="flex items-center px-4 py-2.5 bg-eo-bg-surface border-b border-eo-border">
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    과제명
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
                    과목
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[100px]">
                    마감일
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[90px]">
                    상태
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    피드백
                  </span>
                </div>
                {assignments.length > 0 ? (
                  assignments.map((a, i) => {
                    const assignment = a.assignments;
                    const subjectName = assignment?.subjects?.name ?? "-";
                    const subjectColor =
                      assignment?.subjects?.color ?? "#6B7280";
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center px-4 py-2.5 ${
                          i < assignments.length - 1
                            ? "border-b border-eo-border"
                            : ""
                        }`}
                      >
                        <span className="text-[13px] font-medium text-eo-text-primary flex-1 truncate pr-2">
                          {assignment?.title ?? "-"}
                        </span>
                        <div className="w-[80px]">
                          <span
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${subjectColor}20`,
                              color: subjectColor,
                            }}
                          >
                            {subjectName}
                          </span>
                        </div>
                        <span className="text-[13px] text-eo-text-secondary w-[100px]">
                          {assignment?.due_date ?? "-"}
                        </span>
                        <div className="w-[90px]">
                          <AssignmentStatusBadge status={a.status} />
                        </div>
                        <span className="text-[13px] text-eo-text-secondary flex-1 truncate">
                          {a.feedback ?? "-"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
                    과제 기록이 없습니다.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── 분석 tab ── */}
          {activeTab === "analytics" && (
            <div className="flex items-center justify-center flex-1 py-20 text-sm text-eo-text-secondary">
              분석 데이터를 준비중입니다.
            </div>
          )}

          {/* ── 정보 tab ── */}
          {activeTab === "info" && (
            <>
              <span className="text-base font-bold text-eo-text-primary">
                학생 정보
              </span>
              <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
                {[
                  { label: "이름", value: student.name },
                  { label: "학교", value: student.school ?? "-" },
                  { label: "학년", value: student.grade ?? "-" },
                  { label: "연락처", value: student.phone ?? "-" },
                  { label: "학부모 연락처", value: student.parent_phone ?? "-" },
                  { label: "PIN 코드", value: student.pin_code ?? "-" },
                  {
                    label: "활성 여부",
                    value: student.is_active ? "활성" : "비활성",
                  },
                  { label: "메모", value: student.memo ?? "-" },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-start px-5 py-3.5 gap-4 ${
                      i < arr.length - 1 ? "border-b border-eo-border" : ""
                    }`}
                  >
                    <span className="text-[13px] font-semibold text-eo-text-secondary w-[140px] shrink-0">
                      {row.label}
                    </span>
                    <span className="text-[13px] text-eo-text-primary">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
