"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Class } from "@/types/database";
import { classSchema, formDataToObject, validate } from "@/lib/validations";

export type ClassWithStudents = Class & {
  class_students: { student_id: string }[];
  subjects: { id: string; name: string; color: string } | null;
};

export async function getClasses(): Promise<ClassWithStudents[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("*, class_students(student_id), subjects(id, name, color)")
    .order("sort_order");

  if (error) throw error;
  return (data as unknown as ClassWithStudents[]) ?? [];
}

export async function getClass(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select(
      "*, class_students(student_id, students(id, name, english_name, is_active))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as Class & {
    class_students: {
      student_id: string;
      students: { id: string; name: string; english_name: string | null; is_active: boolean } | null;
    }[];
  };
}

export async function createClass(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(classSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase.from("classes").insert({
    academy_id: profile.data.academy_id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    subject_id: parsed.data.subject_id || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/classes");
  return { success: true };
}

export async function updateClass(id: string, formData: FormData) {
  const parsed = validate(classSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("classes")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      subject_id: parsed.data.subject_id || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/classes");
  return { success: true };
}

export async function addStudentToClass(classId: string, studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("class_students")
    .insert({ class_id: classId, student_id: studentId });

  if (error) return { error: error.message };

  revalidatePath("/classes");
  revalidatePath("/students");
  return { success: true };
}

export async function removeStudentFromClass(
  classId: string,
  studentId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/classes");
  revalidatePath("/students");
  return { success: true };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();

  await supabase.from("class_students").delete().eq("class_id", id);

  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/classes");
  return { success: true };
}
