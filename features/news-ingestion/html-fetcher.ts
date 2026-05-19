import { load } from "cheerio";

import type {
  ActiveSource,
  ScrapedArticleCandidate,
} from "@/features/news-ingestion/types";
import {
  absoluteUrl,
  fetchText,
  normalizeArticleUrl,
  stripHtml,
  truncateText,
} from "@/features/news-ingestion/utils";

const ARTICLE_LIMIT = 6;

function collectArticleLinks(html: string, baseUrl: string) {
  const $ = load(html);
  const links = new Set<string>();

  $("article a[href], main a[href], h1 a[href], h2 a[href], h3 a[href]").each(
    (_, element) => {
      const href = $(element).attr("href");
      const absolute = absoluteUrl(href, baseUrl);

      if (!absolute) {
        return;
      }

      const normalized = normalizeArticleUrl(absolute, baseUrl);
      const absoluteObject = new URL(normalized);
      const baseObject = new URL(baseUrl);

      if (absoluteObject.origin !== baseObject.origin) {
        return;
      }

      if (
        absoluteObject.pathname.length < 5 ||
        absoluteObject.pathname === "/"
      ) {
        return;
      }

      links.add(normalized);
    },
  );

  return Array.from(links).slice(0, ARTICLE_LIMIT);
}

async function parseArticlePage(
  url: string,
  source: ActiveSource,
): Promise<ScrapedArticleCandidate | null> {
  const html = await fetchText(url);
  const $ = load(html);
  const canonical =
    absoluteUrl($("link[rel='canonical']").attr("href"), url) ??
    normalizeArticleUrl(url, source.base_url);
  const headline =
    $("meta[property='og:title']").attr("content")?.trim() ??
    $("article h1").first().text().trim() ??
    $("h1").first().text().trim() ??
    $("title").first().text().trim();

  if (!headline) {
    return null;
  }

  const articleHtml =
    $("article").first().html() ?? $("main").first().html() ?? null;
  const articleText = articleHtml
    ? stripHtml(articleHtml)
    : stripHtml($.html());
  const summary =
    $("meta[name='description']").attr("content")?.trim() ??
    $("meta[property='og:description']").attr("content")?.trim() ??
    truncateText(articleText, 280);

  return {
    authorName:
      $("meta[name='author']").attr("content")?.trim() ??
      $("[rel='author']").first().text().trim() ??
      null,
    canonicalUrl: canonical,
    contentHtml: articleHtml,
    contentText: articleText,
    excerpt: truncateText(articleText, 180),
    headline,
    imageUrl:
      absoluteUrl($("meta[property='og:image']").attr("content"), url) ?? null,
    metadata: {
      sourceCandidate: source.base_url,
      scrapedFrom: url,
    },
    parser: "html" as const,
    publishedAt:
      $("meta[property='article:published_time']").attr("content") ??
      $("time").first().attr("datetime") ??
      null,
    sourceExternalId: canonical,
    summary,
  } satisfies ScrapedArticleCandidate;
}

export async function fetchArticlesFromHtml(source: ActiveSource) {
  if (!source.base_url) {
    return [];
  }

  const homeHtml = await fetchText(source.base_url);
  const links = collectArticleLinks(homeHtml, source.base_url);
  const articles = await Promise.all(
    links.map(async (link) => {
      try {
        return await parseArticlePage(link, source);
      } catch {
        return null;
      }
    }),
  );

  return articles.filter((article) => article !== null);
}
