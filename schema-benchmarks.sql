-- =============================================================================
-- CAIRN — CfE Benchmarks Extension (additive migration)
-- =============================================================================
-- Run this AFTER schema.sql and cfe-seed.sql.
-- This file is safe to run more than once.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Benchmarks table (official Education Scotland benchmark statements)
-- -----------------------------------------------------------------------------

create table if not exists public.cfe_benchmarks (
  id uuid primary key default gen_random_uuid(),
  benchmark_key text unique not null,
  curriculum_area text not null,
  level text not null,
  organiser text,
  benchmark_text text not null,
  -- Optional list of E&O reference codes found during ingestion, e.g. {"LIT 2-10a"}
  related_outcome_codes text[] not null default '{}',
  source_document text not null,
  source_url text not null,
  source_page integer,
  source_published_on date,
  keywords text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  checksum text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cfe_benchmarks_area_level
  on public.cfe_benchmarks(curriculum_area, level);
create index if not exists idx_cfe_benchmarks_source_document
  on public.cfe_benchmarks(source_document);

-- -----------------------------------------------------------------------------
-- Join table: outcomes <-> benchmarks (many to many)
-- -----------------------------------------------------------------------------

create table if not exists public.cfe_outcome_benchmark_links (
  id uuid primary key default gen_random_uuid(),
  cfe_outcome_id uuid not null references public.cfe_outcomes(id) on delete cascade,
  cfe_benchmark_id uuid not null references public.cfe_benchmarks(id) on delete cascade,
  link_source text not null default 'manual'
    check (link_source in ('manual', 'parser', 'ai_assisted')),
  confidence text
    check (confidence in ('strong', 'good', 'possible') or confidence is null),
  link_reason text,
  created_at timestamptz not null default now(),
  unique (cfe_outcome_id, cfe_benchmark_id)
);

create index if not exists idx_cfe_ob_links_outcome
  on public.cfe_outcome_benchmark_links(cfe_outcome_id);
create index if not exists idx_cfe_ob_links_benchmark
  on public.cfe_outcome_benchmark_links(cfe_benchmark_id);

-- -----------------------------------------------------------------------------
-- Optional helper: auto-link where ingestion captured outcome codes
-- -----------------------------------------------------------------------------

create or replace function public.link_benchmarks_from_related_codes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
begin
  with links_to_insert as (
    select
      o.id as cfe_outcome_id,
      b.id as cfe_benchmark_id
    from public.cfe_benchmarks b
    cross join lateral unnest(coalesce(b.related_outcome_codes, '{}')) as code(reference_code)
    join public.cfe_outcomes o
      on upper(trim(o.reference_code)) = upper(trim(code.reference_code))
  ),
  ins as (
    insert into public.cfe_outcome_benchmark_links (
      cfe_outcome_id,
      cfe_benchmark_id,
      link_source,
      confidence,
      link_reason
    )
    select
      lti.cfe_outcome_id,
      lti.cfe_benchmark_id,
      'parser',
      'good',
      'Linked from related_outcome_codes during ingestion'
    from links_to_insert lti
    on conflict (cfe_outcome_id, cfe_benchmark_id) do nothing
    returning 1
  )
  select count(*) into inserted_count from ins;

  return inserted_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_touch_cfe_benchmarks on public.cfe_benchmarks;
create trigger trigger_touch_cfe_benchmarks
before update on public.cfe_benchmarks
for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.cfe_benchmarks enable row level security;
alter table public.cfe_outcome_benchmark_links enable row level security;

-- Read access for all authenticated users (teachers/parents/students)
drop policy if exists cfe_benchmarks_select_authenticated on public.cfe_benchmarks;
create policy cfe_benchmarks_select_authenticated
on public.cfe_benchmarks
for select
to authenticated
using (true);

drop policy if exists cfe_outcome_benchmark_links_select_authenticated on public.cfe_outcome_benchmark_links;
create policy cfe_outcome_benchmark_links_select_authenticated
on public.cfe_outcome_benchmark_links
for select
to authenticated
using (true);

-- No insert/update/delete policies on benchmark tables for authenticated users.
-- Ingestion should run using service role credentials from the backend only.

