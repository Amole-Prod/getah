import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";
import { publicEnv } from "@/lib/env/public";
import { sanitizeNextPath } from "@/lib/utils/redirect";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminPath =
    pathname === DEFAULT_AUTH_REDIRECT ||
    pathname.startsWith(`${DEFAULT_AUTH_REDIRECT}/`);
  const isLoginPath = pathname === "/login";
  const isRegisterPath = pathname === "/register";

  if (!user && isAdminPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      sanitizeNextPath(`${pathname}${request.nextUrl.search}`),
    );

    return NextResponse.redirect(loginUrl);
  }

  if (user && (isLoginPath || isRegisterPath)) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
  }

  return response;
}
