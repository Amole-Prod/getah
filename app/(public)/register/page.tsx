import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/features/auth/actions";
import { readSearchParam, resolveNextPath } from "@/features/auth/utils";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(DEFAULT_AUTH_REDIRECT);
  }

  const params = await searchParams;
  const error = readSearchParam(params.error);
  const next = resolveNextPath(params.next);

  return (
    <AuthShell
      title="Create admin account"
      description="Register with email and password. Confirmation email flow stays wired through Supabase callback route."
      footerText="Already have account?"
      footerHref="/login"
      footerLabel="Login"
    >
      {error ? <Alert tone="error">{error}</Alert> : null}

      <form action={signUpAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="text-sm font-medium text-slate-200"
          >
            Full name
          </label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Topan Presiden"
            required
          />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-200"
            >
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </AuthShell>
  );
}
