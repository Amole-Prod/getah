import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportBars } from "@/features/weekly-reports/components/report-bars";
import { ReportStats } from "@/features/weekly-reports/components/report-stats";
import { getPublishedWeeklyReportBySlug } from "@/features/weekly-reports/repository";

export const dynamic = "force-dynamic";

type WeeklyReportPageProps = {
  params: Promise<{ slug: string }>;
};

function readMetricArray<T>(
  value: unknown,
  mapper: (item: Record<string, unknown>) => T,
) {
  if (!Array.isArray(value)) {
    return [] as T[];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map(mapper);
}

function readMetrics(metrics: unknown) {
  const record = (metrics as Record<string, unknown> | null) ?? {};

  return {
    byCategory: readMetricArray(record.byCategory, (item) => ({
      label: String(item.category),
      total: Number(item.total ?? 0),
    })),
    byImpact: readMetricArray(record.byImpact, (item) => ({
      label: String(item.impactLevel),
      total: Number(item.total ?? 0),
    })),
    bySentiment: readMetricArray(record.bySentiment, (item) => ({
      label: String(item.sentiment),
      total: Number(item.total ?? 0),
    })),
    highImpactCount: Number(record.highImpactCount ?? 0),
    publishedCount: Number(record.publishedCount ?? 0),
    totalActions: Number(record.totalActions ?? 0),
  };
}

function readFindings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export default async function WeeklyReportPage({
  params,
}: WeeklyReportPageProps) {
  const { slug } = await params;
  const report = await getPublishedWeeklyReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const metrics = readMetrics(report.metrics);
  const findings = readFindings(report.key_findings);

  return (
    <div className="space-y-8">
      <section className="border-border/70 bg-surface/85 space-y-4 rounded-3xl border p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-brand text-sm tracking-[0.24em] uppercase">
              Weekly report
            </p>
            <h1 className="text-surface-foreground max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              {report.title}
            </h1>
            <p className="text-sm text-slate-400">
              Week {report.report_week_start} to {report.report_week_end}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={"/reports" as Route}
              className={buttonVariants({ variant: "secondary" })}
            >
              All reports
            </Link>
            <Link
              href={`/reports/${report.slug}/pdf` as Route}
              className={buttonVariants()}
            >
              Export PDF
            </Link>
          </div>
        </div>
        <p className="max-w-4xl text-base leading-7 text-slate-200">
          {report.executive_summary ?? "No executive summary available."}
        </p>
      </section>

      <ReportStats
        highImpactCount={metrics.highImpactCount}
        publishedCount={metrics.publishedCount}
        totalActions={metrics.totalActions}
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <ReportBars items={metrics.byCategory} title="Categories" />
        <ReportBars items={metrics.byImpact} title="Impact levels" />
        <ReportBars items={metrics.bySentiment} title="Sentiment" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>AI insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {findings.length ? (
              findings.map((finding) => (
                <div
                  key={finding}
                  className="flex gap-3 text-sm leading-6 text-slate-200"
                >
                  <span className="bg-brand mt-2 h-2 w-2 rounded-full" />
                  <p>{finding}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No insight points available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>Public report link ready for sharing.</p>
            <code className="border-border/70 block rounded-2xl border bg-slate-950/60 px-4 py-3 text-xs text-slate-200">
              /reports/{report.slug}
            </code>
            <p>
              Generated by{" "}
              {report.generated_by ?? report.generation_model ?? "system"}.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
