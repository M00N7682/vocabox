"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PaymentWithStudent = {
  id: string;
  academy_id: string;
  student_id: string;
  amount: number;
  description: string;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paid_at: string | null;
  payment_method: "cash" | "transfer" | "card" | "auto" | "other" | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  students: { id: string; name: string; grade: string | null; school: string | null; parent_phone: string | null } | null;
};

export async function getPayments(filters?: {
  status?: string;
  studentId?: string;
  month?: string; // YYYY-MM
}): Promise<PaymentWithStudent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("payments")
    .select("*, students(id, name, grade, school, parent_phone)")
    .order("due_date", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.studentId) {
    query = query.eq("student_id", filters.studentId);
  }
  if (filters?.month) {
    const start = `${filters.month}-01`;
    const [y, m] = filters.month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    query = query.gte("due_date", start).lt("due_date", nextMonth);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as PaymentWithStudent[]) ?? [];
}

export async function getPaymentSummary(month?: string) {
  const supabase = await createClient();

  let query = supabase.from("payments").select("status, amount");

  if (month) {
    const start = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    query = query.gte("due_date", start).lt("due_date", nextMonth);
  }

  const { data, error } = await query;
  if (error) throw error;

  const payments = data ?? [];
  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const overdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.status === "paid").length;
  const totalCount = payments.length;

  return { total, paid, pending, overdue, paidCount, totalCount };
}

export async function createPayment(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase.from("profiles").select("academy_id").single();
  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { data: user } = await supabase.auth.getUser();

  const studentId = formData.get("student_id") as string;
  const amount = parseInt(formData.get("amount") as string, 10);
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;
  const memo = (formData.get("memo") as string) || null;

  if (!studentId || !amount || !description || !dueDate) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  const { error } = await supabase.from("payments").insert({
    academy_id: profile.data.academy_id,
    student_id: studentId,
    amount,
    description,
    due_date: dueDate,
    memo,
    created_by: user.user?.id || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/payments");
  return { success: true };
}

// Bulk create payments for all students in a class
export async function createBulkPayments(classId: string, formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase.from("profiles").select("academy_id").single();
  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { data: user } = await supabase.auth.getUser();

  const amount = parseInt(formData.get("amount") as string, 10);
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;
  const memo = (formData.get("memo") as string) || null;

  if (!amount || !description || !dueDate) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  // Get students in class
  const { data: classStudents } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", classId);

  if (!classStudents || classStudents.length === 0) {
    return { error: "반에 등록된 학생이 없습니다." };
  }

  const rows = classStudents.map(cs => ({
    academy_id: profile.data!.academy_id,
    student_id: cs.student_id,
    amount,
    description,
    due_date: dueDate,
    memo,
    created_by: user.user?.id || null,
  }));

  const { error } = await supabase.from("payments").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/payments");
  return { success: true, count: rows.length };
}

export async function updatePaymentStatus(
  paymentId: string,
  status: "pending" | "paid" | "overdue" | "cancelled",
  paymentMethod?: string
) {
  const supabase = await createClient();

  const update: Record<string, unknown> = { status };
  if (status === "paid") {
    update.paid_at = new Date().toISOString();
    if (paymentMethod) update.payment_method = paymentMethod;
  } else {
    update.paid_at = null;
    update.payment_method = null;
  }

  const { error } = await supabase.from("payments").update(update).eq("id", paymentId);

  if (error) return { error: error.message };
  revalidatePath("/payments");
  return { success: true };
}

export async function deletePayment(paymentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) return { error: error.message };
  revalidatePath("/payments");
  return { success: true };
}

// Generate reminder message text for a payment
export function generateReminderMessage(
  studentName: string,
  academyName: string,
  description: string,
  amount: number,
  dueDate: string
): string {
  const formattedAmount = amount.toLocaleString("ko-KR");
  const formattedDate = new Date(dueDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `[${academyName}] 수납 안내

안녕하세요, ${studentName} 학부모님.

${description} 수납 안내드립니다.

▪ 금액: ${formattedAmount}원
▪ 납부기한: ${formattedDate}

감사합니다.
${academyName} 드림`;
}
