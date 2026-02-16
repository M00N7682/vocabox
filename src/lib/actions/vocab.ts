"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { VocabBook, VocabWord } from "@/types/database";

export async function getVocabBooks(): Promise<VocabBook[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vocab_books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as VocabBook[]) ?? [];
}

export async function getVocabBook(id: string): Promise<VocabBook> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vocab_books")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as VocabBook;
}

export async function getVocabWords(bookId: string): Promise<VocabWord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vocab_words")
    .select("*")
    .eq("vocab_book_id", bookId)
    .order("sort_order");

  if (error) throw error;
  return (data as VocabWord[]) ?? [];
}

export async function createVocabBook(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { data, error } = await supabase
    .from("vocab_books")
    .insert({
      academy_id: profile.data.academy_id,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      created_by: profile.data.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/vocab");
  return { success: true, id: (data as VocabBook).id };
}

export async function updateVocabBook(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vocab_books")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/vocab");
  revalidatePath(`/vocab/${id}`);
  return { success: true };
}

export async function addWord(
  bookId: string,
  english: string,
  korean: string
) {
  const supabase = await createClient();

  const { data: maxWord } = await supabase
    .from("vocab_words")
    .select("sort_order")
    .eq("vocab_book_id", bookId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = ((maxWord as { sort_order: number } | null)?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("vocab_words").insert({
    vocab_book_id: bookId,
    english,
    korean,
    sort_order: nextOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/vocab/${bookId}`);
  return { success: true };
}

export async function updateWord(
  wordId: string,
  english: string,
  korean: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vocab_words")
    .update({ english, korean })
    .eq("id", wordId);

  if (error) return { error: error.message };

  return { success: true };
}

export async function deleteWord(wordId: string, bookId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vocab_words")
    .delete()
    .eq("id", wordId);

  if (error) return { error: error.message };

  revalidatePath(`/vocab/${bookId}`);
  return { success: true };
}

export async function bulkInsertWords(
  bookId: string,
  words: { english: string; korean: string }[]
) {
  const supabase = await createClient();

  const rows = words.map((w, i) => ({
    vocab_book_id: bookId,
    english: w.english,
    korean: w.korean,
    sort_order: i + 1,
  }));

  const { error } = await supabase.from("vocab_words").insert(rows);

  if (error) return { error: error.message };

  revalidatePath(`/vocab/${bookId}`);
  return { success: true };
}
