import { PageHeader } from "@/components/shared/page-header";
import { getSubjects } from "@/lib/actions/subjects";
import type { SubjectType } from "@/lib/actions/subjects";
import { getTeachers } from "@/lib/actions/settings";
import { getStudents } from "@/lib/actions/students";
import { SubjectsClient } from "@/components/subjects/subjects-client";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; active?: string }>;
}) {
  const params = await searchParams;
  const [subjects, teachers, allStudents] = await Promise.all([
    getSubjects({
      search: params.search,
      type: params.type as SubjectType | undefined,
      isActive:
        params.active !== undefined ? params.active === "true" : undefined,
    }),
    getTeachers(),
    getStudents({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="과목 관리"
        description="학원에서 운영 중인 과목을 관리합니다"
      />
      <SubjectsClient
        subjects={subjects}
        teachers={teachers}
        students={allStudents.map((s) => ({ id: s.id, name: s.name, grade: s.grade }))}
      />
    </div>
  );
}
