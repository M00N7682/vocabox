"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AcademySettings } from "@/types/database";
import { academySettingsSchema, formDataToObject, validate } from "@/lib/validations";

export async function getSettings(): Promise<AcademySettings | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return null;

  const { data: existing } = await supabase
    .from("academy_settings")
    .select("*")
    .eq("academy_id", profile.academy_id)
    .single();

  if (existing) return existing as AcademySettings;

  // Create with defaults if not exists
  const { data: created, error } = await supabase
    .from("academy_settings")
    .upsert(
      {
        academy_id: profile.academy_id,
        weak_threshold: 60,
        risk_score_threshold: 60,
        risk_score_count: 3,
        risk_absence_rate: 15,
        risk_missing_count: 3,
        late_threshold_min: 10,
        absent_threshold_min: 30,
        notify_attendance: true,
        notify_score: true,
        notify_assignment: true,
        notify_monthly_report: false,
      },
      { onConflict: "academy_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return created as AcademySettings;
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(academySettingsSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase
    .from("academy_settings")
    .update({
      weak_threshold: parsed.data.weak_threshold,
      risk_score_threshold: parsed.data.risk_score_threshold,
      risk_score_count: parsed.data.risk_score_count,
      risk_absence_rate: parsed.data.risk_absence_rate,
      risk_missing_count: parsed.data.risk_missing_count,
      late_threshold_min: parsed.data.late_threshold_min,
      absent_threshold_min: parsed.data.absent_threshold_min,
      notify_attendance: parsed.data.notify_attendance === "true",
      notify_score: parsed.data.notify_score === "true",
      notify_assignment: parsed.data.notify_assignment === "true",
      notify_monthly_report: parsed.data.notify_monthly_report === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("academy_id", profile.academy_id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
