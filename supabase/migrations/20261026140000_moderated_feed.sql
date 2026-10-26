-- Moderated community feed
--
-- Every community post, whether it comes from the feed's post box or the
-- incident report form, is stored in public.posts with status 'pending' and
-- only appears for everyone once an admin approves it.
--
-- This migration:
--   1. closes the loophole that let signed-out visitors insert posts directly
--   2. makes sure a post's author is always the signed-in user
--   3. sets the public display name on the server, so it cannot be faked
--   4. sends a post back to review once it has 3 reports from readers
--   5. stops exposing which user liked which post (counts come from a view)
--
-- Apply after 20261026130000_report_limits_and_post_flags.sql.
--
-- This file assumes public.posts has the columns used elsewhere in the repo:
-- id, author_id, display_name, description, location, issues, image_url,
-- status, created_at, moderated_at, moderated_by.

-- 1. No inserts without signing in -------------------------------------------
-- The 25 Sep migration let the 'anon' role insert pending posts, and the
-- 10 Oct "guests cannot report" migration only fixed the signed-in policy.
-- That left a way to bypass the guest rule by calling the API with no login.

drop policy if exists "Anonymous incident reports enter moderation" on public.posts;
revoke insert on table public.posts from anon;

-- 2. The author must be the signed-in user -------------------------------------
-- (Anonymous posting is still possible: the public name is "Anonymous", but
-- the row keeps its author so they can see their own post's status.)

drop policy if exists "Authenticated incident reports enter moderation" on public.posts;
create policy "Authenticated incident reports enter moderation"
  on public.posts for insert to authenticated
  with check (
    status = 'pending'
    and author_id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

-- 3. Display name is decided by the server -------------------------------------
-- The browser may ask for 'Anonymous'. Anything else is replaced with the
-- author's username (or "CyberSafe member" if they have none).

create or replace function public.set_post_display_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
begin
  if new.display_name is not distinct from 'Anonymous' then
    return new;
  end if;

  select profile.username into v_username
  from public.profiles as profile
  where profile.id = new.author_id;

  new.display_name := left(
    coalesce(nullif(btrim(v_username), ''), 'CyberSafe member'),
    80
  );
  return new;
end;
$$;

drop trigger if exists posts_set_display_name on public.posts;
create trigger posts_set_display_name
  before insert on public.posts
  for each row execute function public.set_post_display_name();

-- 4. Three reports send a post back to review ----------------------------------
-- Only reports made since an admin last looked at the post count, so an admin
-- who re-approves a post is not immediately overruled by the old reports.

create or replace function public.auto_hide_reported_post()
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
  from public.post_flags as flag
  join public.posts as post on post.id = flag.post_id
  where flag.post_id = new.post_id
    and flag.created_at > coalesce(post.moderated_at, '-infinity'::timestamptz);

  if v_reports >= c_threshold then
    update public.posts
       set status = 'pending',
           moderated_at = now(),
           moderated_by = null
     where id = new.post_id
       and status = 'approved';
  end if;

  return new;
end;
$$;

drop trigger if exists post_flags_auto_hide on public.post_flags;
create trigger post_flags_auto_hide
  after insert on public.post_flags
  for each row execute function public.auto_hide_reported_post();

-- 5. Like counts without exposing who liked what -------------------------------

create or replace view public.post_like_counts
with (security_invoker = false) as
select like_row.post_id, count(*)::integer as like_count
from public.likes as like_row
join public.posts as post on post.id = like_row.post_id
where post.status = 'approved'
group by like_row.post_id;

revoke all on table public.post_like_counts from public;
grant select on table public.post_like_counts to anon, authenticated;

-- Each person can still read and change their own likes ("Authenticated users
-- can like posts"); the public read policy is what exposed everyone's.
drop policy if exists "Anyone can see like counts" on public.likes;
