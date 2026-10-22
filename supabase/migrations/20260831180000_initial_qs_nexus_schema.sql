-- QS Nexus initial application schema.
-- This migration is intentionally based on the fields currently used by the client.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  department text not null default 'Quantity Surveying',
  level text,
  role text not null default 'student' check (role in ('student', 'lecturer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null unique,
  course_title text not null,
  level text not null,
  unit integer,
  description text,
  lecturer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  resource_type text not null,
  course_code text not null,
  file_url text not null,
  level text,
  department text not null default 'Quantity Surveying',
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  course_code text not null,
  level text not null,
  due_date timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  submitted_at timestamptz not null default now(),
  grade text,
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  audience text not null default 'all' check (audience in ('all', 'students', 'lecturers')),
  posted_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.timetable (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  course_title text not null,
  lecturer text not null,
  level text not null,
  day text not null,
  start_time time not null,
  end_time time not null,
  venue text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_code text not null,
  course_title text not null,
  question_count integer not null check (question_count > 0),
  score integer not null check (score >= 0),
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  time_taken_seconds integer not null default 0 check (time_taken_seconds >= 0),
  questions jsonb not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index courses_lecturer_id_idx on public.courses (lecturer_id);
create index resources_course_level_idx on public.resources (course_code, level);
create index resources_uploaded_by_idx on public.resources (uploaded_by);
create index assignments_level_due_date_idx on public.assignments (level, due_date);
create index assignments_created_by_idx on public.assignments (created_by);
create index submissions_assignment_id_idx on public.submissions (assignment_id);
create index submissions_student_id_idx on public.submissions (student_id);
create index announcements_audience_created_at_idx on public.announcements (audience, created_at desc);
create index events_event_date_idx on public.events (event_date);
create index timetable_level_day_idx on public.timetable (level, day);
create index quiz_attempts_user_created_at_idx on public.quiz_attempts (user_id, created_at desc);
create index notifications_user_created_at_idx on public.notifications (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = required_role
  );
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('lecturer') or public.has_role('admin');
$$;

create or replace function public.owns_assignment(assignment_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.assignments
    where id = assignment_uuid and created_by = auth.uid()
  );
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger resources_set_updated_at before update on public.resources for each row execute function public.set_updated_at();
create trigger assignments_set_updated_at before update on public.assignments for each row execute function public.set_updated_at();
create trigger submissions_set_updated_at before update on public.submissions for each row execute function public.set_updated_at();
create trigger announcements_set_updated_at before update on public.announcements for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger timetable_set_updated_at before update on public.timetable for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.resources enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.timetable enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.notifications enable row level security;

create policy "authenticated users can read profiles" on public.profiles for select to authenticated using (true);
create policy "users can create their student profile" on public.profiles for insert to authenticated with check (id = auth.uid() and role = 'student');
create policy "users can update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = public.current_user_role());
create policy "admins can manage profiles" on public.profiles for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "authenticated users can read courses" on public.courses for select to authenticated using (true);
create policy "admins can manage courses" on public.courses for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "authenticated users can read resources" on public.resources for select to authenticated using (true);
create policy "lecturers can create resources" on public.resources for insert to authenticated with check (uploaded_by = auth.uid() and public.has_role('lecturer'));
create policy "resource owners and admins can update resources" on public.resources for update to authenticated using (uploaded_by = auth.uid() or public.has_role('admin')) with check (uploaded_by = auth.uid() or public.has_role('admin'));
create policy "resource owners and admins can delete resources" on public.resources for delete to authenticated using (uploaded_by = auth.uid() or public.has_role('admin'));

create policy "authenticated users can read assignments" on public.assignments for select to authenticated using (true);
create policy "lecturers can create assignments" on public.assignments for insert to authenticated with check (created_by = auth.uid() and public.has_role('lecturer'));
create policy "assignment owners and admins can update assignments" on public.assignments for update to authenticated using (created_by = auth.uid() or public.has_role('admin')) with check (created_by = auth.uid() or public.has_role('admin'));
create policy "assignment owners and admins can delete assignments" on public.assignments for delete to authenticated using (created_by = auth.uid() or public.has_role('admin'));

create policy "students can read their submissions" on public.submissions for select to authenticated using (student_id = auth.uid() or public.owns_assignment(assignment_id) or public.has_role('admin'));
create policy "students can submit their own work" on public.submissions for insert to authenticated with check (student_id = auth.uid() and public.has_role('student'));
create policy "students can replace their own submission" on public.submissions for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "assignment owners and admins can grade submissions" on public.submissions for update to authenticated using (public.owns_assignment(assignment_id) or public.has_role('admin')) with check (public.owns_assignment(assignment_id) or public.has_role('admin'));

create policy "authenticated users can read announcements" on public.announcements for select to authenticated using (true);
create policy "staff can create announcements" on public.announcements for insert to authenticated with check (posted_by = auth.uid() and public.is_staff());
create policy "announcement owners and admins can update announcements" on public.announcements for update to authenticated using (posted_by = auth.uid() or public.has_role('admin')) with check (posted_by = auth.uid() or public.has_role('admin'));
create policy "announcement owners and admins can delete announcements" on public.announcements for delete to authenticated using (posted_by = auth.uid() or public.has_role('admin'));

create policy "authenticated users can read events" on public.events for select to authenticated using (true);
create policy "staff can create events" on public.events for insert to authenticated with check (created_by = auth.uid() and public.is_staff());
create policy "event owners and admins can update events" on public.events for update to authenticated using (created_by = auth.uid() or public.has_role('admin')) with check (created_by = auth.uid() or public.has_role('admin'));
create policy "event owners and admins can delete events" on public.events for delete to authenticated using (created_by = auth.uid() or public.has_role('admin'));

create policy "authenticated users can read timetable" on public.timetable for select to authenticated using (true);
create policy "admins can manage timetable" on public.timetable for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "students can read quiz attempts for the leaderboard" on public.quiz_attempts for select to authenticated using (user_id = auth.uid() or public.has_role('student') or public.has_role('admin'));
create policy "students can save their quiz attempts" on public.quiz_attempts for insert to authenticated with check (user_id = auth.uid() and public.has_role('student'));

create policy "users can read their notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "users can mark their notifications read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit)
values ('resources', 'resources', true, 52428800)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

insert into storage.buckets (id, name, public, file_size_limit)
values ('assignments', 'assignments', false, 52428800)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

create policy "public can read resource files" on storage.objects for select using (bucket_id = 'resources');
create policy "lecturers can upload resource files" on storage.objects for insert to authenticated with check (bucket_id = 'resources' and public.has_role('lecturer'));
create policy "lecturers and admins can manage resource files" on storage.objects for update to authenticated using (bucket_id = 'resources' and public.is_staff()) with check (bucket_id = 'resources' and public.is_staff());
create policy "lecturers and admins can delete resource files" on storage.objects for delete to authenticated using (bucket_id = 'resources' and public.is_staff());

create policy "students can upload their own assignment files" on storage.objects for insert to authenticated with check (bucket_id = 'assignments' and (storage.foldername(name))[2] = auth.uid()::text and public.has_role('student'));
create policy "students can read their own assignment files" on storage.objects for select to authenticated using (bucket_id = 'assignments' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "staff can read assignment files" on storage.objects for select to authenticated using (bucket_id = 'assignments' and public.is_staff());
