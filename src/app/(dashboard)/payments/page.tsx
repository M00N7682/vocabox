import { getPayments, getPaymentSummary } from "@/lib/actions/payments";
import { getClasses } from "@/lib/actions/classes";
import { getStudents } from "@/lib/actions/students";
import { getAcademyInfo } from "@/lib/actions/settings";
import { PaymentsClient } from "@/components/payments/payments-client";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string }>;
}) {
  const params = await searchParams;
  const currentMonth = params.month || new Date().toISOString().slice(0, 7);

  const [payments, summary, classes, allStudents, academy] = await Promise.all([
    getPayments({ status: params.status, month: currentMonth }),
    getPaymentSummary(currentMonth),
    getClasses(),
    getStudents(),
    getAcademyInfo(),
  ]);

  const students = allStudents.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    school: s.school,
    parent_phone: s.parent_phone,
  }));

  return (
    <PaymentsClient
      payments={payments}
      summary={summary}
      classes={classes}
      students={students}
      academyName={academy?.name || "학원"}
      currentMonth={currentMonth}
      currentStatus={params.status || "all"}
    />
  );
}
