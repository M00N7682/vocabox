import { PageHeader } from "@/components/shared/page-header";
import { ClassesClient } from "@/components/classes/classes-client";
import { getClasses } from "@/lib/actions/classes";
import { getSubjects } from "@/lib/actions/subjects";
import { getStudents } from "@/lib/actions/students";

export default async function ClassesPage() {
  const [classes, subjects, allStudents] = await Promise.all([
    getClasses(),
    getSubjects(),
    getStudents({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="반 관리"
        description="반을 생성하고 학생을 배정합니다."
      />
      <ClassesClient
        classes={classes}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        students={allStudents.map((s) => ({ id: s.id, name: s.name, grade: s.grade }))}
      />
    </div>
  );
}
