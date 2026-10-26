-- Server-side quiz grading.
--
-- Before this migration the browser downloaded every question together with
-- its correct_index, graded the quiz itself, and wrote its own score straight
-- into user_progress. That meant a learner could read the answers in dev tools
-- or forge a completed module and badge.
--
-- After this migration:
--   * learners read questions through quiz_questions_public (no correct_index)
--   * check_quiz_answer() reveals the answer + explanation for ONE question,
--     used for the instant feedback after "Submit Answer"
--   * submit_quiz() grades the whole quiz on the server and is the only way
--     user_progress is written
--   * the pass mark lives in exactly one place (c_pass_percent below)
--
-- Apply after 20261019140000_add_more_scam_guides.sql.

-- 1. Questions without answers, for learners ---------------------------------

-- Runs with the view owner's rights, so the published/admin check is done
-- inside the view instead of through RLS on the base table.
create or replace view public.quiz_questions_public
with (security_invoker = false) as
select
  question.id,
  question.quizz_id,
  question.question,
  question.options,
  question.order_index
from public.quiz_questions as question
join public."Quizz" as quiz on quiz.id = question.quizz_id
join public.modules as module on module.id = quiz.module_id
where module.published or (select public.is_admin());

revoke all on table public.quiz_questions_public from public, anon;
grant select on table public.quiz_questions_public to authenticated;

-- 2. The base table (with correct_index) is now admin-only -------------------

drop policy if exists "Authenticated users can read quiz questions"
  on public.quiz_questions;
-- "Admins can manage quiz questions" (for all) already lets admins read.

-- 3. Check one answer ---------------------------------------------------------

create or replace function public.check_quiz_answer(
  p_question_id uuid,
  p_selected_index integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_correct_index integer;
  v_explanation text;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;

  select question.correct_index, question.explanation
    into v_correct_index, v_explanation
  from public.quiz_questions as question
  join public."Quizz" as quiz on quiz.id = question.quizz_id
  join public.modules as module on module.id = quiz.module_id
  where question.id = p_question_id
    and module.published;

  if not found then
    raise exception 'Question not found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'is_correct', p_selected_index = v_correct_index,
    'correct_index', v_correct_index,
    'explanation', v_explanation
  );
end;
$$;

revoke all on function public.check_quiz_answer(uuid, integer) from public, anon;
grant execute on function public.check_quiz_answer(uuid, integer) to authenticated;

-- 4. Grade the whole quiz and save progress ----------------------------------

create or replace function public.submit_quiz(
  p_module_id uuid,
  p_answers jsonb  -- [{"question_id": "<uuid>", "selected_index": 2}, ...]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_pass_percent constant numeric := 60;   -- the ONE pass mark for the platform
  v_user_id uuid := (select auth.uid());
  v_quiz_id bigint;
  v_total integer;
  v_correct integer;
  v_percent numeric;
  v_passed boolean;
begin
  if v_user_id is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;
  if jsonb_typeof(p_answers) is distinct from 'array' then
    raise exception 'answers must be a JSON array';
  end if;

  select quiz.id into v_quiz_id
  from public."Quizz" as quiz
  join public.modules as module on module.id = quiz.module_id
  where quiz.module_id = p_module_id
    and module.published
  order by quiz.id
  limit 1;

  if v_quiz_id is null then
    raise exception 'Quiz not found' using errcode = 'P0002';
  end if;

  select count(*) into v_total
  from public.quiz_questions
  where quizz_id = v_quiz_id;

  if v_total = 0 then
    raise exception 'This quiz has no questions' using errcode = 'P0002';
  end if;

  -- One answer per question (the last one sent wins), so sending several
  -- answers for the same question cannot earn extra marks.
  select count(*) into v_correct
  from public.quiz_questions as question
  join (
    select distinct on (answer.question_id)
      answer.question_id,
      answer.selected_index
    from (
      select
        (item.value ->> 'question_id')::uuid as question_id,
        (item.value ->> 'selected_index')::integer as selected_index,
        item.ordinality
      from jsonb_array_elements(p_answers) with ordinality as item(value, ordinality)
    ) as answer
    order by answer.question_id, answer.ordinality desc
  ) as latest on latest.question_id = question.id
  where question.quizz_id = v_quiz_id
    and latest.selected_index = question.correct_index;

  v_percent := round(100.0 * v_correct / v_total);
  v_passed := v_percent >= c_pass_percent;

  if v_passed then
    insert into public.user_progress
      (user_id, module_id, status, quiz_score, completed_at)
    values
      (v_user_id, p_module_id, 'completed', v_percent, now())
    on conflict (user_id, module_id) do update
      set status = 'completed',
          quiz_score = excluded.quiz_score,
          completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);
  else
    -- Record the attempt, but never downgrade a module already completed.
    insert into public.user_progress
      (user_id, module_id, status, quiz_score)
    values
      (v_user_id, p_module_id, 'in_progress', v_percent)
    on conflict (user_id, module_id) do nothing;
  end if;

  return jsonb_build_object(
    'score_percent', v_percent,
    'correct_count', v_correct,
    'total_questions', v_total,
    'passed', v_passed,
    'pass_mark', c_pass_percent
  );
end;
$$;

revoke all on function public.submit_quiz(uuid, jsonb) from public, anon;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;

-- 5. Browsers can no longer write progress directly --------------------------

revoke insert, update, delete on table public.user_progress from anon, authenticated;
grant select on table public.user_progress to authenticated;
