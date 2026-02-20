"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Textbook, TextbookChapter } from "@/types/database";
import { textbookSchema, chapterSchema, formDataToObject, validate } from "@/lib/validations";

export type TextbookWithSubject = Textbook & {
  subjects: { name: string; color: string } | null;
};

export type ChapterWithChildren = TextbookChapter & {
  children?: ChapterWithChildren[];
};

export type GetTextbooksFilters = {
  subjectId?: string;
  search?: string;
};

export async function getTextbooks(
  filters?: GetTextbooksFilters
): Promise<TextbookWithSubject[]> {
  const supabase = await createClient();

  let query = supabase
    .from("textbooks")
    .select("*, subjects(name, color)")
    .order("sort_order");

  if (filters?.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as TextbookWithSubject[]) ?? [];
}

export async function getTextbookChapters(
  textbookId: string
): Promise<ChapterWithChildren[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("textbook_chapters")
    .select("*")
    .eq("textbook_id", textbookId)
    .order("sort_order");

  if (error) throw error;

  const chapters = (data as TextbookChapter[]) ?? [];

  // Build tree structure
  const map = new Map<string, ChapterWithChildren>();
  const roots: ChapterWithChildren[] = [];

  for (const ch of chapters) {
    map.set(ch.id, { ...ch, children: [] });
  }

  for (const ch of chapters) {
    const node = map.get(ch.id)!;
    if (ch.parent_chapter_id && map.has(ch.parent_chapter_id)) {
      map.get(ch.parent_chapter_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function createTextbook(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(textbookSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase.from("textbooks").insert({
    academy_id: profile.data.academy_id,
    name: parsed.data.name,
    subject_id: parsed.data.subject_id,
    year: parsed.data.year || new Date().getFullYear(),
    grade: parsed.data.grade || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}

export async function updateTextbook(id: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(textbookSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase
    .from("textbooks")
    .update({
      name: parsed.data.name,
      subject_id: parsed.data.subject_id,
      year: parsed.data.year || new Date().getFullYear(),
      grade: parsed.data.grade || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}

export async function deleteTextbook(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("textbooks").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}

export async function createChapter(formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(chapterSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase.from("textbook_chapters").insert({
    textbook_id: parsed.data.textbook_id,
    title: parsed.data.title,
    level: parsed.data.level ?? "major",
    parent_chapter_id: parsed.data.parent_chapter_id || null,
    sort_order: parsed.data.sort_order ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}

export async function updateChapter(id: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(chapterSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase
    .from("textbook_chapters")
    .update({
      title: parsed.data.title,
      level: parsed.data.level ?? "major",
      parent_chapter_id: parsed.data.parent_chapter_id || null,
      sort_order: parsed.data.sort_order ?? 0,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}

export async function updateChapterStatus(
  id: string,
  status: "완료" | "진행중" | "미진행"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("textbook_chapters")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}

export async function deleteChapter(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("textbook_chapters")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/textbooks");
  return { success: true };
}
