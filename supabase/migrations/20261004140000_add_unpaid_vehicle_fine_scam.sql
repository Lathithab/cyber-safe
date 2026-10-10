-- Add a published guide about fake unpaid vehicle/traffic fine messages.
insert into public.scam_guides
  (slug, category, title, summary, warning_signs, recommended_action, published, sort_order)
values
  (
    'vehicle-fine',
    'Phishing',
    'Unpaid vehicle fine scam',
    'A text or email claims you have an unpaid traffic or vehicle fine and urges you to pay through a link to avoid extra penalties or restrictions.',
    array[
      'The fine notice is unexpected and gives you little time to pay.',
      'It threatens added fees, legal action, or suspension unless you act immediately.',
      'The payment link is shortened or does not belong to an official traffic authority or municipality.',
      'The page asks for card details, banking credentials, or a one-time PIN.'
    ],
    'Do not open the message link or enter payment details or one-time PINs. Check whether the fine is real through the relevant traffic authority or municipality using contact details you find independently, or visit its official website directly. If you already paid or shared banking details, contact your bank promptly.',
    true,
    15
  )
on conflict (slug) do nothing;
