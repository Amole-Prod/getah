import "server-only";

import { logger } from "@/lib/logging/logger";
import { withRetry } from "@/features/presidential-actions-ai/retry";
import { createWeeklyReportProvider } from "@/features/weekly-reports/provider";
import {
  listWeeklyActions,
  syncWeeklyReportNewsLinks,
  upsertWeeklyReport,
  upsertWeeklyReportSentiment,
} from "@/features/weekly-reports/repository";
import {
  buildFallbackExecutiveSummary,
  buildFallbackKeyFindings,
  buildWeeklyDraft,
  buildWeeklyMetrics,
  getPreviousCompletedWeekRange,
} from "@/features/weekly-reports/utils";

export async function generateWeeklyReport() {
  const { weekEnd, weekStart } = getPreviousCompletedWeekRange();
  const actions = await listWeeklyActions(weekStart, weekEnd);
  const metrics = buildWeeklyMetrics(actions);
  const fallbackSummary = buildFallbackExecutiveSummary(metrics);
  const fallbackFindings = buildFallbackKeyFindings(metrics);
  let executiveSummary = fallbackSummary;
  let keyFindings = fallbackFindings;
  const provider = createWeeklyReportProvider();

  const initialDraft = buildWeeklyDraft({
    actions,
    executiveSummary,
    keyFindings,
    metrics,
    weekEnd,
    weekStart,
  });

  try {
    const generated = await withRetry(
      () => provider.generate(initialDraft),
      2,
      500,
    );
    executiveSummary = generated.executiveSummary;
    keyFindings = generated.keyFindings;
  } catch (error) {
    logger.warn("Weekly report AI generation failed, fallback used", {
      message:
        error instanceof Error ? error.message : "Unknown weekly AI error",
      provider: provider.name,
    });
  }

  const finalDraft = buildWeeklyDraft({
    actions,
    executiveSummary,
    keyFindings,
    metrics,
    weekEnd,
    weekStart,
  });
  const { reportId, slug } = await upsertWeeklyReport(
    finalDraft,
    provider.name,
  );

  await syncWeeklyReportNewsLinks(reportId, actions);
  await upsertWeeklyReportSentiment(reportId, provider.name, finalDraft);

  logger.info("Weekly report generated", {
    actionCount: actions.length,
    provider: provider.name,
    reportId,
    slug,
    weekEnd,
    weekStart,
  });

  return {
    actionCount: actions.length,
    provider: provider.name,
    reportId,
    slug,
    title: finalDraft.title,
    weekEnd,
    weekStart,
  };
}
