"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const [
    studentsResult,
    subjectsResult,
    monthAssessmentsResult,
    assessmentScoresResult,
    todayAttendanceResult,
    recentAssessmentsResult,
    textbooksResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("subjects")
      .select("id, name")
      .order("sort_order"),
    supabase
      .from("assessments")
      .select("id")
      .gte("date", monthStart),
    supabase
      .from("assessment_scores")
      .select("score, assessments!inner(date)")
      .not("score", "is", null)
      .gte("assessments.date", monthStart),
    supabase
      .from("attendance")
      .select("status, students(name), subjects(name)")
      .eq("date", today)
      .order("created_at"),
    supabase
      .from("assessments")
      .select("id, name, date, type, subjects(name, color), assessment_scores(score)")
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("textbooks")
      .select("id, name, subjects(color), textbook_chapters(status)")
      .order("sort_order")
      .limit(5),
  ]);

  const studentCount = studentsResult.count ?? 0;
  const subjectCount = (subjectsResult.data ?? []).length;
  const subjectNames = (subjectsResult.data ?? [])
    .slice(0, 2)
    .map((s) => s.name)
    .join(", ");
  const monthAssessmentCount = (monthAssessmentsResult.data ?? []).length;

  const allScores = (assessmentScoresResult.data ?? []) as unknown as {
    score: number;
    assessments: { date: string };
  }[];
  const monthAvg =
    allScores.length > 0
      ? Math.round(
          (allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length) *
            10
        ) / 10
      : 0;

  // Today's schedule from attendance
  const todaySchedule = (todayAttendanceResult.data ?? []) as unknown as {
    status: string;
    students: { name: string } | null;
    subjects: { name: string } | null;
  }[];

  // Recent assessments with avg scores
  const recentAssessments = ((recentAssessmentsResult.data ?? []) as unknown as {
    id: string;
    name: string;
    date: string;
    type: string;
    subjects: { name: string; color: string } | null;
    assessment_scores: { score: number | null }[];
  }[]).map((a) => {
    const scores = a.assessment_scores
      .filter((s) => s.score !== null)
      .map((s) => s.score as number);
    const avg =
      scores.length > 0
        ? Math.round((scores.reduce((x, y) => x + y, 0) / scores.length) * 10) / 10
        : 0;
    return {
      id: a.id,
      name: a.name,
      date: a.date,
      type: a.type,
      subject: a.subjects?.name ?? "",
      subjectColor: a.subjects?.color ?? "#6B7280",
      avg,
    };
  });

  // Textbook progress
  const textbookProgress = ((textbooksResult.data ?? []) as unknown as {
    id: string;
    name: string;
    subjects: { color: string } | null;
    textbook_chapters: { status: string }[];
  }[]).map((t) => {
    const total = t.textbook_chapters.length;
    const completed = t.textbook_chapters.filter(
      (ch) => ch.status === "완료"
    ).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: t.name,
      pct,
      color: t.subjects?.color ?? "#6B7280",
    };
  });

  return {
    studentCount,
    subjectCount,
    subjectNames,
    monthAssessmentCount,
    monthAvg,
    todaySchedule,
    recentAssessments,
    textbookProgress,
  };
}
