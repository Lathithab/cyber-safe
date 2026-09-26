-- Shared admin-role check used by content and storage RLS policies.
-- Keep the role in public.profiles; users must not be able to self-promote
-- through the public client API. Promote accounts through the Supabase
-- dashboard/SQL Editor using a privileged database role.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.role::text = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Profiles remain readable by their owner, but all profile writes (including
-- role changes) are reserved for trusted database operators. The auth trigger
-- can still insert profiles because it runs as its function owner.
alter table public.profiles enable row level security;
drop policy if exists "Users can update their own profile" on public.profiles;
revoke insert, update, delete on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
