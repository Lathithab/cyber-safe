-- Let signed-in learners save and read only their own module completion.
-- A completed quiz awards the corresponding module badge in the profile.

alter table public.user_progress enable row level security;

drop policy if exists "Users can view their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

create policy "Users can view their own progress"
  on public.user_progress
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.user_progress
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on table public.user_progress from anon;
grant select, insert, update on table public.user_progress to authenticated;
