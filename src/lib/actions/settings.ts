"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Academy, Profile } from "@/types/database";
import { academyInfoSchema, formDataToObject, validate } from "@/lib/validations";

export async function getAcademyInfo(): Promise<Academy | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return null;

  const { data } = await supabase
    .from("academies")
    .select("*")
    .eq("id", profile.academy_id)
    .single();

  return data;
}

export async function updateAcademyInfo(formData: FormData) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const parsed = validate(academyInfoSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };

  const { error } = await supabase
    .from("academies")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      operating_hours_start: parsed.data.operating_hours_start || null,
      operating_hours_end: parsed.data.operating_hours_end || null,
    })
    .eq("id", profile.academy_id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function getTeachers(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at");

  if (error) throw error;
  return (data as Profile[]) ?? [];
}
