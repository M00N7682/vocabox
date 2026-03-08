"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type QuickRecordWithStudent = {
  id: string;
  class_id: string;
  student_id: string;
  record_date: string;
  category: string;
  label: string | null;
  value: string | null;
  numeric_value: number | null;
  note: string | null;
  created_at: string;
  students: { id: string; name: string; grade: string | null } | null;
};

/**
 * Parse a numeric value from a string.
 * Handles patterns like "18/20" → 90, "85" → 85, "7/10" → 70.
 * Returns null if no numeric value can be extracted.
 */
function parseNumericValue(value: string): number | null {
  // Try fraction pattern first (e.g. "18/20")
  const fractionMatch = value.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1]);
    const denominator = parseFloat(fractionMatch[2]);
    if (denominator > 0) {
      return Math.round((numerator / denominator) * 10000) / 100;
    }
    return null;
  }

  // Try plain number
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return num;
  }

  return null;
}

export async function getQuickRecords(
  classId: string,
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }
): Promise<QuickRecordWithStudent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("quick_records")
    .select("*, students(id, name, grade)")
    .eq("class_id", classId)
    .order("record_date", { ascending: false })
    .order("student_id");

  if (filters?.dateFrom) {
    query = query.gte("record_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("record_date", filters.dateTo);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown as QuickRecordWithStudent[]) ?? [];
}

export async function getQuickRecordCategories(
  classId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quick_records")
    .select("category")
    .eq("class_id", classId);

  if (error) throw error;

  const categories = [
    ...new Set((data ?? []).map((r) => r.category)),
  ];
  return categories.sort();
}

export async function saveQuickRecord(data: {
  class_id: string;
  student_id: string;
  record_date: string;
  category: string;
  label?: string;
  value: string;
  note?: string;
}) {
  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const numericValue = parseNumericValue(data.value);

  // Check for existing record to do manual upsert (label can be null)
  const { data: existing } = await supabase
    .from("quick_records")
    .select("id")
    .eq("class_id", data.class_id)
    .eq("student_id", data.student_id)
    .eq("record_date", data.record_date)
    .eq("category", data.category)
    .is("label", data.label || null)
    .maybeSingle();

  const row = {
    academy_id: profile.data.academy_id,
    class_id: data.class_id,
    student_id: data.student_id,
    record_date: data.record_date,
    category: data.category,
    label: data.label || null,
    value: data.value,
    numeric_value: numericValue,
    note: data.note || null,
    recorded_by: profile.data.id,
  };

  const { error } = existing?.id
    ? await supabase.from("quick_records").update(row).eq("id", existing.id)
    : await supabase.from("quick_records").insert(row);

  if (error) return { error: error.message };

  revalidatePath("/classes");
  return { success: true };
}

export async function deleteQuickRecord(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("quick_records")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/classes");
  return { success: true };
}

export async function bulkSaveQuickRecords(
  records: Array<{
    class_id: string;
    student_id: string;
    record_date: string;
    category: string;
    label?: string;
    value: string;
    note?: string;
  }>
) {
  if (records.length === 0) return { error: "기록을 1개 이상 입력하세요." };

  const supabase = await createClient();

  const profile = await supabase
    .from("profiles")
    .select("academy_id, id")
    .single();

  if (!profile.data) return { error: "프로필을 찾을 수 없습니다." };

  const rows = records.map((r) => ({
    academy_id: profile.data!.academy_id,
    class_id: r.class_id,
    student_id: r.student_id,
    record_date: r.record_date,
    category: r.category,
    label: r.label || null,
    value: r.value,
    numeric_value: parseNumericValue(r.value),
    note: r.note || null,
    recorded_by: profile.data!.id,
  }));

  // Insert/update one at a time to handle null label correctly
  for (const row of rows) {
    const { data: existing } = await supabase
      .from("quick_records")
      .select("id")
      .eq("class_id", row.class_id)
      .eq("student_id", row.student_id)
      .eq("record_date", row.record_date)
      .eq("category", row.category)
      .is("label", row.label)
      .maybeSingle();

    const { error: rowError } = existing?.id
      ? await supabase.from("quick_records").update(row).eq("id", existing.id)
      : await supabase.from("quick_records").insert(row);

    if (rowError) return { error: rowError.message };
  }

  revalidatePath("/classes");
  return { success: true };
}
