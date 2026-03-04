import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAssignment } from "@/lib/actions/assignments";
import { getStudents } from "@/lib/actions/students";
import { AssignmentDetailClient } from "@/components/assignments/assignment-detail-client";
import { notFound } from "next/navigation";

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

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [assignment, allStudents] = await Promise.all([
    getAssignment(id),
    getStudents({ activeOnly: true }),
  ]);

  if (!assignment) notFound();

  const assignedStudentIds = new Set(
    assignment.assignment_students.map((as) => as.student_id)
  );

  const availableStudents = allStudents.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    assigned: assignedStudentIds.has(s.id),
  }));

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <Link
        href="/assignments"
        className="flex items-center gap-1.5 text-[13px] text-eo-text-secondary hover:text-eo-text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        과제 목록으로 돌아가기
      </Link>

      <PageHeader
        title={assignment.title}
        description={assignment.subjects?.name ?? "과목 미지정"}
      />

      {/* Assignment Info */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "마감일", value: assignment.due_date ?? "-" },
          {
            label: "제출 방식",
            value: submissionTypeLabel[assignment.submission_type ?? "check"] ?? "체크",
          },
          {
            label: "난이도",
            value: assignment.difficulty ? difficultyLabel[assignment.difficulty] ?? "-" : "-",
          },
          {
            label: "필수 여부",
            value: assignment.is_required ? "필수" : "선택",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 p-4 bg-white rounded-xl border border-eo-border"
          >
            <span className="text-xs text-eo-text-secondary">{item.label}</span>
            <span className="text-sm font-semibold text-eo-text-primary">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {assignment.description && (
        <div className="p-4 bg-white rounded-xl border border-eo-border">
          <span className="text-xs text-eo-text-secondary">설명</span>
          <p className="text-sm text-eo-text-primary mt-1">
            {assignment.description}
          </p>
        </div>
      )}

      {/* Student Management (Client Component) */}
      <AssignmentDetailClient
        assignmentId={assignment.id}
        assignmentStudents={assignment.assignment_students.map((as) => ({
          studentId: as.student_id,
          studentName: as.students?.name ?? "-",
          studentGrade: as.students?.grade ?? null,
          status: as.status,
          feedback: as.feedback,
          submittedAt: as.submitted_at,
        }))}
        availableStudents={availableStudents}
      />
    </div>
  );
}
