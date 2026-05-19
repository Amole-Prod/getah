create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'editor', 'analyst', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'publication_status') then
    create type public.publication_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'source_type') then
    create type public.source_type as enum ('news_portal', 'government', 'social_media', 'television', 'radio', 'print', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'analysis_target') then
    create type public.analysis_target as enum ('news_item', 'presidential_action', 'weekly_report');
  end if;

  if not exists (select 1 from pg_type where typname = 'sentiment_label') then
    create type public.sentiment_label as enum ('positive', 'neutral', 'negative', 'mixed');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'viewer',
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, last_sign_in_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('admin', 'editor', 'analyst')
      and is_active = true
  );
$$;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  source_type public.source_type not null default 'news_portal',
  base_url text,
  feed_url text,
  language_code text not null default 'id',
  country_code text,
  credibility_score numeric(5,2),
  scrape_config jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_scraped_at timestamptz,
  created_by uuid references public.users (id) on delete set null,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sources_name_not_blank check (btrim(name) <> ''),
  constraint sources_slug_not_blank check (btrim(slug) <> ''),
  constraint sources_credibility_score_range check (
    credibility_score is null or (credibility_score >= 0 and credibility_score <= 100)
  )
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  keywords text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.users (id) on delete set null,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_not_blank check (btrim(name) <> ''),
  constraint categories_slug_not_blank check (btrim(slug) <> '')
);

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id) on delete restrict,
  slug text not null unique,
  headline text not null,
  summary text,
  excerpt text,
  content_raw text,
  content_text text,
  canonical_url text not null unique,
  image_url text,
  author_name text,
  source_external_id text,
  content_hash text,
  language_code text not null default 'id',
  region_code text,
  metadata jsonb not null default '{}'::jsonb,
  scrape_payload jsonb not null default '{}'::jsonb,
  ai_topics text[] not null default '{}',
  ai_entities jsonb not null default '[]'::jsonb,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  scraped_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.users (id) on delete set null,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint news_items_slug_not_blank check (btrim(slug) <> ''),
  constraint news_items_headline_not_blank check (btrim(headline) <> ''),
  constraint news_items_url_not_blank check (btrim(canonical_url) <> ''),
  constraint news_items_published_at_check check (
    status <> 'published' or published_at is not null
  )
);

create table if not exists public.presidential_actions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources (id) on delete set null,
  primary_news_item_id uuid references public.news_items (id) on delete set null,
  slug text not null unique,
  title text not null,
  summary text,
  description text,
  action_date date,
  impact_score numeric(5,2),
  status public.publication_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  ai_summary jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references public.users (id) on delete set null,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint presidential_actions_slug_not_blank check (btrim(slug) <> ''),
  constraint presidential_actions_title_not_blank check (btrim(title) <> ''),
  constraint presidential_actions_impact_score_range check (
    impact_score is null or (impact_score >= 0 and impact_score <= 100)
  ),
  constraint presidential_actions_published_at_check check (
    status <> 'published' or published_at is not null
  )
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  report_week_start date not null,
  report_week_end date not null,
  executive_summary text,
  key_findings jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  source_snapshot jsonb not null default '{}'::jsonb,
  generated_by text,
  generation_model text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.users (id) on delete set null,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint weekly_reports_slug_not_blank check (btrim(slug) <> ''),
  constraint weekly_reports_title_not_blank check (btrim(title) <> ''),
  constraint weekly_reports_valid_range check (report_week_start <= report_week_end),
  constraint weekly_reports_published_at_check check (
    status <> 'published' or published_at is not null
  ),
  constraint weekly_reports_unique_window unique (report_week_start, report_week_end)
);

create table if not exists public.sentiment_analysis (
  id uuid primary key default gen_random_uuid(),
  target_type public.analysis_target not null,
  news_item_id uuid references public.news_items (id) on delete cascade,
  presidential_action_id uuid references public.presidential_actions (id) on delete cascade,
  weekly_report_id uuid references public.weekly_reports (id) on delete cascade,
  sentiment public.sentiment_label not null,
  confidence numeric(5,4),
  model_name text not null,
  model_version text,
  prompt_version text,
  input_text_hash text,
  keywords text[] not null default '{}',
  entities jsonb not null default '[]'::jsonb,
  aspect_scores jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  analyzed_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sentiment_analysis_target_check check (
    (
      target_type = 'news_item'
      and news_item_id is not null
      and presidential_action_id is null
      and weekly_report_id is null
    )
    or (
      target_type = 'presidential_action'
      and news_item_id is null
      and presidential_action_id is not null
      and weekly_report_id is null
    )
    or (
      target_type = 'weekly_report'
      and news_item_id is null
      and presidential_action_id is null
      and weekly_report_id is not null
    )
  ),
  constraint sentiment_analysis_confidence_range check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  )
);

create table if not exists public.news_item_categories (
  news_item_id uuid not null references public.news_items (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (news_item_id, category_id)
);

create table if not exists public.presidential_action_categories (
  presidential_action_id uuid not null references public.presidential_actions (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (presidential_action_id, category_id)
);

create table if not exists public.weekly_report_news_items (
  weekly_report_id uuid not null references public.weekly_reports (id) on delete cascade,
  news_item_id uuid not null references public.news_items (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (weekly_report_id, news_item_id)
);

create index if not exists idx_users_role on public.users (role);

create index if not exists idx_sources_source_type on public.sources (source_type);
create index if not exists idx_sources_is_active on public.sources (is_active);
create index if not exists idx_sources_last_scraped_at on public.sources (last_scraped_at desc nulls last);

create index if not exists idx_categories_parent_id on public.categories (parent_id);
create index if not exists idx_categories_is_active on public.categories (is_active);

create index if not exists idx_news_items_source_id on public.news_items (source_id);
create index if not exists idx_news_items_status_published_at on public.news_items (status, published_at desc nulls last);
create index if not exists idx_news_items_scraped_at on public.news_items (scraped_at desc);
create index if not exists idx_news_items_source_external_id on public.news_items (source_external_id);
create index if not exists idx_news_items_content_hash on public.news_items (content_hash);
create index if not exists idx_news_items_ai_topics on public.news_items using gin (ai_topics);
create index if not exists idx_news_items_metadata on public.news_items using gin (metadata);

create index if not exists idx_presidential_actions_source_id on public.presidential_actions (source_id);
create index if not exists idx_presidential_actions_primary_news_item_id on public.presidential_actions (primary_news_item_id);
create index if not exists idx_presidential_actions_status_published_at on public.presidential_actions (status, published_at desc nulls last);
create index if not exists idx_presidential_actions_action_date on public.presidential_actions (action_date desc nulls last);
create index if not exists idx_presidential_actions_metadata on public.presidential_actions using gin (metadata);

create index if not exists idx_weekly_reports_status_published_at on public.weekly_reports (status, published_at desc nulls last);
create index if not exists idx_weekly_reports_window on public.weekly_reports (report_week_start desc, report_week_end desc);
create index if not exists idx_weekly_reports_metrics on public.weekly_reports using gin (metrics);

create index if not exists idx_sentiment_analysis_target_type on public.sentiment_analysis (target_type);
create index if not exists idx_sentiment_analysis_news_item_id on public.sentiment_analysis (news_item_id) where news_item_id is not null;
create index if not exists idx_sentiment_analysis_presidential_action_id on public.sentiment_analysis (presidential_action_id) where presidential_action_id is not null;
create index if not exists idx_sentiment_analysis_weekly_report_id on public.sentiment_analysis (weekly_report_id) where weekly_report_id is not null;
create index if not exists idx_sentiment_analysis_model_name on public.sentiment_analysis (model_name);
create index if not exists idx_sentiment_analysis_analyzed_at on public.sentiment_analysis (analyzed_at desc);
create index if not exists idx_sentiment_analysis_keywords on public.sentiment_analysis using gin (keywords);
create index if not exists idx_sentiment_analysis_aspect_scores on public.sentiment_analysis using gin (aspect_scores);

create index if not exists idx_news_item_categories_category_id on public.news_item_categories (category_id);
create index if not exists idx_presidential_action_categories_category_id on public.presidential_action_categories (category_id);
create index if not exists idx_weekly_report_news_items_news_item_id on public.weekly_report_news_items (news_item_id);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists set_sources_updated_at on public.sources;
create trigger set_sources_updated_at
before update on public.sources
for each row
execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_news_items_updated_at on public.news_items;
create trigger set_news_items_updated_at
before update on public.news_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_presidential_actions_updated_at on public.presidential_actions;
create trigger set_presidential_actions_updated_at
before update on public.presidential_actions
for each row
execute function public.set_updated_at();

drop trigger if exists set_weekly_reports_updated_at on public.weekly_reports;
create trigger set_weekly_reports_updated_at
before update on public.weekly_reports
for each row
execute function public.set_updated_at();

drop trigger if exists set_sentiment_analysis_updated_at on public.sentiment_analysis;
create trigger set_sentiment_analysis_updated_at
before update on public.sentiment_analysis
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.sources enable row level security;
alter table public.categories enable row level security;
alter table public.news_items enable row level security;
alter table public.presidential_actions enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.sentiment_analysis enable row level security;
alter table public.news_item_categories enable row level security;
alter table public.presidential_action_categories enable row level security;
alter table public.weekly_report_news_items enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "users_insert_own_or_admin" on public.users;
create policy "users_insert_own_or_admin"
on public.users
for insert
with check (
  (auth.uid() = id and role = 'viewer')
  or public.is_admin()
);

drop policy if exists "users_update_admin_only" on public.users;
create policy "users_update_admin_only"
on public.users
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_delete_admin_only" on public.users;
create policy "users_delete_admin_only"
on public.users
for delete
using (public.is_admin());

drop policy if exists "sources_public_read" on public.sources;
create policy "sources_public_read"
on public.sources
for select
using (is_active = true or public.is_staff());

drop policy if exists "sources_staff_manage" on public.sources;
create policy "sources_staff_manage"
on public.sources
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories
for select
using (is_active = true or public.is_staff());

drop policy if exists "categories_staff_manage" on public.categories;
create policy "categories_staff_manage"
on public.categories
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "news_items_public_read" on public.news_items;
create policy "news_items_public_read"
on public.news_items
for select
using (status = 'published' or public.is_staff());

drop policy if exists "news_items_staff_manage" on public.news_items;
create policy "news_items_staff_manage"
on public.news_items
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "presidential_actions_public_read" on public.presidential_actions;
create policy "presidential_actions_public_read"
on public.presidential_actions
for select
using (status = 'published' or public.is_staff());

drop policy if exists "presidential_actions_staff_manage" on public.presidential_actions;
create policy "presidential_actions_staff_manage"
on public.presidential_actions
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "weekly_reports_public_read" on public.weekly_reports;
create policy "weekly_reports_public_read"
on public.weekly_reports
for select
using (status = 'published' or public.is_staff());

drop policy if exists "weekly_reports_staff_manage" on public.weekly_reports;
create policy "weekly_reports_staff_manage"
on public.weekly_reports
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "sentiment_analysis_public_read" on public.sentiment_analysis;
create policy "sentiment_analysis_public_read"
on public.sentiment_analysis
for select
using (public.is_staff());

drop policy if exists "sentiment_analysis_staff_manage" on public.sentiment_analysis;
create policy "sentiment_analysis_staff_manage"
on public.sentiment_analysis
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "news_item_categories_public_read" on public.news_item_categories;
create policy "news_item_categories_public_read"
on public.news_item_categories
for select
using (true);

drop policy if exists "news_item_categories_staff_manage" on public.news_item_categories;
create policy "news_item_categories_staff_manage"
on public.news_item_categories
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "presidential_action_categories_public_read" on public.presidential_action_categories;
create policy "presidential_action_categories_public_read"
on public.presidential_action_categories
for select
using (true);

drop policy if exists "presidential_action_categories_staff_manage" on public.presidential_action_categories;
create policy "presidential_action_categories_staff_manage"
on public.presidential_action_categories
for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "weekly_report_news_items_public_read" on public.weekly_report_news_items;
create policy "weekly_report_news_items_public_read"
on public.weekly_report_news_items
for select
using (true);

drop policy if exists "weekly_report_news_items_staff_manage" on public.weekly_report_news_items;
create policy "weekly_report_news_items_staff_manage"
on public.weekly_report_news_items
for all
using (public.is_staff())
with check (public.is_staff());
