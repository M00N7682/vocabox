import { notFound } from "next/navigation";
import { getClassDetail, getClassAssessments, getClassAssignments, getClassAttendance } from "@/lib/actions/classes";
import { getClassTextbooks } from "@/lib/actions/textbooks";
import { getTextbookChapters } from "@/lib/actions/textbooks";
import { getQuickRecords, getQuickRecordCategories } from "@/lib/actions/quick-records";
import { getStudents } from "@/lib/actions/students";
import { ClassDetailClient } from "@/components/classes/class-detail-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  let classData;
  try {
    classData = await getClassDetail(id);
  } catch {
    notFound();
  }

  // Build date range for this week (Mon-Sun)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const dateFrom = monday.toISOString().split("T")[0];
  const dateTo = sunday.toISOString().split("T")[0];

  const [assessments, assignments, attendance, textbooks, quickRecords, categories, allStudents] = await Promise.all([
    getClassAssessments(id),
    getClassAssignments(id),
    getClassAttendance(id, dateFrom, dateTo),
    getClassTextbooks(id),
    getQuickRecords(id, { dateFrom, dateTo }),
    getQuickRecordCategories(id),
    getStudents({ activeOnly: true }),
  ]);

  // Build textbook chapters map
  const chaptersMap: Record<string, Awaited<ReturnType<typeof getTextbookChapters>>> = {};
  await Promise.all(
    textbooks.map(async (tb: { id: string }) => {
      chaptersMap[tb.id] = await getTextbookChapters(tb.id);
    })
  );

  const students = (classData.class_students ?? [])
    .map((cs: { students: { id: string; name: string; grade: string | null; school: string | null; is_active: boolean } | null }) => cs.students)
    .filter(Boolean) as { id: string; name: string; grade: string | null; school: string | null; is_active: boolean }[];

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/classes"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-eo-bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-eo-text-secondary" />
        </Link>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold text-eo-text-primary">{classData.name}</h1>
          <span className="text-[13px] text-eo-text-secondary">
            {(classData as { subjects?: { name: string } | null }).subjects?.name ?? "과목 미지정"} · {students.length}명
            {classData.description ? ` · ${classData.description}` : ""}
          </span>
        </div>
      </div>

      <ClassDetailClient
        classId={id}
        className={classData.name}
        subjectId={(classData as { subject_id?: string | null }).subject_id ?? null}
        students={students}
        allStudents={allStudents.map(s => ({ id: s.id, name: s.name, grade: s.grade }))}
        assessments={assessments}
        assignments={assignments}
        attendance={attendance}
        textbooks={textbooks}
        chaptersMap={chaptersMap}
        quickRecords={quickRecords}
        categories={categories}
        dateFrom={dateFrom}
        dateTo={dateTo}
        initialTab={tab ?? "overview"}
      />
    </div>
  );
}
