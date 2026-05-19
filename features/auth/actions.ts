"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";
import { publicEnv } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/utils/redirect";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";

function redirectTo(path: string) {
  redirect(path as Route);
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return redirectTo(
      `/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid request")}`,
    );
  }

  const data = parsed.data;
  const next = sanitizeNextPath(data.next ?? DEFAULT_AUTH_REDIRECT);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    redirectTo(
      `/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
    );
  }

  redirectTo(next);
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return redirectTo(
      `/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid request")}`,
    );
  }

  const data = parsed.data;
  const next = sanitizeNextPath(data.next ?? DEFAULT_AUTH_REDIRECT);
  const supabase = await createSupabaseServerClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectTo(
      `/register?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
    );
  }

  if (signUpData.session) {
    redirectTo(next);
  }

  redirectTo(
    `/login?status=${encodeURIComponent("verify-email")}&next=${encodeURIComponent(next)}`,
  );
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirectTo("/login?status=signed-out");
}
