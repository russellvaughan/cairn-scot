-- =============================================================================
-- CAIRN — Core database schema (PostgreSQL / Supabase)
-- =============================================================================
-- Run this first in Supabase SQL Editor, then run cfe-seed.sql
-- =============================================================================

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  local_authority text,
  urn text unique,
  ai_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('teacher', 'parent', 'admin')),
  school_id uuid references public.schools(id),
  ai_enabled_override boolean default null,
  created_at timestamptz not null default now(),
  last_active_at timestamptz
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  year_group text not null,
  academic_year text not null,
  teacher_id uuid references public.users(id)
);

create table if not exists public.pupils (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  first_name text not null,
  last_name text not null,
  year_group text not null,
  current_level text check (current_level in ('early', 'first', 'second', 'third_fourth', 'senior')),
  level_confirmed boolean not null default false,
  date_of_birth date,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_pupil_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  pupil_id uuid not null references public.pupils(id) on delete cascade,
  verified boolean not null default false,
  linked_at timestamptz not null default now(),
  unique(parent_id, pupil_id)
);

create table if not exists public.cfe_outcomes (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null,
  curriculum_area text not null,
  level text not null,
  outcome_text text not null,
  capacity_tags text[] default '{}',
  keywords text[] default '{}'
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  pupil_id uuid not null references public.pupils(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  logged_by uuid references public.users(id),
  submitted_by uuid references public.users(id),
  source text not null check (source in ('school', 'outside_school')),
  description text not null,
  parent_category text,
  cfe_outcome_id uuid references public.cfe_outcomes(id),
  curriculum_area text,
  cfe_level text,
  ai_suggested boolean not null default false,
  ai_confidence text check (ai_confidence in ('strong', 'good', 'possible') or ai_confidence is null),
  status text not null default 'active' check (status in ('active', 'pending_review', 'declined')),
  declined_reason text,
  achievement_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.achievement_media (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete cascade,
  storage_bucket text not null default 'achievement-media',
  storage_path text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 262144000),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds numeric(8, 2) check (duration_seconds is null or duration_seconds >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_users_school_id on public.users(school_id);
create index if not exists idx_users_role on public.users(role);

create index if not exists idx_classes_school_id on public.classes(school_id);
create index if not exists idx_classes_teacher_id on public.classes(teacher_id);

create index if not exists idx_pupils_school_id on public.pupils(school_id);
create index if not exists idx_pupils_class_id on public.pupils(class_id);
create index if not exists idx_pupils_level on public.pupils(current_level);
create index if not exists idx_pupils_year_group on public.pupils(year_group);

create index if not exists idx_parent_pupil_links_parent_id on public.parent_pupil_links(parent_id);
create index if not exists idx_parent_pupil_links_pupil_id on public.parent_pupil_links(pupil_id);
create index if not exists idx_parent_pupil_links_verified on public.parent_pupil_links(verified);

create index if not exists idx_cfe_outcomes_area_level on public.cfe_outcomes(curriculum_area, level);
create index if not exists idx_cfe_outcomes_reference_code on public.cfe_outcomes(reference_code);

create index if not exists idx_achievements_pupil_id on public.achievements(pupil_id);
create index if not exists idx_achievements_school_id on public.achievements(school_id);
create index if not exists idx_achievements_status on public.achievements(status);
create index if not exists idx_achievements_created_at on public.achievements(created_at desc);

create index if not exists idx_achievement_media_achievement_id on public.achievement_media(achievement_id);
create index if not exists idx_achievement_media_school_id on public.achievement_media(school_id);
create index if not exists idx_achievement_media_uploaded_by on public.achievement_media(uploaded_by);
create index if not exists idx_achievement_media_created_at on public.achievement_media(created_at desc);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read);

create index if not exists idx_audit_log_user_id on public.audit_log(user_id);
create index if not exists idx_audit_log_resource on public.audit_log(resource_type, resource_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);

-- -----------------------------------------------------------------------------
-- Trigger: automatic default CfE level from year group
-- -----------------------------------------------------------------------------

create or replace function public.set_default_level()
returns trigger
language plpgsql
as $$
begin
  if new.current_level is null then
    new.current_level := case new.year_group
      when 'Nursery' then 'early'
      when 'P1' then 'early'
      when 'P2' then 'first'
      when 'P3' then 'first'
      when 'P4' then 'first'
      when 'P5' then 'second'
      when 'P6' then 'second'
      when 'P7' then 'second'
      when 'S1' then 'third_fourth'
      when 'S2' then 'third_fourth'
      when 'S3' then 'third_fourth'
      when 'S4' then 'senior'
      when 'S5' then 'senior'
      when 'S6' then 'senior'
      else 'second'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_set_default_level on public.pupils;
create trigger trigger_set_default_level
before insert on public.pupils
for each row execute function public.set_default_level();

-- -----------------------------------------------------------------------------
-- Helper functions for RLS
-- -----------------------------------------------------------------------------

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
$$;

create or replace function public.current_user_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.school_id
  from public.users u
  where u.id = auth.uid()
$$;

create or replace function public.parent_has_verified_link(target_pupil_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parent_pupil_links ppl
    where ppl.parent_id = auth.uid()
      and ppl.pupil_id = target_pupil_id
      and ppl.verified = true
  )
$$;

create or replace function public.pupil_in_current_school(target_pupil_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pupils p
    where p.id = target_pupil_id
      and p.school_id = public.current_user_school_id()
  )
$$;

create or replace function public.is_staff_for_school(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_role() in ('teacher', 'admin')
    and public.current_user_school_id() = target_school_id
$$;

create or replace function public.can_access_achievement(target_achievement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.achievements a
    where a.id = target_achievement_id
      and (
        public.is_staff_for_school(a.school_id)
        or (
          public.current_user_role() = 'parent'
          and public.parent_has_verified_link(a.pupil_id)
        )
      )
  )
$$;

create or replace function public.can_upload_to_achievement(target_achievement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.achievements a
    where a.id = target_achievement_id
      and (
        public.is_staff_for_school(a.school_id)
        or (
          public.current_user_role() = 'parent'
          and a.source = 'outside_school'
          and a.submitted_by = auth.uid()
          and public.parent_has_verified_link(a.pupil_id)
        )
      )
  )
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.pupils enable row level security;
alter table public.parent_pupil_links enable row level security;
alter table public.cfe_outcomes enable row level security;
alter table public.achievements enable row level security;
alter table public.achievement_media enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- schools
drop policy if exists schools_select_own on public.schools;
create policy schools_select_own
on public.schools
for select
to authenticated
using (id = public.current_user_school_id());

drop policy if exists schools_update_admin_own on public.schools;
create policy schools_update_admin_own
on public.schools
for update
to authenticated
using (
  public.current_user_role() = 'admin'
  and id = public.current_user_school_id()
)
with check (
  public.current_user_role() = 'admin'
  and id = public.current_user_school_id()
);

-- users
drop policy if exists users_select_self_or_staff_school on public.users;
create policy users_select_self_or_staff_school
on public.users
for select
to authenticated
using (
  id = auth.uid()
  or (
    public.current_user_role() in ('teacher', 'admin')
    and school_id = public.current_user_school_id()
  )
);

drop policy if exists users_insert_self on public.users;
create policy users_insert_self
on public.users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists users_update_admin_same_school on public.users;
create policy users_update_admin_same_school
on public.users
for update
to authenticated
using (
  public.current_user_role() = 'admin'
  and school_id = public.current_user_school_id()
)
with check (
  public.current_user_role() = 'admin'
  and school_id = public.current_user_school_id()
);

-- classes
drop policy if exists classes_select_school_or_linked_parent on public.classes;
create policy classes_select_school_or_linked_parent
on public.classes
for select
to authenticated
using (
  school_id = public.current_user_school_id()
  or exists (
    select 1
    from public.parent_pupil_links ppl
    join public.pupils p on p.id = ppl.pupil_id
    where ppl.parent_id = auth.uid()
      and ppl.verified = true
      and p.class_id = classes.id
  )
);

drop policy if exists classes_insert_staff_same_school on public.classes;
create policy classes_insert_staff_same_school
on public.classes
for insert
to authenticated
with check (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
);

drop policy if exists classes_update_staff_same_school on public.classes;
create policy classes_update_staff_same_school
on public.classes
for update
to authenticated
using (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
)
with check (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
);

drop policy if exists classes_delete_admin_same_school on public.classes;
create policy classes_delete_admin_same_school
on public.classes
for delete
to authenticated
using (
  public.current_user_role() = 'admin'
  and school_id = public.current_user_school_id()
);

-- pupils
drop policy if exists pupils_select_school_or_linked_parent on public.pupils;
create policy pupils_select_school_or_linked_parent
on public.pupils
for select
to authenticated
using (
  school_id = public.current_user_school_id()
  or public.parent_has_verified_link(id)
);

drop policy if exists pupils_insert_staff_same_school on public.pupils;
create policy pupils_insert_staff_same_school
on public.pupils
for insert
to authenticated
with check (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
);

drop policy if exists pupils_update_staff_same_school on public.pupils;
create policy pupils_update_staff_same_school
on public.pupils
for update
to authenticated
using (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
)
with check (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
);

drop policy if exists pupils_delete_admin_same_school on public.pupils;
create policy pupils_delete_admin_same_school
on public.pupils
for delete
to authenticated
using (
  public.current_user_role() = 'admin'
  and school_id = public.current_user_school_id()
);

-- parent_pupil_links
drop policy if exists ppl_select_parent_or_school_staff on public.parent_pupil_links;
create policy ppl_select_parent_or_school_staff
on public.parent_pupil_links
for select
to authenticated
using (
  parent_id = auth.uid()
  or exists (
    select 1
    from public.pupils p
    where p.id = parent_pupil_links.pupil_id
      and p.school_id = public.current_user_school_id()
      and public.current_user_role() in ('teacher', 'admin')
  )
);

drop policy if exists ppl_insert_parent_request on public.parent_pupil_links;
create policy ppl_insert_parent_request
on public.parent_pupil_links
for insert
to authenticated
with check (
  parent_id = auth.uid()
  and verified = false
);

drop policy if exists ppl_insert_staff_link on public.parent_pupil_links;
create policy ppl_insert_staff_link
on public.parent_pupil_links
for insert
to authenticated
with check (
  public.current_user_role() in ('teacher', 'admin')
  and exists (
    select 1
    from public.pupils p
    where p.id = parent_pupil_links.pupil_id
      and p.school_id = public.current_user_school_id()
  )
);

drop policy if exists ppl_update_staff_verify on public.parent_pupil_links;
create policy ppl_update_staff_verify
on public.parent_pupil_links
for update
to authenticated
using (
  public.current_user_role() in ('teacher', 'admin')
  and exists (
    select 1
    from public.pupils p
    where p.id = parent_pupil_links.pupil_id
      and p.school_id = public.current_user_school_id()
  )
)
with check (
  public.current_user_role() in ('teacher', 'admin')
  and exists (
    select 1
    from public.pupils p
    where p.id = parent_pupil_links.pupil_id
      and p.school_id = public.current_user_school_id()
  )
);

-- cfe_outcomes
drop policy if exists cfe_outcomes_select_all_authenticated on public.cfe_outcomes;
create policy cfe_outcomes_select_all_authenticated
on public.cfe_outcomes
for select
to authenticated
using (true);

-- achievements
drop policy if exists achievements_select_school_or_linked_parent on public.achievements;
create policy achievements_select_school_or_linked_parent
on public.achievements
for select
to authenticated
using (
  school_id = public.current_user_school_id()
  or public.parent_has_verified_link(pupil_id)
);

drop policy if exists achievements_insert_staff_same_school on public.achievements;
create policy achievements_insert_staff_same_school
on public.achievements
for insert
to authenticated
with check (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
  and public.pupil_in_current_school(pupil_id)
);

drop policy if exists achievements_insert_parent_outside_pending on public.achievements;
create policy achievements_insert_parent_outside_pending
on public.achievements
for insert
to authenticated
with check (
  public.current_user_role() = 'parent'
  and submitted_by = auth.uid()
  and source = 'outside_school'
  and status = 'pending_review'
  and public.parent_has_verified_link(pupil_id)
  and exists (
    select 1
    from public.pupils p
    where p.id = achievements.pupil_id
      and p.school_id = achievements.school_id
  )
);

drop policy if exists achievements_update_staff_same_school on public.achievements;
create policy achievements_update_staff_same_school
on public.achievements
for update
to authenticated
using (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
)
with check (
  public.current_user_role() in ('teacher', 'admin')
  and school_id = public.current_user_school_id()
);

drop policy if exists achievements_delete_admin_same_school on public.achievements;
create policy achievements_delete_admin_same_school
on public.achievements
for delete
to authenticated
using (
  public.current_user_role() = 'admin'
  and school_id = public.current_user_school_id()
);

-- achievement_media
drop policy if exists achievement_media_select_accessible on public.achievement_media;
create policy achievement_media_select_accessible
on public.achievement_media
for select
to authenticated
using (public.can_access_achievement(achievement_id));

drop policy if exists achievement_media_insert_allowed on public.achievement_media;
create policy achievement_media_insert_allowed
on public.achievement_media
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and storage_bucket = 'achievement-media'
  and exists (
    select 1
    from public.achievements a
    where a.id = achievement_media.achievement_id
      and a.school_id = achievement_media.school_id
      and public.can_upload_to_achievement(a.id)
  )
);

drop policy if exists achievement_media_update_uploader_or_staff on public.achievement_media;
create policy achievement_media_update_uploader_or_staff
on public.achievement_media
for update
to authenticated
using (
  uploaded_by = auth.uid()
  or public.is_staff_for_school(school_id)
)
with check (
  uploaded_by = auth.uid()
  or public.is_staff_for_school(school_id)
);

drop policy if exists achievement_media_delete_uploader_or_staff on public.achievement_media;
create policy achievement_media_delete_uploader_or_staff
on public.achievement_media
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or public.is_staff_for_school(school_id)
);

-- notifications
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists notifications_insert_own on public.notifications;
create policy notifications_insert_own
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- audit_log (append-only)
drop policy if exists audit_log_select_school_staff on public.audit_log;
create policy audit_log_select_school_staff
on public.audit_log
for select
to authenticated
using (
  public.current_user_role() in ('teacher', 'admin')
  and exists (
    select 1
    from public.users u
    where u.id = audit_log.user_id
      and u.school_id = public.current_user_school_id()
  )
);

drop policy if exists audit_log_insert_own on public.audit_log;
create policy audit_log_insert_own
on public.audit_log
for insert
to authenticated
with check (user_id = auth.uid());

-- storage (Supabase)
-- Path convention: achievement-media/<school_id>/<achievement_id>/<filename>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'achievement-media',
  'achievement-media',
  false,
  262144000,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_objects_select_accessible on storage.objects;
create policy media_objects_select_accessible
on storage.objects
for select
to authenticated
using (
  bucket_id = 'achievement-media'
  and exists (
    select 1
    from public.achievement_media am
    where am.storage_bucket = storage.objects.bucket_id
      and am.storage_path = storage.objects.name
      and public.can_access_achievement(am.achievement_id)
  )
);

drop policy if exists media_objects_insert_uploader_only on storage.objects;
create policy media_objects_insert_uploader_only
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'achievement-media'
  and exists (
    select 1
    from public.achievement_media am
    where am.storage_bucket = storage.objects.bucket_id
      and am.storage_path = storage.objects.name
      and am.uploaded_by = auth.uid()
      and public.can_upload_to_achievement(am.achievement_id)
  )
);

drop policy if exists media_objects_update_uploader_or_staff on storage.objects;
create policy media_objects_update_uploader_or_staff
on storage.objects
for update
to authenticated
using (
  bucket_id = 'achievement-media'
  and exists (
    select 1
    from public.achievement_media am
    where am.storage_bucket = storage.objects.bucket_id
      and am.storage_path = storage.objects.name
      and (
        am.uploaded_by = auth.uid()
        or public.is_staff_for_school(am.school_id)
      )
  )
)
with check (
  bucket_id = 'achievement-media'
  and exists (
    select 1
    from public.achievement_media am
    where am.storage_bucket = storage.objects.bucket_id
      and am.storage_path = storage.objects.name
      and (
        am.uploaded_by = auth.uid()
        or public.is_staff_for_school(am.school_id)
      )
  )
);

drop policy if exists media_objects_delete_uploader_or_staff on storage.objects;
create policy media_objects_delete_uploader_or_staff
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'achievement-media'
  and exists (
    select 1
    from public.achievement_media am
    where am.storage_bucket = storage.objects.bucket_id
      and am.storage_path = storage.objects.name
      and (
        am.uploaded_by = auth.uid()
        or public.is_staff_for_school(am.school_id)
      )
  )
);

-- No UPDATE/DELETE policies on audit_log (intentionally append-only).
