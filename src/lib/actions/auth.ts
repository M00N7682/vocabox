"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loginSchema, signupSchema, formDataToObject, validate } from "@/lib/validations";
import { z } from "zod";

const supabaseErrorMap: Record<string, string> = {
  "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "Email not confirmed": "이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.",
  "User already registered": "이미 가입된 이메일입니다.",
  "email rate limit exceeded": "이메일 전송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.",
  "For security purposes, you can only request this after": "보안상 잠시 후 다시 시도해주세요.",
  "Password should be at least 6 characters": "비밀번호는 6자 이상이어야 합니다.",
};

function translateError(message: string): string {
  for (const [key, value] of Object.entries(supabaseErrorMap)) {
    if (message.includes(key)) return value;
  }
  if (message.includes("Email address") && message.includes("is invalid")) {
    return "올바른 이메일 주소를 입력해주세요.";
  }
  return message;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const parsed = validate(loginSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };
  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateError(error.message) };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const parsed = validate(signupSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };
  const { email, password, academyName, ownerName, phone } = parsed.data;

  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  // 1. Create auth user with email redirect
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    return { error: authError ? translateError(authError.message) : "회원가입에 실패했습니다." };
  }

  // 2. Create academy + profile via SECURITY DEFINER function (bypasses RLS)
  const slug =
    academyName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  const { error: setupError } = await supabase.rpc("handle_signup", {
    p_user_id: authData.user.id,
    p_academy_name: academyName,
    p_slug: slug,
    p_phone: phone || null,
    p_owner_name: ownerName,
    p_email: email,
  });

  if (setupError) {
    return { error: setupError.message || "학원 생성에 실패했습니다." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*, academies(*)")
    .eq("id", user.id)
    .single();

  return data;
}

export async function resetPassword(formData: FormData) {
  const parsed = validate(
    z.object({ email: z.string().email("올바른 이메일 형식이 아닙니다.") }),
    formDataToObject(formData)
  );
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/reset-password` }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const parsed = validate(
    z.object({
      password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
    }),
    formDataToObject(formData)
  );
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
