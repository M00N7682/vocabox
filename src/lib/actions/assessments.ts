"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Assessment,
  AssessmentScore,
  AssessmentChapter,
  AssessmentTemplate,
} from "@/types/database";

// ---------------------------------------------------------------------------
// Composite types
// ---------------------------------------------------------------------------

export type AssessmentWithSubject = Assessment & {
  subjects: { name: string; color: string } | null;
  textbooks: { id: string; name: string } | null;
  assessment_scores: {
    student_id: string;
    score: number | null;
    grade_value: string | null;
    check_value: boolean | null;
    status: string;
  }[];
};

export type AssessmentScoreWithStudent = AssessmentScore & {
  students: { id: string; name: string } | null;
};

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

export async function getAssessments(filters?: {
  subjectId?: string;
  type?: string;
  status?: string;
  search?: string;
  textbookId?: string;
}): Promise<AssessmentWithSubject[]> {
  const supabase = await createClient();

  let query = supabase
    .from("assessments")
    .select(
      "*, subjects(name, color), textbooks(id, name), assessment_scores(student_id, score, grade_value, check_value, status)"
    )
    .order("date", { ascending: false });

  if (filters?.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }
  if (filters?.textbookId) {
    query = query.eq("textbook_id", filters.textbookId);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as AssessmentWithSubject[]) ?? [];
}

export async function getAssessment(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select("*, subjects(name, color), textbooks(id, name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as Assessment & {
    subjects: { name: string; color: string } | null;
    textbooks: { id: string; name: string } | null;
  };
}

export async function getAssessmentScores(
  assessmentId: string
): Promise<AssessmentScoreWithStudent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessment_scores")
    .select("*, students(id, name)")
    .eq("assessment_id", assessmentId)
    .order("created_at");

  if (error) throw error;
  return (data as unknown as AssessmentScoreWithStudent[]) ?? [];
}

export async function getAssessmentScoresByStudent(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessment_scores")
    .select(
      "*, assessments(name, date, type, subject_id, subjects(name, color))"
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (
    (data as unknown as (AssessmentScore & {
      assessments: {
        name: string;
        date: string;
        type: string;
        subject_id: string;
        subjects: { name: string; color: string } | null;
      } | null;
    })[]) ?? []
  );
}

// ---------------------------------------------------------------------------
// Assessment mutations
// ---------------------------------------------------------------------------

export async function createAssessment(formData: FormData) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, academy_id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const chapterIdsRaw = formData.get("chapter_ids");
  const chapterIds: string[] = chapterIdsRaw
    ? JSON.parse(chapterIdsRaw as string)
    : [];

  const textbookId = (formData.get("textbook_id") as string) || null;
  const templateId = (formData.get("template_id") as string) || null;

  const { data: assessment, error } = await supabase
    .from("assessments")
    .insert({
      academy_id: profile.academy_id,
      name: formData.get("name") as string,
      subject_id: formData.get("subject_id") as string,
      textbook_id: textbookId || null,
      template_id: templateId || null,
      type:
        (formData.get("type") as
          | "시험"
          | "퀴즈"
          | "과제"
          | "수행평가"
          | "출석점수") || "시험",
      date: formData.get("date") as string,
      total_points: Number(formData.get("total_points")) || 100,
      scoring_method:
        (formData.get("scoring_method") as "score" | "grade" | "check") ||
        "score",
      is_public: formData.get("is_public") === "true",
      weight: Number(formData.get("weight")) || 1,
      status:
        (formData.get("status") as "완료" | "진행중" | "예정") || "예정",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (chapterIds.length > 0 && assessment) {
    await linkChapters(assessment.id, chapterIds);
  }

  revalidatePath("/assessments");
  return { success: true, id: assessment?.id };
}

export async function updateAssessment(id: string, formData: FormData) {
  const supabase = await createClient();

  const chapterIdsRaw = formData.get("chapter_ids");
  const chapterIds: string[] = chapterIdsRaw
    ? JSON.parse(chapterIdsRaw as string)
    : [];

  const textbookId = (formData.get("textbook_id") as string) || null;
  const templateId = (formData.get("template_id") as string) || null;

  const updatePayload: Record<string, unknown> = {};

  const name = formData.get("name") as string | null;
  if (name) updatePayload.name = name;

  const subjectId = formData.get("subject_id") as string | null;
  if (subjectId) updatePayload.subject_id = subjectId;

  updatePayload.textbook_id = textbookId;
  updatePayload.template_id = templateId;

  const type = formData.get("type") as string | null;
  if (type) updatePayload.type = type;

  const date = formData.get("date") as string | null;
  if (date) updatePayload.date = date;

  const totalPoints = formData.get("total_points");
  if (totalPoints !== null) updatePayload.total_points = Number(totalPoints);

  const scoringMethod = formData.get("scoring_method") as string | null;
  if (scoringMethod) updatePayload.scoring_method = scoringMethod;

  const isPublicRaw = formData.get("is_public");
  if (isPublicRaw !== null) updatePayload.is_public = isPublicRaw === "true";

  const weight = formData.get("weight");
  if (weight !== null) updatePayload.weight = Number(weight);

  const status = formData.get("status") as string | null;
  if (status) updatePayload.status = status;

  const { error } = await supabase
    .from("assessments")
    .update(updatePayload)
    .eq("id", id);

  if (error) return { error: error.message };

  // Re-sync chapter links when chapter_ids is explicitly provided
  if (formData.has("chapter_ids")) {
    await linkChapters(id, chapterIds);
  }

  revalidatePath("/assessments");
  revalidatePath(`/assessments/${id}`);
  return { success: true };
}

export async function deleteAssessment(id: string) {
  const supabase = await createClient();

  // assessment_chapters and assessment_scores are expected to cascade-delete
  // from the DB foreign key constraints; if not, delete them explicitly first.
  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Score mutations
// ---------------------------------------------------------------------------

type ScoreStatus = "응시" | "결시" | "지각" | "미제출" | "보강예정" | "면제";

export async function saveAssessmentScores(
  assessmentId: string,
  scores: {
    student_id: string;
    // Numeric score for scoring_method === 'score'
    score?: number | null;
    // Letter/grade value for scoring_method === 'grade'
    grade_value?: string | null;
    // Boolean check for scoring_method === 'check'
    check_value?: boolean | null;
    status: ScoreStatus;
    note?: string;
  }[]
) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .single();

  const upsertData = scores.map((s) => ({
    assessment_id: assessmentId,
    student_id: s.student_id,
    score: s.score ?? null,
    grade_value: s.grade_value ?? null,
    check_value: s.check_value ?? null,
    status: s.status,
    note: s.note || null,
    recorded_by: profile?.id || null,
  }));

  const { error } = await supabase
    .from("assessment_scores")
    .upsert(upsertData, { onConflict: "assessment_id,student_id" });

  if (error) return { error: error.message };

  revalidatePath("/scores");
  revalidatePath("/assessments");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Assessment chapters
// ---------------------------------------------------------------------------

export async function linkChapters(
  assessmentId: string,
  chapterIds: string[]
) {
  const supabase = await createClient();

  // Remove existing links for this assessment
  const { error: deleteError } = await supabase
    .from("assessment_chapters")
    .delete()
    .eq("assessment_id", assessmentId);

  if (deleteError) return { error: deleteError.message };

  if (chapterIds.length === 0) {
    revalidatePath("/assessments");
    return { success: true };
  }

  const rows = chapterIds.map((chapter_id) => ({
    assessment_id: assessmentId,
    chapter_id,
  }));

  const { error } = await supabase
    .from("assessment_chapters")
    .insert(rows);

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}

export async function getAssessmentChapters(
  assessmentId: string
): Promise<AssessmentChapter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessment_chapters")
    .select("*")
    .eq("assessment_id", assessmentId);

  if (error) throw error;
  return (data as AssessmentChapter[]) ?? [];
}

// ---------------------------------------------------------------------------
// Template CRUD
// ---------------------------------------------------------------------------

export async function getTemplates(filters?: {
  subjectId?: string;
  isActive?: boolean;
}): Promise<AssessmentTemplate[]> {
  const supabase = await createClient();

  let query = supabase
    .from("assessment_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }
  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as AssessmentTemplate[]) ?? [];
}

export async function createTemplate(formData: FormData) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("assessment_templates").insert({
    academy_id: profile.academy_id,
    subject_id: formData.get("subject_id") as string,
    name: formData.get("name") as string,
    recurrence:
      (formData.get("recurrence") as "weekly" | "biweekly" | "monthly") ||
      "weekly",
    day_of_week: formData.get("day_of_week")
      ? Number(formData.get("day_of_week"))
      : null,
    assessment_type:
      (formData.get("assessment_type") as
        | "시험"
        | "퀴즈"
        | "과제"
        | "수행평가"
        | "출석점수") || "시험",
    scoring_method:
      (formData.get("scoring_method") as "score" | "grade" | "check") ||
      "score",
    total_points: formData.get("total_points")
      ? Number(formData.get("total_points"))
      : null,
    is_active: formData.get("is_active") !== "false",
  });

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}

export async function updateTemplate(id: string, formData: FormData) {
  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {};

  const name = formData.get("name") as string | null;
  if (name) updatePayload.name = name;

  const subjectId = formData.get("subject_id") as string | null;
  if (subjectId) updatePayload.subject_id = subjectId;

  const recurrence = formData.get("recurrence") as string | null;
  if (recurrence) updatePayload.recurrence = recurrence;

  const dayOfWeek = formData.get("day_of_week");
  if (dayOfWeek !== null)
    updatePayload.day_of_week = dayOfWeek ? Number(dayOfWeek) : null;

  const assessmentType = formData.get("assessment_type") as string | null;
  if (assessmentType) updatePayload.assessment_type = assessmentType;

  const scoringMethod = formData.get("scoring_method") as string | null;
  if (scoringMethod) updatePayload.scoring_method = scoringMethod;

  const totalPoints = formData.get("total_points");
  if (totalPoints !== null)
    updatePayload.total_points = totalPoints ? Number(totalPoints) : null;

  const isActive = formData.get("is_active");
  if (isActive !== null) updatePayload.is_active = isActive !== "false";

  const { error } = await supabase
    .from("assessment_templates")
    .update(updatePayload)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("assessment_templates")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}

export async function toggleTemplateActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("assessment_templates")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}
