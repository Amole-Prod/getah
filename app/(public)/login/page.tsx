import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/features/auth/actions";
import { readSearchParam, resolveNextPath } from "@/features/auth/utils";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
    status?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(DEFAULT_AUTH_REDIRECT);
  }

  const params = await searchParams;
  const status = readSearchParam(params.status);
  const error = readSearchParam(params.error);
  const next = resolveNextPath(params.next);

  return (
    <AuthShell
      title="Login to dashboard"
      description="Use Supabase Auth with secure server-side session handling to access protected admin routes."
      footerText="Need account?"
      footerHref="/register"
      footerLabel="Register"
    >
      {status === "verify-email" ? (
        <Alert tone="success">
          Registration complete. Check email to verify account.
        </Alert>
      ) : null}

      {status === "signed-out" ? (
        <Alert tone="info">Session closed. Login again to continue.</Alert>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}

      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-200">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <Link
              href={"/register" as Route}
              className="text-brand text-xs hover:underline"
            >
              Create account
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Minimum 8 characters"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </AuthShell>
  );
}
