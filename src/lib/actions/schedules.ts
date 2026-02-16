"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Schedule } from "@/types/database";

export type ScheduleWithRelations = Schedule & {
  students: { name: string } | null;
  vocab_books: { title: string } | null;
};

export async function getSchedules(options?: {
  month?: string;
  studentId?: string;
  status?: string;
}): Promise<ScheduleWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("schedules")
    .select("*, students(name), vocab_books(title)")
    .order("scheduled_date");

  if (options?.month) {
    const startDate = `${options.month}-01`;
    const [y, m] = options.month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${options.month}-${String(lastDay).padStart(2, "0")}`;
    query = query
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate);
  }

  if (options?.studentId) {
    query = query.eq("student_id", options.studentId);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as ScheduleWithRelations[]) ?? [];
}

export async function createSchedule(input: {
  studentId: string;
  vocabBookId: string;
  scheduledDate: string;
  note?: string;
}) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("schedules").insert({
    academy_id: profile.data.academy_id,
    student_id: input.studentId,
    vocab_book_id: input.vocabBookId,
    scheduled_date: input.scheduledDate,
    note: input.note || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateScheduleStatus(
  id: string,
  status: "scheduled" | "in_progress" | "completed" | "missed"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedules")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/schedule");
  return { success: true };
}

export async function bulkCreateSchedules(
  schedules: {
    studentId: string;
    vocabBookId: string;
    scheduledDate: string;
    note?: string;
  }[]
) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const rows = schedules.map((s) => ({
    academy_id: profile.data!.academy_id,
    student_id: s.studentId,
    vocab_book_id: s.vocabBookId,
    scheduled_date: s.scheduledDate,
    note: s.note || null,
  }));

  const { error } = await supabase.from("schedules").insert(rows);

  if (error) return { error: error.message };

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}
