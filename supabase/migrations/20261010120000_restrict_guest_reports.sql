-- Guests (anonymous sign-ins) can learn but cannot submit incident reports.
drop policy if exists "Authenticated incident reports enter moderation" on public.posts;

create policy "Authenticated incident reports enter moderation"
  on public.posts for insert to authenticated
  with check (
    status = 'pending'
    and (author_id is null or author_id = (select auth.uid()))
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );