-- Create student profiles from verified-auth-compatible signup metadata.
-- Lecturer accounts created by the admin Edge Function are marked with role=lecturer and skipped.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'role', 'student') = 'student' then
    insert into public.profiles (id, full_name, department, level, role)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'QS Nexus Student'),
      coalesce(nullif(new.raw_user_meta_data ->> 'department', ''), 'Quantity Surveying'),
      new.raw_user_meta_data ->> 'level',
      'student'
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
