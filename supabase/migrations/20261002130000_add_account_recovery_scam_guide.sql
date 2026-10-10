-- Add a fictional account-recovery phishing example to the Scam Library.
insert into public.scam_guides
  (slug, category, title, summary, warning_signs, recommended_action, example_image_path, published, sort_order)
values
  (
    'account-recovery',
    'Account recovery',
    'Fake account recovery alert',
    'A message claims your account is on hold and pressures you to follow a recovery link before a deadline.',
    array[
      'You did not request account recovery, but receive an unexpected “account on hold” message.',
      'The message threatens a permanent lock unless you act within a short deadline.',
      'The link is unfamiliar, shortened, or sent in an unexpected text message.',
      'The page asks for your password, verification code, payment details, or other sensitive information.'
    ],
    'Do not open the message link or reply. Open the service’s official app or type its website address yourself to check your account. If you already entered details, change your password through the official site, enable two-step verification, sign out other sessions, and contact support using verified contact details.',
    '/scams/fake-account-recovery.png',
    true,
    12
  )
on conflict (slug) do update set
  category = excluded.category,
  title = excluded.title,
  summary = excluded.summary,
  warning_signs = excluded.warning_signs,
  recommended_action = excluded.recommended_action,
  example_image_path = excluded.example_image_path,
  published = excluded.published,
  sort_order = excluded.sort_order,
  updated_at = now();
