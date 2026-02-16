"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Student, Score } from "@/types/database";

export type StudentWithClasses = Student & {
  class_students: { class_id: string; classes: { name: string } | null }[];
};

export type ScoreWithBook = Score & {
  vocab_books: { title: string } | null;
};

export async function getStudents(options?: {
  classId?: string;
  search?: string;
  activeOnly?: boolean;
}): Promise<StudentWithClasses[]> {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("*, class_students(class_id, classes(name))")
    .order("created_at", { ascending: false });

  if (options?.activeOnly !== undefined) {
    query = query.eq("is_active", options.activeOnly);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,english_name.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  let result = (data as unknown as StudentWithClasses[]) ?? [];

  if (options?.classId) {
    result = result.filter((s) =>
      s.class_students?.some((cs) => cs.class_id === options.classId)
    );
  }

  return result;
}

export async function getStudent(id: string): Promise<StudentWithClasses> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("*, class_students(class_id, classes(name))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as StudentWithClasses;
}

export async function getStudentScores(
  studentId: string
): Promise<ScoreWithBook[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scores")
    .select("*, vocab_books(title)")
    .eq("student_id", studentId)
    .order("test_date", { ascending: false });

  if (error) throw error;
  return (data as unknown as ScoreWithBook[]) ?? [];
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("students").insert({
    academy_id: profile.data.academy_id,
    name: formData.get("name") as string,
    english_name: (formData.get("english_name") as string) || null,
    phone: (formData.get("phone") as string) || null,
    parent_phone: (formData.get("parent_phone") as string) || null,
    school: (formData.get("school") as string) || null,
    grade: (formData.get("grade") as string) || null,
    memo: (formData.get("memo") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .update({
      name: formData.get("name") as string,
      english_name: (formData.get("english_name") as string) || null,
      phone: (formData.get("phone") as string) || null,
      parent_phone: (formData.get("parent_phone") as string) || null,
      school: (formData.get("school") as string) || null,
      grade: (formData.get("grade") as string) || null,
      memo: (formData.get("memo") as string) || null,
      is_active: formData.get("is_active") === "true",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  return { success: true };
}
