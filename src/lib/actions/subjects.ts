"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Subject } from "@/types/database";
import { subjectSchema, formDataToObject, validate } from "@/lib/validations";

export type SubjectType =
  | "정규"
  | "특강"
  | "캠프"
  | "수행평가"
  | "프로젝트"
  | "내신관리"
  | "반복테스트";

export type SubjectWithDetails = Subject & {
  profiles: { name: string } | null;
  subject_students: { student_id: string }[];
};

export interface GetSubjectsFilters {
  type?: SubjectType;
  isActive?: boolean;
  search?: string;
}

export async function getSubjects(
  filters?: GetSubjectsFilters
): Promise<SubjectWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("subjects")
    .select("*, profiles(name), subject_students(student_id)")
    .order("sort_order");

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as SubjectWithDetails[]) ?? [];
}

export async function getSubject(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select(
      "*, profiles(name), subject_students(student_id, students(id, name, english_name, is_active))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as Subject & {
    profiles: { name: string } | null;
    subject_students: {
      student_id: string;
      students: {
        id: string;
        name: string;
        english_name: string | null;
        is_active: boolean;
      } | null;
    }[];
  };
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(subjectSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  let gradeWeight: Record<string, number> | null = null;
  if (parsed.data.grade_weight) {
    try {
      gradeWeight = JSON.parse(parsed.data.grade_weight);
    } catch {
      return { error: "grade_weight 형식이 올바르지 않습니다." };
    }
  }

  const isActiveRaw = parsed.data.is_active;
  const isActive =
    isActiveRaw === undefined ? true : isActiveRaw === "true" || isActiveRaw === "1";

  const { error } = await supabase.from("subjects").insert({
    academy_id: profile.data.academy_id,
    name: parsed.data.name,
    type: (parsed.data.type as SubjectType) || "정규",
    color: parsed.data.color || "#3B82F6",
    icon: parsed.data.icon || null,
    grade_weight: gradeWeight,
    instructor_id: parsed.data.instructor_id || null,
    is_active: isActive,
  });

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { success: true };
}

export async function updateSubject(id: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(subjectSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  let gradeWeight: Record<string, number> | null | undefined = undefined;
  if (parsed.data.grade_weight !== undefined) {
    if (parsed.data.grade_weight === "") {
      gradeWeight = null;
    } else {
      try {
        gradeWeight = JSON.parse(parsed.data.grade_weight);
      } catch {
        return { error: "grade_weight 형식이 올바르지 않습니다." };
      }
    }
  }

  const isActiveRaw = parsed.data.is_active;
  const isActive =
    isActiveRaw === undefined
      ? undefined
      : isActiveRaw === "true" || isActiveRaw === "1";

  const updatePayload: Record<string, unknown> = {
    name: parsed.data.name,
    type: (parsed.data.type as SubjectType) || "정규",
    color: parsed.data.color || "#3B82F6",
    instructor_id: parsed.data.instructor_id || null,
  };

  if (parsed.data.icon !== undefined) {
    updatePayload.icon = parsed.data.icon || null;
  }

  if (gradeWeight !== undefined) {
    updatePayload.grade_weight = gradeWeight;
  }

  if (isActive !== undefined) {
    updatePayload.is_active = isActive;
  }

  const { error } = await supabase
    .from("subjects")
    .update(updatePayload)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { success: true };
}

export async function toggleSubjectActive(id: string) {
  const supabase = await createClient();

  const { data: subject, error: fetchError } = await supabase
    .from("subjects")
    .select("is_active")
    .eq("id", id)
    .single();

  if (fetchError) return { error: fetchError.message };
  if (!subject) return { error: "수업을 찾을 수 없습니다." };

  const { error } = await supabase
    .from("subjects")
    .update({ is_active: !subject.is_active })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { success: true, is_active: !subject.is_active };
}

export async function deleteSubject(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { success: true };
}

export async function addStudentToSubject(
  subjectId: string,
  studentId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subject_students")
    .insert({ subject_id: subjectId, student_id: studentId });

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { success: true };
}

export async function removeStudentFromSubject(
  subjectId: string,
  studentId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subject_students")
    .delete()
    .eq("subject_id", subjectId)
    .eq("student_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { success: true };
}
