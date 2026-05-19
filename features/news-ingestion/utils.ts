import crypto from "node:crypto";

export function normalizeArticleUrl(
  rawUrl: string,
  fallbackBaseUrl?: string | null,
) {
  const url = fallbackBaseUrl
    ? new URL(rawUrl, fallbackBaseUrl)
    : new URL(rawUrl);

  url.hash = "";
  for (const key of Array.from(url.searchParams.keys())) {
    if (
      key.startsWith("utm_") ||
      ["fbclid", "gclid", "ref", "source"].includes(key)
    ) {
      url.searchParams.delete(key);
    }
  }

  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  return `${url.origin}${pathname}${url.search}`;
}

export function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(value: string | null | undefined, length: number) {
  if (!value) {
    return null;
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, Math.max(0, length - 1)).trimEnd()}...`;
}

export function createContentHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createStableSlug(headline: string, canonicalUrl: string) {
  const base = headline
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = createContentHash(canonicalUrl).slice(0, 10);

  return `${base || "news-item"}-${suffix}`;
}

export function absoluteUrl(
  value: string | undefined | null,
  baseUrl?: string | null,
) {
  if (!value) {
    return null;
  }

  try {
    return baseUrl
      ? new URL(value, baseUrl).toString()
      : new URL(value).toString();
  } catch {
    return null;
  }
}

export async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "GetahBot/1.0 (+https://getah.vercel.app)",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,application/rss+xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  return response.text();
}
