"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAssignmentSchema, updateStudentStatusSchema, formDataToObject, validate } from "@/lib/validations";
import type { Assignment, AssignmentStudent } from "@/types/database";

export type AssignmentWithDetails = Assignment & {
  subjects: { name: string; color: string } | null;
  assignment_students: AssignmentStudent[];
};

export type AssignmentWithStudentDetails = Assignment & {
  subjects: { name: string; color: string } | null;
  assignment_students: (AssignmentStudent & {
    students: { id: string; name: string; grade: string | null } | null;
  })[];
};

export async function getAssignments(filters?: {
  subjectId?: string;
  search?: string;
  isRequired?: boolean;
}): Promise<AssignmentWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("assignments")
    .select("*, subjects(name, color), assignment_students(*)")
    .order("due_date", { ascending: false });

  if (filters?.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }
  if (filters?.isRequired !== undefined) {
    query = query.eq("is_required", filters.isRequired);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as AssignmentWithDetails[]) ?? [];
}

export async function getAssignment(
  id: string
): Promise<AssignmentWithStudentDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assignments")
    .select(
      "*, subjects(name, color), assignment_students(*, students(id, name, grade))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as AssignmentWithStudentDetails | null;
}

export async function createAssignment(formData: FormData) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, academy_id")
    .single();

  if (profileError || !profile) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(createAssignmentSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const isRequired =
    parsed.data.is_required === "true" || parsed.data.is_required === "1" ? true : false;

  const { error } = await supabase.from("assignments").insert({
    academy_id: profile.academy_id,
    title: parsed.data.title,
    subject_id: parsed.data.subject_id,
    chapter_id: parsed.data.chapter_id || null,
    description: parsed.data.description || null,
    due_date: parsed.data.due_date,
    submission_type: parsed.data.submission_type || "check",
    difficulty: parsed.data.difficulty || null,
    is_required: isRequired,
    created_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  return { success: true };
}

export async function updateAssignment(id: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(createAssignmentSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const isRequired =
    parsed.data.is_required !== undefined
      ? parsed.data.is_required === "true" || parsed.data.is_required === "1"
      : undefined;

  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.title) updatePayload.title = parsed.data.title;
  if (parsed.data.subject_id) updatePayload.subject_id = parsed.data.subject_id;
  updatePayload.chapter_id = parsed.data.chapter_id || null;
  if (parsed.data.description !== undefined)
    updatePayload.description = parsed.data.description || null;
  if (parsed.data.due_date) updatePayload.due_date = parsed.data.due_date;
  if (parsed.data.submission_type)
    updatePayload.submission_type = parsed.data.submission_type;
  if (parsed.data.difficulty !== undefined)
    updatePayload.difficulty = parsed.data.difficulty || null;
  if (isRequired !== undefined) updatePayload.is_required = isRequired;

  const { error } = await supabase
    .from("assignments")
    .update(updatePayload)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${id}`);
  return { success: true };
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("assignments").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  return { success: true };
}

export async function assignStudents(
  assignmentId: string,
  studentIds: string[]
) {
  const supabase = await createClient();

  const rows = studentIds.map((studentId) => ({
    assignment_id: assignmentId,
    student_id: studentId,
    status: "pending" as const,
  }));

  const { error } = await supabase
    .from("assignment_students")
    .upsert(rows, { onConflict: "assignment_id,student_id" });

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  return { success: true };
}

export async function updateStudentStatus(
  assignmentId: string,
  studentId: string,
  data: {
    status: "pending" | "submitted" | "not_submitted" | "resubmit";
    feedback?: string;
  }
) {
  const parsed = validate(updateStudentStatusSchema, data);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const updatePayload: {
    status: "pending" | "submitted" | "not_submitted" | "resubmit";
    feedback?: string | null;
    submitted_at?: string | null;
  } = {
    status: data.status,
    feedback: data.feedback ?? null,
  };

  if (data.status === "submitted") {
    updatePayload.submitted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("assignment_students")
    .update(updatePayload)
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  return { success: true };
}

export async function getAssignmentStats(): Promise<{
  total: number;
  overdueCount: number;
  completionRate: number;
}> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select("id, due_date");

  if (assignmentsError) throw assignmentsError;

  const total = assignments?.length ?? 0;
  const overdueCount =
    assignments?.filter((a) => a.due_date < now).length ?? 0;

  const { data: studentRows, error: studentRowsError } = await supabase
    .from("assignment_students")
    .select("status");

  if (studentRowsError) throw studentRowsError;

  const totalStudentRows = studentRows?.length ?? 0;
  const submittedCount =
    studentRows?.filter((r) => r.status === "submitted").length ?? 0;

  const completionRate =
    totalStudentRows > 0
      ? Math.round((submittedCount / totalStudentRows) * 100)
      : 0;

  return { total, overdueCount, completionRate };
}
