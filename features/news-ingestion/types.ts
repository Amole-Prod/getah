import type { SourceType } from "@/features/sources/schemas";

export type ActiveSource = {
  id: string;
  name: string;
  slug: string;
  source_type: SourceType;
  base_url: string | null;
  feed_url: string | null;
  language_code: string;
};

export type ScrapedArticleCandidate = {
  authorName?: string | null;
  canonicalUrl: string;
  contentHtml?: string | null;
  contentText?: string | null;
  excerpt?: string | null;
  headline: string;
  imageUrl?: string | null;
  metadata?: Record<string, unknown>;
  parser: "rss" | "html";
  publishedAt?: string | null;
  sourceExternalId?: string | null;
  summary?: string | null;
};

export type NormalizedNewsItem = {
  author_name: string | null;
  canonical_url: string;
  content_hash: string;
  content_raw: string | null;
  content_text: string | null;
  excerpt: string | null;
  headline: string;
  image_url: string | null;
  language_code: string;
  metadata: Record<string, unknown>;
  published_at: string | null;
  scrape_payload: Record<string, unknown>;
  slug: string;
  source_external_id: string | null;
  source_id: string;
  status: "draft" | "published";
  summary: string | null;
};

export type SourceIngestionResult = {
  articlesSaved: number;
  duplicatesSkipped: number;
  errors: string[];
  sourceId: string;
  sourceName: string;
};

export type IngestionRunSummary = {
  articlesSaved: number;
  duplicatesSkipped: number;
  errors: string[];
  sourceCount: number;
  sources: SourceIngestionResult[];
};

export type IngestionFetcher = (
  source: ActiveSource,
) => Promise<ScrapedArticleCandidate[]>;
