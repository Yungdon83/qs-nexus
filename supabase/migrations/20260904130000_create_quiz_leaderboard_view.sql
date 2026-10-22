-- Expose only safe quiz ranking fields through the intended leaderboard view.
-- Quiz questions and answers remain private on public.quiz_attempts.

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

revoke all on public.quiz_leaderboard from anon;
grant select on public.quiz_leaderboard to authenticated;