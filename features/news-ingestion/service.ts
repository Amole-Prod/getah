import "server-only";

import { logger } from "@/lib/logging/logger";
import { fetchArticlesFromHtml } from "@/features/news-ingestion/html-fetcher";
import { normalizeArticle } from "@/features/news-ingestion/normalizer";
import {
  findExistingArticleUrls,
  insertNewsItems,
  listActiveSources,
} from "@/features/news-ingestion/repository";
import { fetchArticlesFromRss } from "@/features/news-ingestion/rss-fetcher";
import type {
  ActiveSource,
  IngestionRunSummary,
  IngestionFetcher,
  ScrapedArticleCandidate,
  SourceIngestionResult,
} from "@/features/news-ingestion/types";

const fetchers: IngestionFetcher[] = [
  fetchArticlesFromRss,
  fetchArticlesFromHtml,
];

function dedupeCandidates(candidates: ScrapedArticleCandidate[]) {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    if (seen.has(candidate.canonicalUrl)) {
      return false;
    }

    seen.add(candidate.canonicalUrl);
    return true;
  });
}

async function ingestSource(
  source: ActiveSource,
): Promise<SourceIngestionResult> {
  const errors: string[] = [];
  const collected: ScrapedArticleCandidate[] = [];

  for (const fetcher of fetchers) {
    try {
      const candidates = await fetcher(source);
      collected.push(...candidates);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown scraper error";
      errors.push(message);
      logger.warn("Source ingestion fetcher failed", {
        message,
        sourceId: source.id,
        sourceName: source.name,
      });
    }
  }

  const uniqueCandidates = dedupeCandidates(collected);
  const normalizedItems = uniqueCandidates.map((candidate) =>
    normalizeArticle(source, candidate),
  );
  const existingUrls = await findExistingArticleUrls(
    normalizedItems.map((item) => item.canonical_url),
  );
  const newItems = normalizedItems.filter(
    (item) => !existingUrls.has(item.canonical_url),
  );

  await insertNewsItems(newItems);

  const result = {
    articlesSaved: newItems.length,
    duplicatesSkipped: normalizedItems.length - newItems.length,
    errors,
    sourceId: source.id,
    sourceName: source.name,
  } satisfies SourceIngestionResult;

  logger.info("Source ingestion completed", result);

  return result;
}

export async function ingestActiveSources(): Promise<IngestionRunSummary> {
  const sources = await listActiveSources();

  logger.info("News ingestion run started", { sourceCount: sources.length });

  const sourceResults = await Promise.all(
    sources.map(async (source) => {
      try {
        return await ingestSource(source);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unexpected ingestion failure";

        logger.error("Source ingestion failed", {
          message,
          sourceId: source.id,
          sourceName: source.name,
        });

        return {
          articlesSaved: 0,
          duplicatesSkipped: 0,
          errors: [message],
          sourceId: source.id,
          sourceName: source.name,
        } satisfies SourceIngestionResult;
      }
    }),
  );

  const summary = {
    articlesSaved: sourceResults.reduce(
      (sum, item) => sum + item.articlesSaved,
      0,
    ),
    duplicatesSkipped: sourceResults.reduce(
      (sum, item) => sum + item.duplicatesSkipped,
      0,
    ),
    errors: sourceResults.flatMap((item) => item.errors),
    sourceCount: sources.length,
    sources: sourceResults,
  } satisfies IngestionRunSummary;

  logger.info("News ingestion run finished", summary);

  return summary;
}
