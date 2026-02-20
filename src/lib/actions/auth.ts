"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema, signupSchema, formDataToObject, validate } from "@/lib/validations";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const parsed = validate(loginSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };
  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const parsed = validate(signupSchema, formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error };
  const { email, password, academyName, ownerName, phone } = parsed.data;

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "회원가입에 실패했습니다." };
  }

  // 2. Create academy
  const slug =
    academyName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  const { data: academy, error: academyError } = await supabase
    .from("academies")
    .insert({ name: academyName, slug, phone: phone || null })
    .select()
    .single();

  if (academyError || !academy) {
    return { error: academyError?.message || "학원 생성에 실패했습니다." };
  }

  // 3. Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    academy_id: academy.id,
    name: ownerName,
    email,
    role: "admin",
  });

  if (profileError) {
    return { error: profileError.message };
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
