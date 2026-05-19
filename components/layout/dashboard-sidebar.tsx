import type { Route } from "next";
import Link from "next/link";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sources" as Route, label: "Sources" },
  {
    href: "/admin/presidential-actions" as Route,
    label: "Presidential actions",
  },
  { href: "/", label: "Public site" },
  { href: "/login", label: "Auth entry" },
];

type DashboardSidebarProps = {
  userEmail: string;
};

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  return (
    <aside className="border-border/70 bg-surface/60 border-r px-6 py-8 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-brand text-sm tracking-[0.24em] uppercase">
            Admin
          </p>
          <div>
            <h2 className="text-surface-foreground text-xl font-semibold">
              Getah
            </h2>
            <p className="text-muted text-sm">{userEmail}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
