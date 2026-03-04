"use server";

import { createClient } from "@/lib/supabase/server";

export async function getScoreTrends(filters?: {
  studentId?: string;
  subjectId?: string;
  months?: number;
}) {
  const supabase = await createClient();

  const monthCount = filters?.months || 6;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthCount + 1, 1);

  let query = supabase
    .from("assessment_scores")
    .select("score, created_at, assessments(date, subject_id)")
    .not("score", "is", null)
    .gte("created_at", startDate.toISOString());

  if (filters?.studentId) {
    query = query.eq("student_id", filters.studentId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const scores = (data ?? []) as unknown as {
    score: number;
    created_at: string;
    assessments: { date: string; subject_id: string } | null;
  }[];

  // Filter by subject if needed
  const filtered = filters?.subjectId
    ? scores.filter((s) => s.assessments?.subject_id === filters.subjectId)
    : scores;

  // Group by month
  const monthMap = new Map<string, number[]>();
  for (let i = 0; i < monthCount; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthCount + 1 + i, 1);
    const key = `${d.getMonth() + 1}월`;
    monthMap.set(key, []);
  }

  for (const s of filtered) {
    const date = new Date(s.assessments?.date ?? s.created_at);
    const key = `${date.getMonth() + 1}월`;
    if (monthMap.has(key)) {
      monthMap.get(key)!.push(s.score);
    }
  }

  return Array.from(monthMap.entries()).map(([month, scores]) => ({
    month,
    score:
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
  }));
}

export async function getUnitAchievement(filters?: {
  studentId?: string;
  subjectId?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("assessment_scores")
    .select("score, assessments(type, total_points, subjects(name))")
    .not("score", "is", null);

  if (filters?.studentId) {
    query = query.eq("student_id", filters.studentId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const scores = (data ?? []) as unknown as {
    score: number;
    assessments: {
      type: string;
      total_points: number;
      subjects: { name: string } | null;
    } | null;
  }[];

  // Group by assessment type
  const typeMap = new Map<string, number[]>();
  for (const s of scores) {
    const type = s.assessments?.type ?? "기타";
    if (!typeMap.has(type)) typeMap.set(type, []);
    const pct = s.assessments?.total_points
      ? Math.round((s.score / s.assessments.total_points) * 100)
      : s.score;
    typeMap.get(type)!.push(pct);
  }

  const colors: Record<string, string> = {
    시험: "bg-eo-primary",
    퀴즈: "bg-[#3B82F6]",
    과제: "bg-eo-warning",
  };

  return Array.from(typeMap.entries()).map(([name, scores]) => ({
    name,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    color: colors[name] || "bg-eo-success",
  }));
}

export async function getWeakAreas(filters?: {
  studentId?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("assessment_scores")
    .select("score, assessments(name, total_points, subjects(name, color))")
    .not("score", "is", null);

  if (filters?.studentId) {
    query = query.eq("student_id", filters.studentId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const scores = (data ?? []) as unknown as {
    score: number;
    assessments: {
      name: string;
      total_points: number;
      subjects: { name: string; color: string } | null;
    } | null;
  }[];

  // Find assessments where score is below 70%
  const weakMap = new Map<
    string,
    { subject: string; color: string; scores: number[]; name: string }
  >();

  for (const s of scores) {
    if (!s.assessments) continue;
    if (!s.assessments.total_points) continue;
    const pct = (s.score / s.assessments.total_points) * 100;
    if (pct < 70) {
      const key = s.assessments.name;
      if (!weakMap.has(key)) {
        weakMap.set(key, {
          subject: s.assessments.subjects?.name ?? "",
          color: s.assessments.subjects?.color ?? "#6B7280",
          scores: [],
          name: s.assessments.name,
        });
      }
      weakMap.get(key)!.scores.push(pct);
    }
  }

  return Array.from(weakMap.values())
    .map((w) => ({
      area: w.name,
      subject: w.subject,
      color: w.color,
      avg: `${Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length)}점`,
      status: w.scores.length >= 3 ? "3회 연속 70% 이하" : "평균 이하",
    }))
    .slice(0, 5);
}

export async function getGrowthSummary(filters?: {
  studentId?: string;
}) {
  const supabase = await createClient();

  const now = new Date();
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];

  let thisMonthQuery = supabase
    .from("assessment_scores")
    .select("score")
    .not("score", "is", null)
    .gte("created_at", thisMonthStart);

  let lastMonthQuery = supabase
    .from("assessment_scores")
    .select("score")
    .not("score", "is", null)
    .gte("created_at", lastMonthStart)
    .lt("created_at", thisMonthStart);

  if (filters?.studentId) {
    thisMonthQuery = thisMonthQuery.eq("student_id", filters.studentId);
    lastMonthQuery = lastMonthQuery.eq("student_id", filters.studentId);
  }

  const [thisResult, lastResult] = await Promise.all([
    thisMonthQuery,
    lastMonthQuery,
  ]);

  const thisScores = (thisResult.data ?? []).map((d) => d.score as number);
  const lastScores = (lastResult.data ?? []).map((d) => d.score as number);

  const thisAvg =
    thisScores.length > 0
      ? Math.round(
          (thisScores.reduce((a, b) => a + b, 0) / thisScores.length) * 10
        ) / 10
      : 0;
  const lastAvg =
    lastScores.length > 0
      ? Math.round(
          (lastScores.reduce((a, b) => a + b, 0) / lastScores.length) * 10
        ) / 10
      : 0;
  const maxScore = thisScores.length > 0 ? Math.max(...thisScores) : 0;
  const change = Math.round((thisAvg - lastAvg) * 10) / 10;

  return [
    {
      label: "이번 달 평균",
      value: `${thisAvg}점`,
      change: `${change >= 0 ? "+" : ""}${change}점`,
      positive: change >= 0,
    },
    {
      label: "최고 점수",
      value: `${maxScore}점`,
      change: "이번 달",
      positive: true,
    },
    {
      label: "성장률",
      value:
        lastAvg > 0
          ? `${change >= 0 ? "+" : ""}${Math.round((change / lastAvg) * 100)}%`
          : "-",
      change: "지난 달 대비",
      positive: change >= 0,
    },
    {
      label: "평가 횟수",
      value: `${thisScores.length}건`,
      change: `지난 달 ${lastScores.length}건`,
      positive: thisScores.length >= lastScores.length,
    },
  ];
}
