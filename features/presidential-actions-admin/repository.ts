import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureCategory } from "@/features/presidential-actions-ai/repository";
import type {
  PresidentialActionCategoryPoint,
  PresidentialActionDashboardStats,
  PresidentialActionDetail,
  PresidentialActionFilters,
  PresidentialActionFormValues,
  PresidentialActionListItem,
  PresidentialActionTrendPoint,
} from "@/features/presidential-actions-admin/types";

function extractString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" ? value : null;
}

function mapImpactLevel(
  score: number | null,
): PresidentialActionDetail["impact_level"] {
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

export async function listPresidentialActions(
  filters: PresidentialActionFilters,
) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("presidential_actions")
    .select(
      "id, slug, title, summary, action_date, impact_score, status, published_at, metadata, ai_summary, primary_news_item_id, source_id",
    )
    .order("action_date", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(150);

  if (filters.category) {
    query = query.contains("metadata", { category: filters.category });
  }

  if (filters.sentiment) {
    query = query.contains("metadata", { sentiment: filters.sentiment });
  }

  if (filters.impactLevel) {
    query = query.contains("metadata", { impact_level: filters.impactLevel });
  }

  if (filters.dateFrom) {
    query = query.gte("action_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("action_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PresidentialActionListItem[];
}

export async function getPresidentialActionDetail(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("presidential_actions")
    .select(
      "id, slug, title, summary, description, action_date, impact_score, status, published_at, metadata, ai_summary, primary_news_item_id, source_id, sources(name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const metadata = (data.metadata as Record<string, unknown> | null) ?? null;
  const aiSummary = (data.ai_summary as Record<string, unknown> | null) ?? null;
  const relatedSource = data.sources as { name?: string } | null;

  return {
    ...data,
    category: extractString(metadata, "category") ?? "pemerintahan",
    confidence:
      typeof aiSummary?.confidence === "number" ? aiSummary.confidence : null,
    impact_level: mapImpactLevel(data.impact_score as number | null),
    provider: extractString(aiSummary, "provider"),
    reasoning: extractString(aiSummary, "reasoning"),
    related_news_url: extractString(metadata, "related_news_url"),
    sentiment:
      (extractString(metadata, "sentiment") as
        | PresidentialActionDetail["sentiment"]
        | null) ?? "neutral",
    source_name: relatedSource?.name ?? null,
  } satisfies PresidentialActionDetail;
}

export function buildPresidentialActionStats(
  items: PresidentialActionListItem[],
) {
  return {
    drafts: items.filter((item) => item.status === "draft").length,
    highImpact: items.filter((item) => (item.impact_score ?? 0) >= 75).length,
    published: items.filter((item) => item.status === "published").length,
    total: items.length,
  } satisfies PresidentialActionDashboardStats;
}

export function buildTrendPoints(items: PresidentialActionListItem[]) {
  const grouped = new Map<string, number>();

  for (const item of items) {
    const dateKey =
      item.action_date ?? item.published_at?.slice(0, 10) ?? "Unknown";
    grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([date, total]) => ({
      date,
      total,
    })) satisfies PresidentialActionTrendPoint[];
}

export function buildCategoryPoints(items: PresidentialActionListItem[]) {
  const grouped = new Map<string, number>();

  for (const item of items) {
    const metadata = (item.metadata as Record<string, unknown> | null) ?? null;
    const category = extractString(metadata, "category") ?? "uncategorized";
    grouped.set(category, (grouped.get(category) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, total]) => ({
      category,
      total,
    })) satisfies PresidentialActionCategoryPoint[];
}

export async function listPresidentialActionCategories() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => item.name as string);
}

export async function updatePresidentialAction(
  values: PresidentialActionFormValues,
) {
  const supabase = createSupabaseAdminClient();
  const detail = await getPresidentialActionDetail(values.id);

  if (!detail) {
    throw new Error("Presidential action not found.");
  }

  const publishedAt =
    values.status === "published"
      ? (detail.published_at ?? new Date().toISOString())
      : null;
  const categoryId = await ensureCategory(values.category);
  const { error } = await supabase
    .from("presidential_actions")
    .update({
      action_date: values.actionDate || null,
      description: values.description,
      impact_score:
        values.impactLevel === "critical"
          ? 95
          : values.impactLevel === "high"
            ? 80
            : values.impactLevel === "medium"
              ? 60
              : 35,
      metadata: {
        ...((detail.metadata as Record<string, unknown> | null) ?? {}),
        category: values.category,
        impact_level: values.impactLevel,
        sentiment: values.sentiment,
      },
      published_at: publishedAt,
      status: values.status,
      summary: values.summary,
      title: values.title,
    })
    .eq("id", values.id);

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoryError } = await supabase
    .from("presidential_action_categories")
    .upsert(
      {
        presidential_action_id: values.id,
        category_id: categoryId,
      },
      {
        onConflict: "presidential_action_id,category_id",
        ignoreDuplicates: true,
      },
    );

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const { data: sentimentRow, error: sentimentReadError } = await supabase
    .from("sentiment_analysis")
    .select("id")
    .eq("target_type", "presidential_action")
    .eq("presidential_action_id", values.id)
    .maybeSingle();

  if (sentimentReadError) {
    throw new Error(sentimentReadError.message);
  }

  const sentimentPayload = {
    analysis_payload: {
      category: values.category,
      impact_level: values.impactLevel,
      moderated: true,
    },
    confidence: typeof detail.confidence === "number" ? detail.confidence : 0.5,
    keywords: [values.category],
    model_name: detail.provider ?? "manual-moderation",
    presidential_action_id: values.id,
    sentiment: values.sentiment,
    target_type: "presidential_action",
  };

  if (sentimentRow?.id) {
    const { error: sentimentError } = await supabase
      .from("sentiment_analysis")
      .update(sentimentPayload)
      .eq("id", sentimentRow.id);

    if (sentimentError) {
      throw new Error(sentimentError.message);
    }

    return;
  }

  const { error: sentimentInsertError } = await supabase
    .from("sentiment_analysis")
    .insert(sentimentPayload);

  if (sentimentInsertError) {
    throw new Error(sentimentInsertError.message);
  }
}

export async function setPresidentialActionPublishState(
  id: string,
  nextStatus: "draft" | "published",
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("presidential_actions")
    .update({
      published_at:
        nextStatus === "published" ? new Date().toISOString() : null,
      status: nextStatus,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
