-- Production security remediation for existing QS Nexus tables and buckets.

-- Students submit and read their own work, but never update submission rows.
drop policy if exists "students can replace their own submission" on public.submissions;

-- Keep quiz attempts private while exposing only safe leaderboard columns through a view.
drop policy if exists "students can read quiz attempts for the leaderboard" on public.quiz_attempts;

create policy "users can read their own quiz attempts" on public.quiz_attempts
for select to authenticated
using (user_id = auth.uid() or public.has_role('admin'));

drop view if exists public.quiz_leaderboard;

create view public.quiz_leaderboard
with (security_barrier = true)
as
select
  qa.id,
  qa.user_id,
  qa.course_code,
  qa.course_title,
  qa.score,
  qa.question_count,
  qa.percentage,
  qa.created_at,
  p.full_name,
  p.level
from public.quiz_attempts as qa
join public.profiles as p on p.id = qa.user_id;

grant select on public.quiz_leaderboard to authenticated;

-- Academic resources are authenticated portal content, not public objects.
update storage.buckets
set public = false
where id = 'resources';

drop policy if exists "public can read resource files" on storage.objects;

create policy "authenticated users can read resource files" on storage.objects
for select to authenticated
using (bucket_id = 'resources');

create policy "resource owners and admins can update resource files" on storage.objects
for update to authenticated
using (
  bucket_id = 'resources'
  and (
    public.has_role('admin')
    or exists (
      select 1
      from public.resources
      where resources.file_url = storage.objects.name
        and resources.uploaded_by = auth.uid()
    )
  )
)
with check (bucket_id = 'resources' and public.is_staff());

drop policy if exists "lecturers and admins can manage resource files" on storage.objects;

create policy "admins can delete resource files" on storage.objects
for delete to authenticated
using (bucket_id = 'resources' and public.has_role('admin'));

drop policy if exists "lecturers and admins can delete resource files" on storage.objects;

create policy "resource owners can delete resource files" on storage.objects
for delete to authenticated
using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources
    where resources.file_url = storage.objects.name
      and resources.uploaded_by = auth.uid()
  )
);
