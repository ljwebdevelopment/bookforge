-- Storage buckets for file uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers', 'covers', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('research', 'research', false, 52428800, null);

-- Storage RLS policies
create policy "owner_covers_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers');

create policy "owner_covers_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'covers');

create policy "owner_research_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'research' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'research' and auth.uid()::text = (storage.foldername(name))[1]);
