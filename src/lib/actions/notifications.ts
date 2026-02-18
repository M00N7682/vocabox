"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Notification } from "@/types/database";

export type NotificationWithStudent = Notification & {
  students: { name: string } | null;
};

export async function getNotifications(filters?: {
  type?: string;
  channel?: string;
  isSent?: boolean;
  isRead?: boolean;
  search?: string;
}): Promise<NotificationWithStudent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("notifications")
    .select("*, students(name)")
    .order("created_at", { ascending: false });

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.channel) {
    query = query.eq("channel", filters.channel);
  }
  if (filters?.isSent !== undefined) {
    query = query.eq("is_sent", filters.isSent);
  }
  if (filters?.isRead !== undefined) {
    query = query.eq("is_read", filters.isRead);
  }

  const { data, error } = await query;

  if (error) throw error;

  let result = (data as unknown as NotificationWithStudent[]) ?? [];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search) ||
        n.students?.name.toLowerCase().includes(search)
    );
  }

  return result;
}

export async function createNotification(data: {
  student_id?: string;
  type: "attendance" | "score" | "assignment" | "reminder" | "risk_alert" | "monthly_report";
  channel?: "in_app" | "email" | "sms" | "kakao";
  title: string;
  message: string;
}) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  if (!profile) return { error: "프로필을 찾을 수 없습니다." };

  const { error } = await supabase.from("notifications").insert({
    academy_id: profile.academy_id,
    student_id: data.student_id ?? null,
    type: data.type,
    channel: data.channel ?? "in_app",
    title: data.title,
    message: data.message,
  });

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAsRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAsSent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_sent: true,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { success: true };
}

export async function getNotificationStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("type, is_read, is_sent");

  if (error) throw error;

  const records = data ?? [];

  const byType: Record<string, number> = {};
  for (const record of records) {
    byType[record.type] = (byType[record.type] ?? 0) + 1;
  }

  const unreadCount = records.filter((r) => !r.is_read).length;
  const unsentCount = records.filter((r) => !r.is_sent).length;

  return { byType, unreadCount, unsentCount };
}
