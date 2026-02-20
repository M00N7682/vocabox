"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordAttendanceSchema, updateAttendanceSchema, checkInByPinSchema, validate } from "@/lib/validations";
import type { Attendance } from "@/types/database";

export type AttendanceStatus = "출석" | "지각" | "결석" | "인정결석";
export type CheckMethod = "qr" | "pin" | "manual";

export type AttendanceWithDetails = Attendance & {
  students: { id: string; name: string } | null;
  subjects: { name: string; color: string } | null;
};

export async function getAttendance(filters?: {
  date?: string;
  subjectId?: string;
  status?: string;
  search?: string;
}): Promise<AttendanceWithDetails[]> {
  const supabase = await createClient();

  const targetDate = filters?.date || new Date().toISOString().split("T")[0];

  let query = supabase
    .from("attendance")
    .select("*, students(id, name), subjects(name, color)")
    .eq("date", targetDate)
    .order("created_at");

  if (filters?.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;

  let result = (data as unknown as AttendanceWithDetails[]) ?? [];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    result = result.filter((a) =>
      a.students?.name.toLowerCase().includes(search)
    );
  }

  return result;
}

export async function getAttendanceSummary(date?: string) {
  const supabase = await createClient();

  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("date", targetDate);

  if (error) throw error;

  const records = data ?? [];
  const total = records.length;
  const present = records.filter((r) => r.status === "출석").length;
  const late = records.filter((r) => r.status === "지각").length;
  // '인정결석' counts as excused (not absent) — included in the attendance rate
  const excused = records.filter((r) => r.status === "인정결석").length;
  const absent = records.filter((r) => r.status === "결석").length;
  const rate =
    total > 0
      ? Math.round(((present + late + excused) / total) * 1000) / 10
      : 0;

  return { total, present, late, excused, absent, rate };
}

export async function recordAttendance(data: {
  student_id: string;
  subject_id: string;
  date: string;
  class_time_start?: string;
  class_time_end?: string;
  check_in_time?: string;
  status: AttendanceStatus;
  reason?: string;
  check_method?: CheckMethod;
  recorded_by?: string;
}) {
  const parsed = validate(recordAttendanceSchema, data);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("attendance").insert({
    academy_id: profile.data.academy_id,
    student_id: data.student_id,
    subject_id: data.subject_id,
    date: data.date,
    class_time_start: data.class_time_start || null,
    class_time_end: data.class_time_end || null,
    check_in_time: data.check_in_time || null,
    status: data.status,
    reason: data.reason || null,
    check_method: data.check_method || "manual",
    recorded_by: data.recorded_by || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/attendance");
  return { success: true };
}

export async function bulkRecordAttendance(
  records: {
    student_id: string;
    subject_id: string;
    date: string;
    class_time_start?: string;
    class_time_end?: string;
    check_in_time?: string;
    status: AttendanceStatus;
    reason?: string;
    check_method?: CheckMethod;
    recorded_by?: string;
  }[]
) {
  const parsed = validate(z.array(recordAttendanceSchema).min(1, "출석 기록을 1개 이상 입력하세요."), records);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const insertData = records.map((r) => ({
    academy_id: profile.data!.academy_id,
    student_id: r.student_id,
    subject_id: r.subject_id,
    date: r.date,
    class_time_start: r.class_time_start || null,
    class_time_end: r.class_time_end || null,
    check_in_time: r.check_in_time || null,
    status: r.status,
    reason: r.reason || null,
    check_method: r.check_method || "manual",
    recorded_by: r.recorded_by || null,
  }));

  const { error } = await supabase.from("attendance").insert(insertData);

  if (error) return { error: error.message };

  revalidatePath("/attendance");
  return { success: true };
}

export async function updateAttendance(
  id: string,
  data: {
    status?: AttendanceStatus;
    check_in_time?: string;
    reason?: string;
    check_method?: CheckMethod;
    recorded_by?: string;
  }
) {
  const parsed = validate(updateAttendanceSchema, data);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("attendance")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/attendance");
  return { success: true };
}

/**
 * Look up a student by their PIN code and record attendance for the given
 * subject with check_method='pin'. Returns an error if the PIN does not match
 * any student or if the student is not enrolled in the subject.
 */
export async function checkInByPin(pinCode: string, subjectId: string) {
  const parsed = validate(checkInByPinSchema, { pinCode, subjectId });
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  // Look up student by pin_code
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, name")
    .eq("pin_code", pinCode)
    .single();

  if (studentError || !student) {
    return { error: "PIN 코드에 해당하는 학생을 찾을 수 없습니다." };
  }

  // Verify the student is enrolled in the subject
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("subject_enrollments")
    .select("id")
    .eq("student_id", student.id)
    .eq("subject_id", subjectId)
    .single();

  if (enrollmentError || !enrollment) {
    return { error: "해당 수업에 등록된 학생이 아닙니다." };
  }

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const today = new Date().toISOString().split("T")[0];
  const checkInTime = new Date().toISOString();

  // Upsert so a second PIN tap updates rather than duplicates the record
  const { error } = await supabase
    .from("attendance")
    .upsert(
      {
        academy_id: profile.data.academy_id,
        student_id: student.id,
        subject_id: subjectId,
        date: today,
        check_in_time: checkInTime,
        status: "출석" as AttendanceStatus,
        check_method: "pin" as CheckMethod,
        recorded_by: profile.data.id,
      },
      { onConflict: "student_id,subject_id,date" }
    );

  if (error) return { error: error.message };

  revalidatePath("/attendance");
  return { success: true, student: { id: student.id, name: student.name } };
}

/**
 * Aggregate attendance counts by day for the given calendar month.
 * Returns an array of objects with the date and counts for each status.
 */
export async function getMonthlyStats(year: number, month: number) {
  const supabase = await createClient();

  // Build date range for the month (month is 1-based)
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("attendance")
    .select("date, status")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date");

  if (error) throw error;

  const records = data ?? [];

  // Group by date
  const byDate: Record<
    string,
    { present: number; late: number; absent: number; excused: number; total: number }
  > = {};

  for (const r of records) {
    if (!byDate[r.date]) {
      byDate[r.date] = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
    }
    byDate[r.date].total += 1;
    if (r.status === "출석") byDate[r.date].present += 1;
    else if (r.status === "지각") byDate[r.date].late += 1;
    else if (r.status === "결석") byDate[r.date].absent += 1;
    else if (r.status === "인정결석") byDate[r.date].excused += 1;
  }

  return Object.entries(byDate).map(([date, counts]) => ({
    date,
    ...counts,
    rate:
      counts.total > 0
        ? Math.round(
            ((counts.present + counts.late + counts.excused) / counts.total) *
              1000
          ) / 10
        : 0,
  }));
}

/**
 * Calculate the attendance rate for a specific student over the last N months
 * (default 3). '인정결석' is treated as attended for rate calculation.
 */
export async function getStudentAttendanceRate(
  studentId: string,
  months: number = 3
) {
  const supabase = await createClient();

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = now.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("status, date")
    .eq("student_id", studentId)
    .gte("date", startDateStr)
    .lte("date", endDateStr)
    .order("date");

  if (error) throw error;

  const records = data ?? [];
  const total = records.length;
  const present = records.filter((r) => r.status === "출석").length;
  const late = records.filter((r) => r.status === "지각").length;
  const excused = records.filter((r) => r.status === "인정결석").length;
  const absent = records.filter((r) => r.status === "결석").length;
  const attended = present + late + excused;
  const rate = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;

  return {
    studentId,
    months,
    total,
    present,
    late,
    excused,
    absent,
    attended,
    rate,
    startDate: startDateStr,
    endDate: endDateStr,
  };
}
