-- Public viewing and admin-only upload/edit/delete for Scam Library examples.
-- Apply after 20260923190000_platform_admin_security.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scam-examples',
  'scam-examples',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view scam example images" on storage.objects;
create policy "Anyone can view scam example images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'scam-examples');

drop policy if exists "Admins can upload scam example images" on storage.objects;
create policy "Admins can upload scam example images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'scam-examples' and (select public.is_admin()));

drop policy if exists "Admins can update scam example images" on storage.objects;
create policy "Admins can update scam example images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'scam-examples' and (select public.is_admin()))
  with check (bucket_id = 'scam-examples' and (select public.is_admin()));

drop policy if exists "Admins can delete scam example images" on storage.objects;
create policy "Admins can delete scam example images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'scam-examples' and (select public.is_admin()));
