"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Score } from "@/types/database";
import { saveScoreSchema, validate } from "@/lib/validations";

export type ScoreWithRelations = Score & {
  students: { name: string } | null;
  vocab_books: { title: string } | null;
};

export async function getScores(options?: {
  studentId?: string;
  vocabBookId?: string;
  classId?: string;
  testType?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ScoreWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("scores")
    .select("*, students(name), vocab_books(title)")
    .order("test_date", { ascending: false });

  if (options?.studentId) {
    query = query.eq("student_id", options.studentId);
  }
  if (options?.vocabBookId) {
    query = query.eq("vocab_book_id", options.vocabBookId);
  }
  if (options?.testType) {
    query = query.eq("test_type", options.testType);
  }
  if (options?.dateFrom) {
    query = query.gte("test_date", options.dateFrom);
  }
  if (options?.dateTo) {
    query = query.lte("test_date", options.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as ScoreWithRelations[]) ?? [];
}

export async function getStudentsByClass(classId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_students")
    .select("students(id, name)")
    .eq("class_id", classId);

  if (error) throw error;
  return (
    (data ?? [])
      .map(
        (cs) =>
          (cs as unknown as { students: { id: string; name: string } | null })
            .students
      )
      .filter(Boolean) as { id: string; name: string }[]
  );
}

export async function saveScore(input: {
  studentId: string;
  vocabBookId: string;
  testDate: string;
  correctCount: number;
  totalCount: number;
  testType: "eng_to_kor" | "kor_to_eng";
}) {
  const parsed = validate(saveScoreSchema, input);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const scorePercentage =
    input.totalCount > 0
      ? Math.round((input.correctCount / input.totalCount) * 10000) / 100
      : 0;

  const { error } = await supabase.from("scores").insert({
    academy_id: profile.data.academy_id,
    student_id: input.studentId,
    vocab_book_id: input.vocabBookId,
    test_date: input.testDate,
    correct_count: input.correctCount,
    total_count: input.totalCount,
    score_percentage: scorePercentage,
    test_type: input.testType,
    recorded_by: profile.data.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/scores");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return { success: true };
}

export async function saveBulkScores(
  scores: {
    studentId: string;
    vocabBookId: string;
    testDate: string;
    correctCount: number;
    totalCount: number;
    testType: "eng_to_kor" | "kor_to_eng";
  }[]
) {
  const parsed = validate(z.array(saveScoreSchema).min(1), scores);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const rows = scores.map((s) => ({
    academy_id: profile.data!.academy_id,
    student_id: s.studentId,
    vocab_book_id: s.vocabBookId,
    test_date: s.testDate,
    correct_count: s.correctCount,
    total_count: s.totalCount,
    score_percentage:
      s.totalCount > 0
        ? Math.round((s.correctCount / s.totalCount) * 10000) / 100
        : 0,
    test_type: s.testType,
    recorded_by: profile.data!.id,
  }));

  const { error } = await supabase.from("scores").insert(rows);

  if (error) return { error: error.message };

  revalidatePath("/scores");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return { success: true };
}
