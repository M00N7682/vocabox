import { notFound } from "next/navigation";
import {
  getReportByToken,
  getStudentAttendanceByToken,
  getStudentAssignmentsByToken,
  getStudentRecordsByToken,
  getStudentScoresByToken,
  getStudentPaymentsByToken,
} from "@/lib/actions/parent-report";
import { ParentReportClient } from "@/components/parent-report/parent-report-client";

export default async function ParentReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const report = await getReportByToken(token);
  if (!report) return notFound();

  const [attendance, assignments, records, scores, payments] = await Promise.all([
    getStudentAttendanceByToken(token),
    getStudentAssignmentsByToken(token),
    getStudentRecordsByToken(token),
    getStudentScoresByToken(token),
    getStudentPaymentsByToken(token),
  ]);

  return (
    <ParentReportClient
      studentName={report.student_name}
      academyName={report.academy_name}
      attendance={attendance}
      assignments={assignments}
      records={records}
      scores={scores}
      payments={payments}
    />
  );
}
