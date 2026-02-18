"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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

  const chapterId = formData.get("chapter_id") as string | null;
  const isRequiredRaw = formData.get("is_required");
  const isRequired =
    isRequiredRaw === "true" || isRequiredRaw === "1" ? true : false;

  const { error } = await supabase.from("assignments").insert({
    academy_id: profile.academy_id,
    title: formData.get("title") as string,
    subject_id: formData.get("subject_id") as string,
    chapter_id: chapterId || null,
    description: (formData.get("description") as string) || null,
    due_date: formData.get("due_date") as string,
    submission_type:
      (formData.get("submission_type") as "photo" | "file" | "check") ||
      "check",
    difficulty:
      (formData.get("difficulty") as "easy" | "medium" | "hard") || null,
    is_required: isRequired,
    created_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  return { success: true };
}

export async function updateAssignment(id: string, formData: FormData) {
  const supabase = await createClient();

  const chapterId = formData.get("chapter_id") as string | null;
  const isRequiredRaw = formData.get("is_required");
  const isRequired =
    isRequiredRaw !== null
      ? isRequiredRaw === "true" || isRequiredRaw === "1"
      : undefined;

  const updatePayload: Record<string, unknown> = {};

  const title = formData.get("title");
  if (title !== null) updatePayload.title = title as string;

  const subjectId = formData.get("subject_id");
  if (subjectId !== null) updatePayload.subject_id = subjectId as string;

  updatePayload.chapter_id = chapterId || null;

  const description = formData.get("description");
  if (description !== null)
    updatePayload.description = (description as string) || null;

  const dueDate = formData.get("due_date");
  if (dueDate !== null) updatePayload.due_date = dueDate as string;

  const submissionType = formData.get("submission_type");
  if (submissionType !== null)
    updatePayload.submission_type = submissionType as "photo" | "file" | "check";

  const difficulty = formData.get("difficulty");
  if (difficulty !== null)
    updatePayload.difficulty =
      (difficulty as "easy" | "medium" | "hard") || null;

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
