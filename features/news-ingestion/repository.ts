import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ActiveSource,
  NormalizedNewsItem,
} from "@/features/news-ingestion/types";

export async function listActiveSources() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sources")
    .select("id, name, slug, source_type, base_url, feed_url, language_code")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ActiveSource[];
}

export async function findExistingArticleUrls(urls: string[]) {
  if (!urls.length) {
    return new Set<string>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("canonical_url")
    .in("canonical_url", urls);

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((item) => item.canonical_url as string));
}

export async function insertNewsItems(items: NormalizedNewsItem[]) {
  if (!items.length) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("news_items").insert(items);

  if (error) {
    throw new Error(error.message);
  }
}
