import type { Route } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const highlights = [
  "App Router + route groups for public and admin surfaces.",
  "Supabase clients for browser, server, admin, and proxy usage.",
  "Server Actions for auth flows with safe redirect handling.",
  "TailwindCSS v4, ESLint, Prettier, path aliases, and typed env access.",
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <section className="border-border/70 bg-surface/75 grid gap-8 rounded-3xl border p-8 shadow-2xl shadow-black/20 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <div className="space-y-6">
          <span className="border-brand/30 bg-brand/10 text-brand inline-flex rounded-full border px-4 py-1 text-sm font-medium">
            Production-ready base
          </span>
          <div className="space-y-4">
            <h1 className="text-surface-foreground max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Getah run on clean Next.js foundation.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Structured for scale with clear route boundaries, reusable UI,
              validated env access, and Supabase auth plumbing ready for real
              product work.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className={buttonVariants()}>
              Start auth flow
            </Link>
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "secondary" }), "border")}
            >
              Open admin shell
            </Link>
            <Link
              href={"/reports" as Route}
              className={cn(buttonVariants({ variant: "secondary" }), "border")}
            >
              Open weekly reports
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Starter checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            {highlights.map((item) => (
              <div key={item} className="flex gap-3">
                <span className="bg-brand mt-1 h-2 w-2 rounded-full" />
                <p>{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
