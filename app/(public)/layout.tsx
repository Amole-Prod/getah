import type { ReactNode } from "react";
import Link from "next/link";

import { PublicHeader } from "@/components/layout/public-header";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 lg:px-8">
        {children}
      </main>
      <footer className="border-border/70 text-muted border-t px-6 py-6 text-sm lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <p>Getah starter.</p>
          <div className="flex items-center gap-4">
            <Link href="/login">Login</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
