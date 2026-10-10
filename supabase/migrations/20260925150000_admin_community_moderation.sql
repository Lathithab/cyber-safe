-- Hold database-backed community posts for moderator review, and allow only
-- Platform Admins to change their moderation status.
-- Apply after 20260923190000_platform_admin_security.sql.

alter table public.posts
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderation_note text;

alter table public.posts enable row level security;

-- Replace legacy policies on posts so a permissive older policy cannot bypass
-- the explicit public-read, pending-submission, and admin-moderation rules.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'posts'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

revoke insert, update, delete on table public.posts from anon, authenticated;
grant select on table public.posts to anon, authenticated;
grant insert on table public.posts to anon, authenticated;
grant update on table public.posts to authenticated;

create policy "Public can read approved posts"
  on public.posts for select to anon
  using (status = 'approved');

create policy "Users and admins can read feed posts"
  on public.posts for select to authenticated
  using (
    status = 'approved'
    or author_id = (select auth.uid())
    or (select public.is_admin())
  );

create policy "Anonymous incident reports enter moderation"
  on public.posts for insert to anon
  with check (author_id is null and status = 'pending');

create policy "Authenticated incident reports enter moderation"
  on public.posts for insert to authenticated
  with check (
    status = 'pending'
    and (author_id is null or author_id = (select auth.uid()))
  );

create policy "Admins can moderate community posts"
  on public.posts for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
