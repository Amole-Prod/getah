import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SOURCE_PAGE_SIZE } from "@/features/sources/constants";
import type { SourceFormValues, SourceRecord } from "@/features/sources/types";

function slugifySourceName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function ensureUniqueSlug(name: string, currentId?: string) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = slugifySourceName(name) || "source";
  const { data, error } = await supabase
    .from("sources")
    .select("id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(error.message);
  }

  const usedSlugs = new Set(
    (data ?? [])
      .filter((item) => item.id !== currentId)
      .map((item) => item.slug as string),
  );

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export async function listSources({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const supabase = await createSupabaseServerClient();
  const from = (page - 1) * SOURCE_PAGE_SIZE;
  const to = from + SOURCE_PAGE_SIZE - 1;
  let request = supabase
    .from("sources")
    .select("id, name, base_url, source_type, is_active, updated_at", {
      count: "exact",
    })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`name.ilike.%${query}%,base_url.ilike.%${query}%`);
  }

  const { data, count, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data ?? []) as SourceRecord[],
    total: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / SOURCE_PAGE_SIZE)),
  };
}

export async function getSourceById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sources")
    .select("id, name, base_url, source_type, is_active")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createSource(values: SourceFormValues, userId: string) {
  const supabase = await createSupabaseServerClient();
  const slug = await ensureUniqueSlug(values.name);
  const { error } = await supabase.from("sources").insert({
    name: values.name,
    slug,
    base_url: values.url,
    source_type: values.type,
    is_active: values.isActive,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSource(values: SourceFormValues, userId: string) {
  const supabase = await createSupabaseServerClient();
  const slug = await ensureUniqueSlug(values.name, values.id);
  const { error } = await supabase
    .from("sources")
    .update({
      name: values.name,
      slug,
      base_url: values.url,
      source_type: values.type,
      is_active: values.isActive,
      updated_by: userId,
    })
    .eq("id", values.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeSource(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("sources").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
