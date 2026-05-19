import type {
  ActiveSource,
  NormalizedNewsItem,
  ScrapedArticleCandidate,
} from "@/features/news-ingestion/types";
import {
  createContentHash,
  createStableSlug,
  normalizeArticleUrl,
  stripHtml,
  truncateText,
} from "@/features/news-ingestion/utils";

export function normalizeArticle(
  source: ActiveSource,
  candidate: ScrapedArticleCandidate,
): NormalizedNewsItem {
  const canonicalUrl = normalizeArticleUrl(
    candidate.canonicalUrl,
    source.base_url,
  );
  const contentText =
    candidate.contentText?.trim() ??
    (candidate.contentHtml ? stripHtml(candidate.contentHtml) : null);
  const summary =
    candidate.summary?.trim() ??
    truncateText(contentText, 280) ??
    candidate.headline;
  const excerpt = candidate.excerpt?.trim() ?? truncateText(contentText, 180);
  const publishedAt = candidate.publishedAt
    ? new Date(candidate.publishedAt).toISOString()
    : null;
  const contentHash = createContentHash(
    `${canonicalUrl}|${candidate.headline}|${contentText ?? ""}`,
  );

  return {
    author_name: candidate.authorName?.trim() ?? null,
    canonical_url: canonicalUrl,
    content_hash: contentHash,
    content_raw: candidate.contentHtml?.trim() ?? null,
    content_text: contentText,
    excerpt,
    headline: candidate.headline.trim(),
    image_url: candidate.imageUrl ?? null,
    language_code: source.language_code,
    metadata: {
      ai_processing: {
        entity_extraction: "pending",
        sentiment_analysis: "pending",
        summarization: "pending",
      },
      ingestion: {
        parser: candidate.parser,
        source_name: source.name,
      },
      ...(candidate.metadata ?? {}),
    },
    published_at: publishedAt,
    scrape_payload: {
      parser: candidate.parser,
      source_slug: source.slug,
      fetched_at: new Date().toISOString(),
    },
    slug: createStableSlug(candidate.headline, canonicalUrl),
    source_external_id: candidate.sourceExternalId ?? null,
    source_id: source.id,
    status: publishedAt ? "published" : "draft",
    summary,
  };
}
