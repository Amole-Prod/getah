import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ArticleActionAnalysis,
  NewsArticleForAnalysis,
} from "@/features/presidential-actions-ai/types";
import { createStableSlug } from "@/features/news-ingestion/utils";

function categorySlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function mapImpactScore(level: ArticleActionAnalysis["impactLevel"]) {
  switch (level) {
    case "critical":
      return 95;
    case "high":
      return 80;
    case "medium":
      return 60;
    case "low":
    default:
      return 35;
  }
}

export async function listNewsArticlesForActionAnalysis(limit = 20) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("news_items")
    .select(
      "id, source_id, headline, summary, excerpt, content_text, canonical_url, published_at, metadata",
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NewsArticleForAnalysis[]).filter((item) => {
    const metadata = item.metadata ?? {};
    const aiProcessing =
      typeof metadata === "object" && metadata !== null
        ? (metadata.ai_processing as Record<string, unknown> | undefined)
        : undefined;

    return aiProcessing?.presidential_action_detection !== "completed";
  });
}

export async function markArticleActionAnalysisStatus(
  articleId: string,
  provider: string,
  status: "completed" | "failed",
  confidence: number,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("metadata")
    .eq("id", articleId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const metadata = (data?.metadata as Record<string, unknown> | null) ?? {};
  const aiProcessing =
    typeof metadata.ai_processing === "object" &&
    metadata.ai_processing !== null
      ? (metadata.ai_processing as Record<string, unknown>)
      : {};

  const { error: updateError } = await supabase
    .from("news_items")
    .update({
      metadata: {
        ...metadata,
        ai_processing: {
          ...aiProcessing,
          presidential_action_detection: status,
          presidential_action_provider: provider,
          presidential_action_confidence: confidence,
        },
      },
    })
    .eq("id", articleId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function ensureCategory(name: string) {
  const supabase = createSupabaseAdminClient();
  const slug = categorySlug(name) || "pemerintahan";
  const { data: existing, error: existingError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description: `AI generated category for ${name}`,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function upsertPresidentialActionFromArticle(
  article: NewsArticleForAnalysis,
  analysis: ArticleActionAnalysis,
  provider: string,
) {
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("presidential_actions")
    .select("id")
    .eq("primary_news_item_id", article.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const payload = {
    action_date: analysis.actionDate,
    ai_summary: {
      confidence: analysis.confidence,
      provider,
      reasoning: analysis.reasoning,
      sentiment: analysis.sentiment,
    },
    description: article.content_text,
    impact_score: mapImpactScore(analysis.impactLevel),
    metadata: {
      category: analysis.category,
      confidence: analysis.confidence,
      impact_level: analysis.impactLevel,
      related_news_url: article.canonical_url,
      sentiment: analysis.sentiment,
    },
    primary_news_item_id: article.id,
    published_at: article.published_at,
    slug: createStableSlug(analysis.title, article.canonical_url),
    source_id: article.source_id,
    status: article.published_at ? "published" : "draft",
    summary: analysis.summary,
    title: analysis.title,
  };

  let actionId: string;

  if (existing?.id) {
    const { error } = await supabase
      .from("presidential_actions")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    actionId = existing.id as string;
  } else {
    const { data, error } = await supabase
      .from("presidential_actions")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    actionId = data.id as string;
  }

  return actionId;
}

export async function attachCategoryToAction(
  actionId: string,
  categoryId: string,
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("presidential_action_categories")
    .upsert(
      {
        presidential_action_id: actionId,
        category_id: categoryId,
      },
      {
        onConflict: "presidential_action_id,category_id",
        ignoreDuplicates: true,
      },
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertActionSentiment(
  actionId: string,
  analysis: ArticleActionAnalysis,
  provider: string,
) {
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("sentiment_analysis")
    .select("id")
    .eq("target_type", "presidential_action")
    .eq("presidential_action_id", actionId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const payload = {
    analysis_payload: {
      category: analysis.category,
      impact_level: analysis.impactLevel,
      reasoning: analysis.reasoning,
    },
    confidence: analysis.confidence,
    input_text_hash: createStableSlug(
      analysis.title,
      `${actionId}:${provider}`,
    ),
    keywords: [analysis.category],
    model_name: provider,
    presidential_action_id: actionId,
    sentiment: analysis.sentiment,
    target_type: "presidential_action",
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
