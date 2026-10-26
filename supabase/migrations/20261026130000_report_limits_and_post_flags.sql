-- 1. Limits on new community reports
-- 2. A real "Report post" flag that admins can see
--
-- Apply after 20261026120000_server_side_quiz_grading.sql.

-- 1. Limits on new reports -----------------------------------------------------
-- These limits used to exist only in the (now deleted, never-used) FastAPI
-- code, so the database accepted anything. They are enforced with an INSERT
-- trigger rather than CHECK constraints so that old rows (for example short
-- test posts) can still be moderated by admins afterwards.

create or replace function public.validate_new_post()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.description is null
     or char_length(btrim(new.description)) < 10
     or char_length(new.description) > 2000 then
    raise exception 'A report must be between 10 and 2000 characters'
      using errcode = '23514';
  end if;
  if new.location is not null and char_length(new.location) > 200 then
    raise exception 'Location is too long (200 characters maximum)'
      using errcode = '23514';
  end if;
  if char_length(coalesce(new.display_name, '')) > 80 then
    raise exception 'Display name is too long (80 characters maximum)'
      using errcode = '23514';
  end if;
  if coalesce(array_length(new.issues, 1), 0) > 10 then
    raise exception 'Too many issue tags (10 maximum)'
      using errcode = '23514';
  end if;
  -- Photos are resized in the browser to a small JPEG; this stops anyone
  -- using the public key to store huge blobs.
  if new.image_url is not null and char_length(new.image_url) > 2500000 then
    raise exception 'Attached image is too large'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_validate_new on public.posts;
create trigger posts_validate_new
  before insert on public.posts
  for each row execute function public.validate_new_post();

-- 2. Flagging a post -----------------------------------------------------------

create table if not exists public.post_flags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)          -- one flag per person per post
);

alter table public.post_flags enable row level security;

revoke all on table public.post_flags from public, anon, authenticated;
grant select, insert on table public.post_flags to authenticated;

drop policy if exists "Signed-in users can flag approved posts" on public.post_flags;
create policy "Signed-in users can flag approved posts"
  on public.post_flags for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1 from public.posts as post
      where post.id = post_flags.post_id and post.status = 'approved'
    )
  );

drop policy if exists "Users see their own flags, admins see all" on public.post_flags;
create policy "Users see their own flags, admins see all"
  on public.post_flags for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
