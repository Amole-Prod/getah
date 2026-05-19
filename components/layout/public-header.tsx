import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="border-border/70 border-b bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white"
        >
          Getah
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={"/register" as Route}
            className="text-sm text-slate-300 hover:text-white"
          >
            Register
          </Link>
          <Link
            href="/admin"
            className="text-sm text-slate-300 hover:text-white"
          >
            Dashboard
          </Link>
          <Button asChild size="sm">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
