-- Add a published guide about fake insurance loyalty-points expiry messages.
insert into public.scam_guides
  (slug, category, title, summary, warning_signs, recommended_action, published, sort_order)
values
  (
    'insurance-points',
    'Financial scams',
    'Insurance loyalty-points expiry scam',
    'A message claims your insurance rewards or loyalty points are about to expire and urges you to claim them through a link.',
    array[
      'The expiry warning is unexpected and pressures you to act immediately.',
      'The claim link is shortened, misspelled, or does not match your insurer’s official website.',
      'The redemption page asks for your account password, one-time PIN, card details, or a small “processing” fee.',
      'The offer or points balance cannot be confirmed in your insurer’s official app or website.'
    ],
    'Do not tap the message link, pay a fee, or share passwords or one-time PINs. Open your insurer’s official app or type its website address yourself to check your rewards, or call the number on your policy documents. If you entered details, change your password through the official service and contact your insurer and bank promptly.',
    true,
    14
  )
on conflict (slug) do nothing;
