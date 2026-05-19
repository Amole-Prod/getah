import type {
  WeeklyReportActionRow,
  WeeklyReportDraft,
  WeeklyReportMetrics,
} from "@/features/weekly-reports/types";

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setUTCDate(next.getUTCDate() + diff);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

export function getPreviousCompletedWeekRange(reference = new Date()) {
  const currentWeekStart = startOfWeek(reference);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setUTCDate(previousWeekEnd.getUTCDate() - 1);
  previousWeekEnd.setUTCHours(0, 0, 0, 0);

  return {
    weekEnd: previousWeekEnd.toISOString().slice(0, 10),
    weekStart: previousWeekStart.toISOString().slice(0, 10),
  };
}

function readMetaString(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function mapImpactLevel(score: number | null) {
  if (score === null) {
    return "low";
  }

  if (score >= 90) {
    return "critical";
  }

  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "medium";
  }

  return "low";
}

function createSlug(weekStart: string, weekEnd: string) {
  return `weekly-report-${weekStart}-to-${weekEnd}`;
}

function aggregateCounts<T extends string>(values: T[]) {
  const grouped = new Map<string, number>();

  for (const value of values) {
    grouped.set(value, (grouped.get(value) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, total]) => ({ key, total }));
}

export function buildWeeklyMetrics(actions: WeeklyReportActionRow[]) {
  const categories = aggregateCounts(
    actions.map(
      (item) => readMetaString(item.metadata, "category") ?? "uncategorized",
    ),
  );
  const sentiments = aggregateCounts(
    actions.map(
      (item) => readMetaString(item.metadata, "sentiment") ?? "neutral",
    ),
  );
  const impacts = aggregateCounts(
    actions.map((item) => mapImpactLevel(item.impact_score)),
  );

  return {
    byCategory: categories.map(({ key, total }) => ({ category: key, total })),
    byImpact: impacts.map(({ key, total }) => ({ impactLevel: key, total })),
    bySentiment: sentiments.map(({ key, total }) => ({
      sentiment: key,
      total,
    })),
    highImpactCount: actions.filter((item) => (item.impact_score ?? 0) >= 75)
      .length,
    publishedCount: actions.filter((item) => item.status === "published")
      .length,
    totalActions: actions.length,
  } satisfies WeeklyReportMetrics;
}

export function buildWeeklyDraft({
  actions,
  executiveSummary,
  keyFindings,
  metrics,
  weekEnd,
  weekStart,
}: {
  actions: WeeklyReportActionRow[];
  executiveSummary: string;
  keyFindings: string[];
  metrics: WeeklyReportMetrics;
  weekEnd: string;
  weekStart: string;
}) {
  return {
    actions,
    executiveSummary,
    keyFindings,
    metrics,
    sourceSnapshot: {
      generatedAt: new Date().toISOString(),
      charts: {
        category: metrics.byCategory,
        impact: metrics.byImpact,
        sentiment: metrics.bySentiment,
      },
    },
    title: `Weekly Presidential Actions Report: ${weekStart} to ${weekEnd}`,
    weekEnd,
    weekStart,
  } satisfies WeeklyReportDraft;
}

export function buildFallbackExecutiveSummary(metrics: WeeklyReportMetrics) {
  const mainCategory = metrics.byCategory[0]?.category ?? "uncategorized";
  return `Week recorded ${metrics.totalActions} presidential actions. Main concentration stayed in ${mainCategory}, with ${metrics.highImpactCount} high-impact decisions and ${metrics.publishedCount} published actions.`;
}

export function buildFallbackKeyFindings(metrics: WeeklyReportMetrics) {
  return [
    `Top category: ${metrics.byCategory[0]?.category ?? "uncategorized"}.`,
    `High impact actions: ${metrics.highImpactCount}.`,
    `Sentiment trend: ${metrics.bySentiment[0]?.sentiment ?? "neutral"} dominated coverage.`,
  ];
}

export function createWeeklyReportSlug(weekStart: string, weekEnd: string) {
  return createSlug(weekStart, weekEnd);
}
