"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Student, Score, Attendance, AssessmentScore } from "@/types/database";
import { createStudentSchema, updateStudentSchema, formDataToObject, validate } from "@/lib/validations";

// ---------------------------------------------------------------------------
// Composite types
// ---------------------------------------------------------------------------

export type SubjectInfo = {
  subject_id: string;
  subjects: { name: string; color: string } | null;
};

export type StudentWithDetails = Student & {
  class_students: { class_id: string; classes: { name: string } | null }[];
  subject_students: SubjectInfo[];
};

export type ScoreWithBook = Score & {
  vocab_books: { title: string } | null;
};

export type AttendanceWithSubject = Attendance & {
  subjects: { name: string; color: string } | null;
};

export type AssignmentWithStatus = {
  id: string;
  assignment_id: string;
  student_id: string;
  status: "pending" | "submitted" | "not_submitted" | "resubmit";
  submitted_at: string | null;
  feedback: string | null;
  created_at: string;
  assignments: {
    id: string;
    title: string;
    due_date: string;
    submission_type: "photo" | "file" | "check";
    difficulty: "easy" | "medium" | "hard" | null;
    is_required: boolean;
    subjects: { name: string; color: string } | null;
  } | null;
};

export type AssessmentScoreWithDetails = AssessmentScore & {
  assessments: {
    id: string;
    name: string;
    type: string;
    date: string;
    total_points: number;
    scoring_method: "score" | "grade" | "check";
    weight: number;
    subjects: { name: string; color: string } | null;
  } | null;
};

// ---------------------------------------------------------------------------
// getStudents
// ---------------------------------------------------------------------------

export async function getStudents(options?: {
  classId?: string;
  search?: string;
  activeOnly?: boolean;
  subjectId?: string;
}): Promise<StudentWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select(
      `*,
      class_students(class_id, classes(name)),
      subject_students(subject_id, subjects(name, color))`
    )
    .order("created_at", { ascending: false });

  if (options?.activeOnly !== undefined) {
    query = query.eq("is_active", options.activeOnly);
  }

  if (options?.search) {
    const sanitized = options.search.replace(/[%,().]/g, "");
    if (sanitized) {
      query = query.or(
        `name.ilike.%${sanitized}%,english_name.ilike.%${sanitized}%`
      );
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  let result = (data as unknown as StudentWithDetails[]) ?? [];

  // Filter by classId post-fetch (many-to-many join)
  if (options?.classId) {
    result = result.filter((s) =>
      s.class_students?.some((cs) => cs.class_id === options.classId)
    );
  }

  // Filter by subjectId post-fetch (many-to-many join)
  if (options?.subjectId) {
    result = result.filter((s) =>
      s.subject_students?.some((ss) => ss.subject_id === options.subjectId)
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStudent
// ---------------------------------------------------------------------------

export async function getStudent(id: string): Promise<StudentWithDetails> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      `*,
      class_students(class_id, classes(name)),
      subject_students(subject_id, subjects(name, color))`
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as StudentWithDetails;
}

// ---------------------------------------------------------------------------
// getStudentScores  –  VocaBox legacy, unchanged
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// getStudentAssessmentScores
// ---------------------------------------------------------------------------

export async function getStudentAssessmentScores(
  studentId: string,
  filters?: {
    subjectId?: string;
    limit?: number;
  }
): Promise<AssessmentScoreWithDetails[]> {
  const supabase = await createClient();

  // When filtering by subject we use !inner join so only matching rows are returned.
  const joinType = filters?.subjectId ? "assessments!inner" : "assessments";

  let query = supabase
    .from("assessment_scores")
    .select(
      `*,
      ${joinType}(
        id, name, type, date, total_points, scoring_method, weight, subject_id,
        subjects(name, color)
      )`
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (filters?.subjectId) {
    query = query.eq("assessments.subject_id", filters.subjectId);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as AssessmentScoreWithDetails[]) ?? [];
}

// ---------------------------------------------------------------------------
// getStudentAttendance
// ---------------------------------------------------------------------------

export async function getStudentAttendance(
  studentId: string,
  filters?: {
    subjectId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
  }
): Promise<AttendanceWithSubject[]> {
  const supabase = await createClient();

  let query = supabase
    .from("attendance")
    .select("*, subjects(name, color)")
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (filters?.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }

  if (filters?.fromDate) {
    query = query.gte("date", filters.fromDate);
  }

  if (filters?.toDate) {
    query = query.lte("date", filters.toDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as AttendanceWithSubject[]) ?? [];
}

// ---------------------------------------------------------------------------
// getStudentAssignments
// ---------------------------------------------------------------------------

export async function getStudentAssignments(
  studentId: string,
  filters?: {
    subjectId?: string;
    status?: "pending" | "submitted" | "not_submitted" | "resubmit";
    limit?: number;
  }
): Promise<AssignmentWithStatus[]> {
  const supabase = await createClient();

  // When filtering by subject we use !inner join so only matching rows are returned.
  const joinType = filters?.subjectId ? "assignments!inner" : "assignments";

  let query = supabase
    .from("assignment_students")
    .select(
      `*,
      ${joinType}(
        id, title, due_date, submission_type, difficulty, is_required, subject_id,
        subjects(name, color)
      )`
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (filters?.subjectId) {
    query = query.eq("assignments.subject_id", filters.subjectId);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as AssignmentWithStatus[]) ?? [];
}

// ---------------------------------------------------------------------------
// createStudent
// ---------------------------------------------------------------------------

export async function createStudent(formData: FormData) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(createStudentSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase.from("students").insert({
    academy_id: profile.data.academy_id,
    name: parsed.data.name,
    english_name: parsed.data.english_name || null,
    phone: parsed.data.phone || null,
    parent_phone: parsed.data.parent_phone || null,
    school: parsed.data.school || null,
    grade: parsed.data.grade || null,
    pin_code: parsed.data.pin_code || null,
    memo: parsed.data.memo || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteStudent
// ---------------------------------------------------------------------------

export async function deleteStudent(id: string) {
  const supabase = await createClient();

  // Delete related records first (cascade may handle some, but be explicit)
  await supabase.from("assignment_students").delete().eq("student_id", id);
  await supabase.from("assessment_scores").delete().eq("student_id", id);
  await supabase.from("attendance").delete().eq("student_id", id);
  await supabase.from("class_students").delete().eq("student_id", id);
  await supabase.from("subject_students").delete().eq("student_id", id);

  const { error } = await supabase.from("students").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}

// ---------------------------------------------------------------------------
// updateStudent
// ---------------------------------------------------------------------------

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(updateStudentSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const pinCode = parsed.data.pin_code || null;

  const { error } = await supabase
    .from("students")
    .update({
      name: parsed.data.name,
      english_name: parsed.data.english_name || null,
      phone: parsed.data.phone || null,
      parent_phone: parsed.data.parent_phone || null,
      school: parsed.data.school || null,
      grade: parsed.data.grade || null,
      pin_code: pinCode,
      memo: parsed.data.memo || null,
      is_active: parsed.data.is_active === "true",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  return { success: true };
}
