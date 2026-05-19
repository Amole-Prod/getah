import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { requireUser } from "@/lib/auth/session";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireUser();

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[280px_1fr]">
      <DashboardSidebar userEmail={user.email ?? "admin@local"} />
      <div className="flex min-h-screen flex-col">
        <header className="border-border/70 flex items-center justify-between border-b px-6 py-4 lg:px-8">
          <div>
            <p className="text-muted text-sm">Admin dashboard</p>
            <h1 className="text-surface-foreground text-lg font-semibold">
              Getah
            </h1>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
