import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";
import { sanitizeNextPath } from "@/lib/utils/redirect";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(
    requestUrl.searchParams.get("next") ?? DEFAULT_AUTH_REDIRECT,
  );

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing%20auth%20code", request.url),
    );
  }

  const supabase = await createSupabaseRouteClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
