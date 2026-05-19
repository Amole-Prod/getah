import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createWeeklyReportSlug } from "@/features/weekly-reports/utils";
import type {
  WeeklyReportActionRow,
  WeeklyReportDraft,
  WeeklyReportRecord,
  WeeklyReportSummary,
} from "@/features/weekly-reports/types";

export async function listWeeklyActions(weekStart: string, weekEnd: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("presidential_actions")
    .select(
      "id, title, summary, description, action_date, impact_score, status, published_at, metadata, primary_news_item_id",
    )
    .gte("action_date", weekStart)
    .lte("action_date", weekEnd)
    .order("action_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WeeklyReportActionRow[];
}

export async function upsertWeeklyReport(
  draft: WeeklyReportDraft,
  providerName: string,
) {
  const supabase = createSupabaseAdminClient();
  const slug = createWeeklyReportSlug(draft.weekStart, draft.weekEnd);
  const payload = {
    executive_summary: draft.executiveSummary,
    generated_by: providerName,
    generation_model: providerName,
    key_findings: draft.keyFindings,
    metrics: draft.metrics,
    published_at: new Date().toISOString(),
    report_week_end: draft.weekEnd,
    report_week_start: draft.weekStart,
    slug,
    source_snapshot: draft.sourceSnapshot,
    status: "published",
    title: draft.title,
  };

  const { data: existing, error: existingError } = await supabase
    .from("weekly_reports")
    .select("id")
    .eq("report_week_start", draft.weekStart)
    .eq("report_week_end", draft.weekEnd)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  let reportId: string;

  if (existing?.id) {
    const { error } = await supabase
      .from("weekly_reports")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    reportId = existing.id as string;
  } else {
    const { data, error } = await supabase
      .from("weekly_reports")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    reportId = data.id as string;
  }

  return { reportId, slug };
}

export async function syncWeeklyReportNewsLinks(
  reportId: string,
  actions: WeeklyReportActionRow[],
) {
  const supabase = createSupabaseAdminClient();
  const newsItems = actions
    .map((item) => item.primary_news_item_id)
    .filter((item): item is string => Boolean(item));

  const { error: deleteError } = await supabase
    .from("weekly_report_news_items")
    .delete()
    .eq("weekly_report_id", reportId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!newsItems.length) {
    return;
  }

  const rows = newsItems.map((newsItemId) => ({
    news_item_id: newsItemId,
    weekly_report_id: reportId,
  }));
  const { error } = await supabase
    .from("weekly_report_news_items")
    .insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertWeeklyReportSentiment(
  reportId: string,
  providerName: string,
  draft: WeeklyReportDraft,
) {
  const supabase = createSupabaseAdminClient();
  const dominantSentiment =
    draft.metrics.bySentiment[0]?.sentiment ?? "neutral";
  const { data: existing, error: existingError } = await supabase
    .from("sentiment_analysis")
    .select("id")
    .eq("target_type", "weekly_report")
    .eq("weekly_report_id", reportId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const payload = {
    analysis_payload: {
      bySentiment: draft.metrics.bySentiment,
      summary: draft.executiveSummary,
    },
    confidence: 0.75,
    keywords: draft.metrics.byCategory.map((item) => item.category),
    model_name: providerName,
    sentiment: dominantSentiment,
    target_type: "weekly_report",
    weekly_report_id: reportId,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("sentiment_analysis")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from("sentiment_analysis").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPublishedWeeklyReportBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("weekly_reports")
    .select(
      "id, slug, title, report_week_start, report_week_end, executive_summary, key_findings, metrics, source_snapshot, status, published_at, generated_by, generation_model",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as WeeklyReportRecord | null;
}

export async function listRecentPublishedWeeklyReports(limit = 8) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("weekly_reports")
    .select(
      "id, slug, title, report_week_start, report_week_end, status, published_at, executive_summary, generated_by, generation_model, key_findings, metrics, source_snapshot",
    )
    .eq("status", "published")
    .order("report_week_start", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as WeeklyReportRecord[]).map((item) => ({
    reportId: item.id,
    slug: item.slug,
    status: item.status,
    title: item.title,
    weekEnd: item.report_week_end,
    weekStart: item.report_week_start,
  })) satisfies WeeklyReportSummary[];
}
