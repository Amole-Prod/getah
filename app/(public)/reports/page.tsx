import type { Route } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { listRecentPublishedWeeklyReports } from "@/features/weekly-reports/repository";

export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  const reports = await listRecentPublishedWeeklyReports();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-brand text-sm tracking-[0.24em] uppercase">
          Public reports
        </p>
        <h1 className="text-surface-foreground text-4xl font-semibold tracking-tight">
          Weekly presidential action reports
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-300">
          Shareable weekly summaries covering grouped categories, impact,
          sentiment, and AI-generated insights.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {reports.length ? (
          reports.map((report) => (
            <Card key={report.reportId}>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  {report.weekStart} to {report.weekEnd}
                </p>
                <Link
                  href={`/reports/${report.slug}` as Route}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Open report
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-slate-400">
              No published reports yet.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
