"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAssessmentSchema, assessmentScoreSchema, assessmentTemplateSchema, formDataToObject, validate } from "@/lib/validations";
import { z } from "zod";
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

  // 1. Get the assessment to know which subject it belongs to
  const { data: assessment } = await supabase
    .from("assessments")
    .select("subject_id")
    .eq("id", assessmentId)
    .single();

  // 2. Get existing scores
  const { data: existingScores, error } = await supabase
    .from("assessment_scores")
    .select("*, students(id, name)")
    .eq("assessment_id", assessmentId)
    .order("created_at");

  if (error) throw error;

  const scores = (existingScores as unknown as AssessmentScoreWithStudent[]) ?? [];

  // 3. If the assessment has a subject, fetch enrolled students and fill in missing ones
  if (assessment?.subject_id) {
    const { data: enrolled } = await supabase
      .from("subject_students")
      .select("student_id, students(id, name)")
      .eq("subject_id", assessment.subject_id);

    if (enrolled) {
      const existingStudentIds = new Set(scores.map((s) => s.student_id));
      const missingStudents = enrolled.filter(
        (e) => !existingStudentIds.has(e.student_id)
      );

      for (const ms of missingStudents) {
        const student = ms.students as unknown as { id: string; name: string } | null;
        scores.push({
          id: "",
          assessment_id: assessmentId,
          student_id: ms.student_id,
          score: null,
          grade_value: null,
          check_value: null,
          status: "응시",
          note: null,
          recorded_by: null,
          created_at: "",
          students: student,
        });
      }
    }
  }

  return scores;
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

  const parsed = validate(createAssessmentSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  let chapterIds: string[] = [];
  if (parsed.data.chapter_ids) {
    try {
      chapterIds = JSON.parse(parsed.data.chapter_ids);
    } catch {
      return { error: "단원 ID 형식이 올바르지 않습니다." };
    }
  }

  const { data: assessment, error } = await supabase
    .from("assessments")
    .insert({
      academy_id: profile.academy_id,
      name: parsed.data.name,
      subject_id: parsed.data.subject_id,
      textbook_id: parsed.data.textbook_id || null,
      template_id: parsed.data.template_id || null,
      type: parsed.data.type || "시험",
      date: parsed.data.date,
      total_points: parsed.data.total_points ?? 100,
      scoring_method: parsed.data.scoring_method || "score",
      is_public: parsed.data.is_public === "true",
      weight: parsed.data.weight ?? 1,
      status: parsed.data.status || "예정",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (chapterIds.length > 0 && assessment) {
    const linkResult = await linkChapters(assessment.id, chapterIds);
    if (linkResult?.error) {
      return { error: `평가는 생성되었으나 단원 연결 실패: ${linkResult.error}` };
    }
  }

  // Auto-assign students if student_ids provided
  const studentIds = formData.getAll("student_ids") as string[];
  if (assessment && studentIds.length > 0) {
    const rows = studentIds.map((studentId) => ({
      assessment_id: assessment.id,
      student_id: studentId,
      status: "응시" as const,
    }));
    const { error: scoreError } = await supabase
      .from("assessment_scores")
      .upsert(rows, { onConflict: "assessment_id,student_id" });
    if (scoreError) {
      return { error: `평가는 생성되었으나 학생 배정 실패: ${scoreError.message}` };
    }
  }

  revalidatePath("/assessments");
  revalidatePath("/scores");
  return { success: true, id: assessment?.id };
}

export async function updateAssessment(id: string, formData: FormData) {
  const supabase = await createClient();

  const chapterIdsRaw = formData.get("chapter_ids");
  let chapterIds: string[] = [];
  if (chapterIdsRaw) {
    try {
      chapterIds = JSON.parse(chapterIdsRaw as string);
    } catch {
      return { error: "단원 ID 형식이 올바르지 않습니다." };
    }
  }

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
  if (totalPoints !== null && totalPoints !== "") {
    const num = Number(totalPoints);
    if (!isNaN(num) && num > 0) updatePayload.total_points = num;
  }

  const scoringMethod = formData.get("scoring_method") as string | null;
  if (scoringMethod) updatePayload.scoring_method = scoringMethod;

  const isPublicRaw = formData.get("is_public");
  if (isPublicRaw !== null) updatePayload.is_public = isPublicRaw === "true";

  const weight = formData.get("weight");
  if (weight !== null && weight !== "") {
    const num = Number(weight);
    if (!isNaN(num) && num >= 0) updatePayload.weight = num;
  }

  const status = formData.get("status") as string | null;
  if (status) updatePayload.status = status;

  const { error } = await supabase
    .from("assessments")
    .update(updatePayload)
    .eq("id", id);

  if (error) return { error: error.message };

  // Re-sync chapter links when chapter_ids is explicitly provided
  if (formData.has("chapter_ids")) {
    const linkResult = await linkChapters(id, chapterIds);
    if (linkResult?.error) {
      return { error: `평가는 수정되었으나 단원 연결 실패: ${linkResult.error}` };
    }
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

  const parsed = validate(z.array(assessmentScoreSchema).min(1, "점수를 1개 이상 입력하세요."), scores);
  if (!parsed.success) return { error: parsed.error };

  const upsertData = parsed.data.map((s) => ({
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

  const parsed = validate(assessmentTemplateSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase.from("assessment_templates").insert({
    academy_id: profile.academy_id,
    subject_id: parsed.data.subject_id,
    name: parsed.data.name,
    recurrence: parsed.data.recurrence || "weekly",
    day_of_week: parsed.data.day_of_week ?? null,
    assessment_type: parsed.data.assessment_type || "시험",
    scoring_method: parsed.data.scoring_method || "score",
    total_points: parsed.data.total_points ?? null,
    is_active: parsed.data.is_active !== "false",
  });

  if (error) return { error: error.message };

  revalidatePath("/assessments");
  return { success: true };
}

export async function updateTemplate(id: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = validate(assessmentTemplateSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.name) updatePayload.name = parsed.data.name;
  if (parsed.data.subject_id) updatePayload.subject_id = parsed.data.subject_id;
  if (parsed.data.recurrence) updatePayload.recurrence = parsed.data.recurrence;
  if (parsed.data.day_of_week !== undefined)
    updatePayload.day_of_week = parsed.data.day_of_week ?? null;
  if (parsed.data.assessment_type) updatePayload.assessment_type = parsed.data.assessment_type;
  if (parsed.data.scoring_method) updatePayload.scoring_method = parsed.data.scoring_method;
  if (parsed.data.total_points !== undefined)
    updatePayload.total_points = parsed.data.total_points ?? null;
  if (parsed.data.is_active !== undefined) updatePayload.is_active = parsed.data.is_active !== "false";

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
