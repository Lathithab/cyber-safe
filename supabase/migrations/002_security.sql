-- CyberSafe security hardening migration.
-- Safe to run once against an existing database that already has schema.sql applied.

-- 1. Privilege escalation: users must not be able to change their own role
drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from profiles p where p.id = auth.uid())
  );

-- 2. Reports must enter as pending; moderation happens via the API
drop policy if exists "Anyone can submit pending reports" on posts;
create policy "Anyone can submit pending reports" on posts
  for insert
  with check (status = 'pending');

-- 3. Stop comment impersonation
drop policy if exists "Authenticated users can comment" on comments;
create policy "Authenticated users can comment" on comments
  for insert
  with check (auth.role() = 'authenticated' and author_id = auth.uid());

-- 4. Likes: enforce ownership on writes too
drop policy if exists "Authenticated users can like posts" on likes;
create policy "Authenticated users can like posts" on likes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Harden the signup trigger
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
