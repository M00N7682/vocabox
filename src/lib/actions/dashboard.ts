"use server";

import { createClient } from "@/lib/supabase/server";

export type ScheduleItem = {
  id: string;
  status: string;
  students: { name: string } | null;
  vocab_books: { title: string } | null;
};

export type RecentScore = {
  id: string;
  test_date: string;
  score_percentage: number;
  test_type: string;
  student_id: string;
  students: { name: string } | null;
  vocab_books: { title: string } | null;
};

export async function getDashboardData() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const [
    studentsResult,
    vocabBooksResult,
    monthScoresResult,
    todaySchedulesResult,
    recentScoresResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("vocab_books")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("scores")
      .select("score_percentage")
      .gte("test_date", monthStart),
    supabase
      .from("schedules")
      .select("id, status, students(name), vocab_books(title)")
      .eq("scheduled_date", today)
      .order("created_at"),
    supabase
      .from("scores")
      .select(
        "id, test_date, score_percentage, test_type, student_id, students(name), vocab_books(title)"
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const studentCount = studentsResult.count ?? 0;
  const vocabBookCount = vocabBooksResult.count ?? 0;

  const monthScores = monthScoresResult.data ?? [];
  const monthTestCount = monthScores.length;
  const monthAvg =
    monthScores.length > 0
      ? Math.round(
          (monthScores.reduce(
            (sum, s) => sum + Number(s.score_percentage),
            0
          ) /
            monthScores.length) *
            10
        ) / 10
      : 0;

  return {
    studentCount,
    vocabBookCount,
    monthTestCount,
    monthAvg,
    todaySchedules:
      (todaySchedulesResult.data as unknown as ScheduleItem[]) ?? [],
    recentScores:
      (recentScoresResult.data as unknown as RecentScore[]) ?? [],
  };
}
