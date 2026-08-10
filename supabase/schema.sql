-- CyberSafe database schema
-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run

create type user_role as enum ('learner', 'teacher', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  role user_role not null default 'learner',
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  content text,
  difficulty text default 'beginner',
  order_index int not null default 0,
  estimated_minutes int default 5,
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules (id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text,
  order_index int not null default 0
);

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid not null references modules (id) on delete cascade,
  status text not null default 'not_started',
  quiz_score numeric,
  completed_at timestamptz,
  unique (user_id, module_id)
);

alter table modules enable row level security;
alter table quiz_questions enable row level security;
alter table user_progress enable row level security;

create policy "Authenticated users can read modules"
  on modules for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read quiz questions"
  on quiz_questions for select using (auth.role() = 'authenticated');

create policy "Users can view their own progress"
  on user_progress for select using (auth.uid() = user_id);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users (id) on delete set null,
  display_name text not null default 'Anonymous',
  description text not null,
  location text,
  issues text[] default '{}',
  image_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists likes (
  post_id uuid not null references posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (post_id, user_id)
);

alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;

create policy "Anyone can read approved posts"
  on posts for select using (status = 'approved' or auth.uid() = author_id);

create policy "Anyone can read comments on approved posts"
  on comments for select using (
    exists (select 1 from posts where posts.id = comments.post_id and posts.status = 'approved')
  );

create policy "Authenticated users can comment"
  on comments for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can like posts"
  on likes for all using (auth.uid() = user_id);

create policy "Anyone can see like counts"
  on likes for select using (true);