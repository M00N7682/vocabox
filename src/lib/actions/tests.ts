"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordTestPrint(input: {
  studentId: string;
  vocabBookId: string;
  testType: "eng_to_kor" | "kor_to_eng";
  isShuffled: boolean;
  wordFrom?: number;
  wordTo?: number;
}) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("test_records").insert({
    academy_id: profile.data.academy_id,
    student_id: input.studentId,
    vocab_book_id: input.vocabBookId,
    test_type: input.testType,
    is_shuffled: input.isShuffled,
    word_from: input.wordFrom ?? null,
    word_to: input.wordTo ?? null,
    printed_by: profile.data.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/tests");
  return { success: true };
}

export async function getTestRecords(options?: { studentId?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("test_records")
    .select("*, students(name), vocab_books(title)")
    .order("printed_at", { ascending: false });

  if (options?.studentId) {
    query = query.eq("student_id", options.studentId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
