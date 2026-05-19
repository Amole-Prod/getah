import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerHref: Route;
  footerLabel: string;
  children: ReactNode;
};

const features = [
  "Supabase Auth session cookies across server, client, and proxy.",
  "Protected admin routes with redirect-aware auth gate.",
  "Server Actions with Zod validation for login and register.",
];

export function AuthShell({
  title,
  description,
  footerText,
  footerHref,
  footerLabel,
  children,
}: AuthShellProps) {
  return (
    <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-14">
      <section className="order-2 space-y-6 lg:order-1">
        <div className="space-y-4">
          <span className="border-brand/30 bg-brand/10 text-brand inline-flex rounded-full border px-4 py-1 text-sm font-medium">
            Secure access
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            {description}
          </p>
        </div>

        <div className="grid gap-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="border-border/70 rounded-2xl border bg-white/5 px-4 py-4 text-sm text-slate-200"
            >
              {feature}
            </div>
          ))}
        </div>
      </section>

      <Card className="order-1 w-full lg:order-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-muted text-sm leading-6">{description}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {children}
          <p className="text-center text-sm text-slate-400">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="text-brand font-medium hover:underline"
            >
              {footerLabel}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
