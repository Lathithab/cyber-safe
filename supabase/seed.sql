-- Idempotent demo seed data for the Learn Security modules and their quizzes.
-- Safe to run more than once: modules are matched by slug, and questions are
-- matched by (module_id, question) so re-running never creates duplicates.
--
-- Content mirrors the "phishing" and "sim-swap" modules and their category
-- quizzes ("Social engineering" and "Banking") already hardcoded in
-- apps/web/src/app/learn/page.js, so the API-backed quiz has the same
-- questions the frontend currently shows for those modules.

insert into modules (slug, title, description, difficulty, order_index, estimated_minutes)
values
  (
    'phishing',
    'Spot a phishing attempt',
    'Learn the warning signs behind fake emails, websites, and urgent messages.',
    'beginner',
    1,
    20
  ),
  (
    'sim-swap',
    'Stop a SIM-swap attack',
    'Know the early warning signs and the urgent steps to protect your accounts.',
    'beginner',
    2,
    20
  )
on conflict (slug) do nothing;

insert into quiz_questions (module_id, question, options, correct_index, order_index)
select m.id, q.question, q.options, q.correct_index, q.order_index
from (
  values
    ('phishing', 'Which item should never be shared with another person?',
      '["A public business address", "A one-time password or verification code", "A first name"]'::jsonb, 1, 0),
    ('phishing', 'What should you do with an unexpected link asking you to sign in?',
      '["Open it quickly before it expires", "Check the service through its official app or website", "Forward it to a friend"]'::jsonb, 1, 1),
    ('phishing', 'How should you respond to an unexpected call asking for your personal details?',
      '["Provide details to avoid account closure", "Ask the caller to text you a link", "End the call and verify through an official channel"]'::jsonb, 2, 2),
    ('sim-swap', 'What is the safest way to check a suspicious banking alert?',
      '["Use the message link", "Open your official banking app or call a verified number", "Reply and ask the sender"]'::jsonb, 1, 0),
    ('sim-swap', 'When selling an item online, when should you release it?',
      '["After receiving a payment screenshot", "After cleared funds appear in your official bank account", "As soon as a courier arrives"]'::jsonb, 1, 1),
    ('sim-swap', 'Your phone loses signal unexpectedly and you suspect a SIM swap. What should you do?',
      '["Wait until tomorrow", "Restart your phone repeatedly", "Contact your network and bank immediately"]'::jsonb, 2, 2)
) as q(module_slug, question, options, correct_index, order_index)
join modules m on m.slug = q.module_slug
where not exists (
  select 1 from quiz_questions qq
  where qq.module_id = m.id and qq.question = q.question
);
