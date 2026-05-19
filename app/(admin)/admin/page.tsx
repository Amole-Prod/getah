import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

const sections = [
  {
    title: "Auth boundary",
    description: "Proxy protects /admin and server layout rechecks session.",
  },
  {
    title: "Supabase access",
    description:
      "Dedicated clients exist for browser, server, admin, and proxy.",
  },
  {
    title: "Server mutation path",
    description:
      "Server Actions handle sign-in and sign-out without client API glue.",
  },
];

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-brand text-sm tracking-[0.24em] uppercase">
          Overview
        </p>
        <h2 className="text-surface-foreground text-3xl font-semibold tracking-tight">
          Welcome back{user?.email ? `, ${user.email}` : ""}.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-300">
          Getah (Gebrakan Pemerintah) admin surface is initial shell for
          protected workflows, CMS tools, analytics, and operational dashboards.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-300">
                {section.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
