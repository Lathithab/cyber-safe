-- Moderated comments
--
-- Comments appear straight away for signed-in (non-guest) members on approved
-- posts, because a review queue for every reply would make conversations
-- unusable. Safety comes from four things instead:
--   1. only real accounts can comment (no guests, no signed-out visitors)
--   2. the public name is set by the server and cannot be faked
--   3. 3 different readers reporting a comment hides it until an admin looks
--   4. admins moderate comments on /admin/community, next to posts
-- A rate limit (10 comments per 10 minutes per person) slows down spam.
--
-- Apply after 20261026140000_moderated_feed.sql.

-- 1. Columns used for moderation ----------------------------------------------

alter table public.comments
  add column if not exists display_name text,
  add column if not exists status text not null default 'visible',
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid;

alter table public.comments drop constraint if exists comments_status_check;
alter table public.comments
  add constraint comments_status_check check (status in ('visible', 'hidden', 'removed'));

create index if not exists comments_post_id_created_at_idx
  on public.comments (post_id, created_at);

-- 2. Reports from readers ---------------------------------------------------------

create table if not exists public.comment_flags (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_flags enable row level security;
revoke all on table public.comment_flags from public, anon, authenticated;
grant select, insert on table public.comment_flags to authenticated;

drop policy if exists "Signed-in users can flag visible comments" on public.comment_flags;
create policy "Signed-in users can flag visible comments"
  on public.comment_flags for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1 from public.comments as comment
      where comment.id = comment_flags.comment_id
        and comment.status = 'visible'
        and comment.author_id is distinct from (select auth.uid())
    )
  );

drop policy if exists "Users see their own comment flags, admins see all" on public.comment_flags;
create policy "Users see their own comment flags, admins see all"
  on public.comment_flags for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- 3. Who can read, write and moderate comments ---------------------------------------

drop policy if exists "Anyone can read comments on approved posts" on public.comments;
drop policy if exists "Authenticated users can comment" on public.comments;
drop policy if exists "Read visible comments on approved posts" on public.comments;
drop policy if exists "Signed-in members can comment" on public.comments;
drop policy if exists "Admins can moderate comments" on public.comments;

revoke all on table public.comments from public, anon, authenticated;
grant select on table public.comments to anon, authenticated;
grant insert (post_id, author_id, content) on table public.comments to authenticated;
grant update (status, moderated_at, moderated_by) on table public.comments to authenticated;

create policy "Read visible comments on approved posts"
  on public.comments for select to anon, authenticated
  using (
    (
      status = 'visible'
      and exists (
        select 1 from public.posts as post
        where post.id = comments.post_id and post.status = 'approved'
      )
    )
    or (select public.is_admin())
  );

create policy "Signed-in members can comment"
  on public.comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1 from public.posts as post
      where post.id = comments.post_id and post.status = 'approved'
    )
  );

create policy "Admins can moderate comments"
  on public.comments for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 4. Rules applied to every new comment ---------------------------------------------

create or replace function public.prepare_new_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
begin
  new.content := btrim(coalesce(new.content, ''));
  if char_length(new.content) < 1 or char_length(new.content) > 500 then
    raise exception 'A comment must be between 1 and 500 characters'
      using errcode = '23514';
  end if;

  if (
    select count(*) from public.comments as existing
    where existing.author_id = new.author_id
      and existing.created_at > now() - interval '10 minutes'
  ) >= 10 then
    raise exception 'You are commenting too quickly. Please wait a few minutes.'
      using errcode = 'P0001';
  end if;

  select profile.username into v_username
  from public.profiles as profile
  where profile.id = new.author_id;

  new.display_name := left(
    coalesce(nullif(btrim(v_username), ''), 'CyberSafe member'),
    80
  );
  new.status := 'visible';
  new.moderated_at := null;
  new.moderated_by := null;
  return new;
end;
$$;

drop trigger if exists comments_prepare_new on public.comments;
create trigger comments_prepare_new
  before insert on public.comments
  for each row execute function public.prepare_new_comment();

-- 5. Three reports hide a comment -------------------------------------------------------
-- Only reports made since an admin last reviewed it count.

create or replace function public.auto_hide_reported_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_threshold constant integer := 3;
  v_reports integer;
begin
  select count(*) into v_reports
  from public.comment_flags as flag
  join public.comments as comment on comment.id = flag.comment_id
  where flag.comment_id = new.comment_id
    and flag.created_at > coalesce(comment.moderated_at, '-infinity'::timestamptz);

  if v_reports >= c_threshold then
    update public.comments
       set status = 'hidden',
           moderated_at = now(),
           moderated_by = null
     where id = new.comment_id
       and status = 'visible';
  end if;

  return new;
end;
$$;

drop trigger if exists comment_flags_auto_hide on public.comment_flags;
create trigger comment_flags_auto_hide
  after insert on public.comment_flags
  for each row execute function public.auto_hide_reported_comment();

-- 6. Comment counts for the feed -------------------------------------------------------------

create or replace view public.post_comment_counts
with (security_invoker = false) as
select comment.post_id, count(*)::integer as comment_count
from public.comments as comment
join public.posts as post on post.id = comment.post_id
where comment.status = 'visible' and post.status = 'approved'
group by comment.post_id;

revoke all on table public.post_comment_counts from public;
grant select on table public.post_comment_counts to anon, authenticated;
