-- Admin-managed learning modules, quizzes, and quiz questions.
-- Apply after 20260923190000_platform_admin_security.sql.

alter table public.modules
  add column if not exists published boolean not null default true;

alter table public.modules enable row level security;
alter table public."Quizz" enable row level security;
alter table public.quiz_questions enable row level security;

-- Remove any older permissive policies from these content tables before
-- installing the explicit learner-read/admin-write policy set below.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('modules', 'Quizz', 'quiz_questions')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

revoke insert, update, delete on table public.modules, public."Quizz", public.quiz_questions from anon, authenticated;
grant select on table public.modules, public."Quizz", public.quiz_questions to authenticated;
grant insert, update, delete on table public.modules, public."Quizz", public.quiz_questions to authenticated;

do $$
declare
  quiz_id_sequence text := pg_get_serial_sequence('public."Quizz"', 'id');
begin
  if quiz_id_sequence is not null then
    execute format('grant usage, select on sequence %s to authenticated', quiz_id_sequence);
  end if;
end;
$$;

create policy "Authenticated users can read modules"
  on public.modules
  for select to authenticated
  using (published or (select public.is_admin()));

create policy "Admins can manage modules"
  on public.modules
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Authenticated users can read quizzes"
  on public."Quizz"
  for select to authenticated
  using (
    exists (
      select 1
      from public.modules
      where modules.id = "Quizz".module_id
        and (modules.published or (select public.is_admin()))
    )
  );

create policy "Admins can manage quizzes"
  on public."Quizz"
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Authenticated users can read quiz questions"
  on public.quiz_questions
  for select to authenticated
  using (
    exists (
      select 1
      from public."Quizz" as quiz
      join public.modules on modules.id = quiz.module_id
      where quiz.id = quiz_questions.quizz_id
        and (modules.published or (select public.is_admin()))
    )
  );

create policy "Admins can manage quiz questions"
  on public.quiz_questions
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Save a module and its complete quiz in a single transaction. Running this
-- function as an authenticated non-admin fails at both this check and RLS.
create or replace function public.admin_save_learning_content(
  p_module jsonb,
  p_quiz jsonb,
  p_questions jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  module_row_id uuid;
  quiz_row_id bigint;
  question_row jsonb;
  question_number integer := 0;
  options_value jsonb;
  correct_index_value integer;
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;

  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) < 1 then
    raise exception 'A quiz must contain at least one question';
  end if;

  if nullif(p_module ->> 'id', '') is null then
    insert into public.modules (
      slug, title, description, content, difficulty, category,
      order_index, estimated_minutes, published
    ) values (
      p_module ->> 'slug',
      p_module ->> 'title',
      p_module ->> 'description',
      p_module ->> 'content',
      p_module ->> 'difficulty',
      p_module ->> 'category',
      coalesce(nullif(p_module ->> 'order_index', '')::integer, 0),
      coalesce(nullif(p_module ->> 'estimated_minutes', '')::integer, 5),
      coalesce((p_module ->> 'published')::boolean, false)
    ) returning id into module_row_id;
  else
    update public.modules
    set slug = p_module ->> 'slug',
        title = p_module ->> 'title',
        description = p_module ->> 'description',
        content = p_module ->> 'content',
        difficulty = p_module ->> 'difficulty',
        category = p_module ->> 'category',
        order_index = coalesce(nullif(p_module ->> 'order_index', '')::integer, 0),
        estimated_minutes = coalesce(nullif(p_module ->> 'estimated_minutes', '')::integer, 5),
        published = coalesce((p_module ->> 'published')::boolean, false)
    where id = (p_module ->> 'id')::uuid
    returning id into module_row_id;

    if module_row_id is null then
      raise exception 'Module not found';
    end if;
  end if;

  select id into quiz_row_id
  from public."Quizz"
  where module_id = module_row_id
  order by id
  limit 1;

  if quiz_row_id is null then
    insert into public."Quizz" ("Title", module_id, "Tier", "Description")
    values (
      p_quiz ->> 'title',
      module_row_id,
      (p_quiz ->> 'tier')::public."Tier",
      p_quiz ->> 'description'
    ) returning id into quiz_row_id;
  else
    update public."Quizz"
    set "Title" = p_quiz ->> 'title',
        "Tier" = (p_quiz ->> 'tier')::public."Tier",
        "Description" = p_quiz ->> 'description'
    where id = quiz_row_id;
  end if;

  delete from public.quiz_questions where quizz_id = quiz_row_id;

  for question_row in select value from jsonb_array_elements(p_questions)
  loop
    question_number := question_number + 1;
    options_value := question_row -> 'options';
    correct_index_value := (question_row ->> 'correct_index')::integer;

    if jsonb_typeof(options_value) <> 'array' or jsonb_array_length(options_value) <> 4 then
      raise exception 'Question % must have exactly four answer options', question_number;
    end if;
    if correct_index_value < 0 or correct_index_value > 3 then
      raise exception 'Question % must mark one of its four options as correct', question_number;
    end if;

    insert into public.quiz_questions (
      quizz_id, question, options, correct_index, explanation, order_index
    ) values (
      quiz_row_id,
      question_row ->> 'question',
      options_value,
      correct_index_value,
      question_row ->> 'explanation',
      question_number
    );
  end loop;

  return module_row_id;
end;
$$;

revoke all on function public.admin_save_learning_content(jsonb, jsonb, jsonb) from public;
revoke all on function public.admin_save_learning_content(jsonb, jsonb, jsonb) from anon;
grant execute on function public.admin_save_learning_content(jsonb, jsonb, jsonb) to authenticated;
