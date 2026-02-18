"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Academy, Profile } from "@/types/database";

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

  const { error } = await supabase
    .from("academies")
    .update({
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      operating_hours_start:
        (formData.get("operating_hours_start") as string) || null,
      operating_hours_end:
        (formData.get("operating_hours_end") as string) || null,
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
