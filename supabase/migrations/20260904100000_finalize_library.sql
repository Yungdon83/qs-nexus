-- Complete Library metadata and staff upload permissions without changing assignment storage.

alter table public.resources
  alter column course_code drop not null;

alter table public.resources
  add column if not exists semester text;

drop policy if exists "lecturers can create resources" on public.resources;
create policy "staff can create resources" on public.resources
for insert to authenticated
with check (uploaded_by = auth.uid() and public.is_staff());

drop policy if exists "lecturers can upload resource files" on storage.objects;
create policy "staff can upload resource files" on storage.objects
for insert to authenticated
with check (bucket_id = 'resources' and public.is_staff());