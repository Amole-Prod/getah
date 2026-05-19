import Parser from "rss-parser";

import type {
  ActiveSource,
  ScrapedArticleCandidate,
} from "@/features/news-ingestion/types";
import {
  absoluteUrl,
  normalizeArticleUrl,
} from "@/features/news-ingestion/utils";

type RssItem = Parser.Item & {
  author?: string;
  id?: string;
  mediaContent?: Array<{ $?: { url?: string } }>;
  "content:encoded"?: string;
};

const parser = new Parser({
  customFields: {
    item: [["media:content", "mediaContent", { keepArray: true }]],
  },
});

const COMMON_FEED_PATHS = [
  "/feed",
  "/rss",
  "/rss.xml",
  "/feed.xml",
  "/atom.xml",
];

function resolveFeedCandidates(source: ActiveSource) {
  const candidates = new Set<string>();

  if (source.feed_url) {
    candidates.add(source.feed_url);
  }

  if (source.base_url) {
    candidates.add(source.base_url);

    for (const path of COMMON_FEED_PATHS) {
      candidates.add(new URL(path, source.base_url).toString());
    }
  }

  return Array.from(candidates);
}

export async function fetchArticlesFromRss(source: ActiveSource) {
  const candidates = resolveFeedCandidates(source);

  for (const candidate of candidates) {
    try {
      const feed = await parser.parseURL(candidate);
      const articles = (feed.items ?? [])
        .slice(0, 12)
        .map((rawItem): ScrapedArticleCandidate | null => {
          const item = rawItem as RssItem;
          const rawLink = item.link ?? item.guid ?? item.id;

          if (!rawLink || !item.title) {
            return null;
          }

          const canonicalUrl = normalizeArticleUrl(rawLink, source.base_url);
          const mediaUrl = Array.isArray(item.mediaContent)
            ? absoluteUrl(item.mediaContent[0]?.$?.url, source.base_url)
            : null;

          return {
            authorName: item.creator ?? item.author ?? null,
            canonicalUrl,
            contentHtml:
              (typeof item["content:encoded"] === "string"
                ? item["content:encoded"]
                : null) ??
              item.content ??
              null,
            contentText: item.contentSnippet ?? null,
            excerpt: item.contentSnippet ?? item.content ?? null,
            headline: item.title,
            imageUrl:
              mediaUrl ?? absoluteUrl(item.enclosure?.url, source.base_url),
            metadata: {
              feedTitle: feed.title,
              sourceCandidate: candidate,
            },
            parser: "rss",
            publishedAt: item.isoDate ?? item.pubDate ?? null,
            sourceExternalId: item.guid ?? item.id ?? null,
            summary: item.contentSnippet ?? item.content ?? null,
          };
        })
        .filter((item): item is ScrapedArticleCandidate => item !== null);

      if (articles.length) {
        return articles;
      }
    } catch {
      continue;
    }
  }

  return [];
}
