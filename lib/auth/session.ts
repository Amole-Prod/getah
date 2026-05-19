import "server-only";

import { redirect } from "next/navigation";

import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(DEFAULT_AUTH_REDIRECT)}`);
  }

  return user;
}
