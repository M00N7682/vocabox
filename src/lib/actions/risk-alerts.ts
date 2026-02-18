"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RiskAlert } from "@/types/database";

export type RiskAlertWithStudent = RiskAlert & {
  students: { id: string; name: string; school: string | null; grade: string | null } | null;
};

export async function getRiskAlerts(filters?: {
  riskLevel?: string;
  isResolved?: boolean;
  search?: string;
}): Promise<RiskAlertWithStudent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("risk_alerts")
    .select("*, students(id, name, school, grade)")
    .order("created_at", { ascending: false });

  if (filters?.riskLevel) {
    query = query.eq("risk_level", filters.riskLevel);
  }
  if (filters?.isResolved !== undefined) {
    query = query.eq("is_resolved", filters.isResolved);
  }

  const { data, error } = await query;

  if (error) throw error;

  let result = (data as unknown as RiskAlertWithStudent[]) ?? [];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    result = result.filter((a) =>
      a.students?.name.toLowerCase().includes(search)
    );
  }

  return result;
}

export async function getUnresolvedCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("risk_alerts")
    .select("id", { count: "exact", head: true })
    .eq("is_resolved", false);

  if (error) throw error;
  return count ?? 0;
}

export async function calculateRiskForStudent(studentId: string): Promise<{
  riskLevel: "concern" | "caution" | "danger" | null;
  reasons: string[];
}> {
  const supabase = await createClient();

  // Get academy_settings for thresholds
  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  let scoreThreshold = 60;
  let scoreCount = 3;
  let absenceRate = 15;
  let missingCount = 3;

  if (profile) {
    const { data: settings } = await supabase
      .from("academy_settings")
      .select(
        "risk_score_threshold, risk_score_count, risk_absence_rate, risk_missing_count"
      )
      .eq("academy_id", profile.academy_id)
      .single();

    if (settings) {
      scoreThreshold = settings.risk_score_threshold;
      scoreCount = settings.risk_score_count;
      absenceRate = settings.risk_absence_rate;
      missingCount = settings.risk_missing_count;
    }
  }

  const reasons: string[] = [];
  let dangerFlags = 0;
  let cautionFlags = 0;
  let concernFlags = 0;

  // Check recent N assessment_scores avg
  const { data: recentScores } = await supabase
    .from("assessment_scores")
    .select("score")
    .eq("student_id", studentId)
    .not("score", "is", null)
    .order("created_at", { ascending: false })
    .limit(scoreCount);

  if (recentScores && recentScores.length >= scoreCount) {
    const avg =
      recentScores.reduce((sum, s) => sum + (s.score ?? 0), 0) /
      recentScores.length;
    if (avg < scoreThreshold * 0.7) {
      dangerFlags++;
      reasons.push(
        `최근 ${scoreCount}회 평균 점수 ${Math.round(avg)}점 (위험)`
      );
    } else if (avg < scoreThreshold) {
      cautionFlags++;
      reasons.push(
        `최근 ${scoreCount}회 평균 점수 ${Math.round(avg)}점 (주의)`
      );
    } else if (avg < scoreThreshold * 1.1) {
      concernFlags++;
      reasons.push(
        `최근 ${scoreCount}회 평균 점수 ${Math.round(avg)}점 (관심)`
      );
    }
  }

  // Check attendance absence rate
  const { data: allAttendance } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", studentId);

  if (allAttendance && allAttendance.length > 0) {
    const absentCount = allAttendance.filter(
      (a) => a.status === "결석"
    ).length;
    const rate = (absentCount / allAttendance.length) * 100;
    if (rate >= absenceRate * 1.5) {
      dangerFlags++;
      reasons.push(`결석률 ${Math.round(rate)}% (위험)`);
    } else if (rate >= absenceRate) {
      cautionFlags++;
      reasons.push(`결석률 ${Math.round(rate)}% (주의)`);
    } else if (rate >= absenceRate * 0.7) {
      concernFlags++;
      reasons.push(`결석률 ${Math.round(rate)}% (관심)`);
    }
  }

  // Check assignment_students with 'not_submitted' status count
  const { data: notSubmitted } = await supabase
    .from("assignment_students")
    .select("id")
    .eq("student_id", studentId)
    .eq("status", "not_submitted");

  const notSubmittedCount = notSubmitted?.length ?? 0;
  if (notSubmittedCount >= missingCount * 1.5) {
    dangerFlags++;
    reasons.push(`미제출 과제 ${notSubmittedCount}건 (위험)`);
  } else if (notSubmittedCount >= missingCount) {
    cautionFlags++;
    reasons.push(`미제출 과제 ${notSubmittedCount}건 (주의)`);
  } else if (notSubmittedCount >= missingCount * 0.7) {
    concernFlags++;
    reasons.push(`미제출 과제 ${notSubmittedCount}건 (관심)`);
  }

  // Determine overall risk level
  let riskLevel: "concern" | "caution" | "danger" | null = null;
  if (dangerFlags > 0) {
    riskLevel = "danger";
  } else if (cautionFlags > 0) {
    riskLevel = "caution";
  } else if (concernFlags > 0) {
    riskLevel = "concern";
  }

  return { riskLevel, reasons };
}

export async function createAlert(
  studentId: string,
  riskLevel: "concern" | "caution" | "danger",
  reasons: string[]
) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("risk_alerts").insert({
    academy_id: profile.academy_id,
    student_id: studentId,
    risk_level: riskLevel,
    reasons: reasons.map((r) => ({ message: r })),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function resolveAlert(id: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase
    .from("risk_alerts")
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: profile.id,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getStudentRiskHistory(
  studentId: string
): Promise<RiskAlert[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("risk_alerts")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as RiskAlert[]) ?? [];
}
