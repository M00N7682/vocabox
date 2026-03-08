"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Teacher-side: manage tokens ───

export async function generateReportToken(studentId: string) {
  const supabase = await createClient();

  const profile = await supabase.from("profiles").select("academy_id").single();
  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  // Check if active token already exists for this student
  const { data: existing } = await supabase
    .from("parent_report_tokens")
    .select("id, token")
    .eq("student_id", studentId)
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    return { success: true, token: existing.token };
  }

  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("parent_report_tokens")
    .insert({
      academy_id: profile.data.academy_id,
      student_id: studentId,
      created_by: user.user?.id || null,
    })
    .select("token")
    .single();

  if (error) return { error: error.message };
  return { success: true, token: data.token };
}

export async function getStudentTokens(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parent_report_tokens")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function revokeReportToken(tokenId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("parent_report_tokens")
    .update({ is_active: false })
    .eq("id", tokenId);

  if (error) return { error: error.message };
  revalidatePath("/classes");
  return { success: true };
}

// Generate tokens for all students in a class
export async function generateClassReportTokens(classId: string) {
  const supabase = await createClient();

  const profile = await supabase.from("profiles").select("academy_id").single();
  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const { data: user } = await supabase.auth.getUser();

  // Get all students in the class
  const { data: classStudents } = await supabase
    .from("class_students")
    .select("student_id, students(id, name, parent_phone)")
    .eq("class_id", classId);

  if (!classStudents || classStudents.length === 0) {
    return { error: "반에 등록된 학생이 없습니다." };
  }

  const results: { studentId: string; studentName: string; parentPhone: string | null; token: string }[] = [];

  for (const cs of classStudents) {
    const student = (cs as unknown as { students: { id: string; name: string; parent_phone: string | null } | null }).students;
    if (!student) continue;

    // Check existing
    const { data: existing } = await supabase
      .from("parent_report_tokens")
      .select("token")
      .eq("student_id", cs.student_id)
      .eq("is_active", true)
      .maybeSingle();

    if (existing) {
      results.push({
        studentId: cs.student_id,
        studentName: student.name,
        parentPhone: student.parent_phone,
        token: existing.token,
      });
    } else {
      const { data } = await supabase
        .from("parent_report_tokens")
        .insert({
          academy_id: profile.data.academy_id,
          student_id: cs.student_id,
          created_by: user.user?.id || null,
        })
        .select("token")
        .single();

      if (data) {
        results.push({
          studentId: cs.student_id,
          studentName: student.name,
          parentPhone: student.parent_phone,
          token: data.token,
        });
      }
    }
  }

  return { success: true, tokens: results };
}

// ─── Public: fetch student data by token (no auth required) ───

export async function getReportByToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_report_by_token", { p_token: token });
  if (error || !data || data.length === 0) return null;
  return data[0] as { student_id: string; academy_id: string; student_name: string; academy_name: string };
}

export async function getStudentAttendanceByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_student_attendance_by_token", { p_token: token });
  return (data ?? []) as { date: string; status: string; subject_name: string }[];
}

export async function getStudentAssignmentsByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_student_assignments_by_token", { p_token: token });
  return (data ?? []) as { title: string; due_date: string; status: string; subject_name: string }[];
}

export async function getStudentRecordsByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_student_records_by_token", { p_token: token });
  return (data ?? []) as { record_date: string; category: string; label: string; value: string; numeric_value: number }[];
}

export async function getStudentScoresByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_student_scores_by_token", { p_token: token });
  return (data ?? []) as { assessment_name: string; assessment_date: string; assessment_type: string; score: number; total_points: number; status: string; subject_name: string }[];
}

export async function getStudentPaymentsByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_student_payments_by_token", { p_token: token });
  return (data ?? []) as { description: string; amount: number; due_date: string; status: string; paid_at: string }[];
}
