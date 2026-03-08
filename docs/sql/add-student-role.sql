-- Run once if your existing `public.users.role` check does not include `student`
alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role in ('teacher', 'parent', 'admin', 'student'));
