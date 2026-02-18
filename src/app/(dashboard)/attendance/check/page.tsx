import { PageHeader } from "@/components/shared/page-header";
import { AttendanceCheckClient } from "@/components/attendance/attendance-check-client";
import { getSubjects } from "@/lib/actions/subjects";

export default async function AttendanceCheckPage() {
  const subjects = await getSubjects();
  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="출결 체크" description="QR코드 또는 PIN번호로 출결을 체크합니다" />
      <AttendanceCheckClient subjects={subjects.map(s => ({ id: s.id, name: s.name, color: s.color }))} />
    </div>
  );
}
