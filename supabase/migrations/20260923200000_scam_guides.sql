-- Store Scam Library content in Supabase.
-- Apply after 20260923190000_platform_admin_security.sql.

create table if not exists public.scam_guides (
  slug text primary key,
  category text not null,
  title text not null,
  summary text not null,
  warning_signs text[] not null default '{}',
  recommended_action text not null,
  example_image_path text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scam_guides enable row level security;

grant select on table public.scam_guides to anon, authenticated;
grant insert, update, delete on table public.scam_guides to authenticated;

drop policy if exists "Anyone can view published scam guides" on public.scam_guides;
create policy "Anyone can view published scam guides"
  on public.scam_guides
  for select
  to anon, authenticated
  using (published);

drop policy if exists "Admins can manage scam guides" on public.scam_guides;
create policy "Admins can manage scam guides"
  on public.scam_guides
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.scam_guides
  (slug, category, title, summary, warning_signs, recommended_action, example_image_path, sort_order)
values
  ('whatsapp', 'WhatsApp', 'WhatsApp verification-code scam',
   'A scammer asks for the six-digit code sent to your phone, then uses it to register your WhatsApp account on their device.',
   array[
     'Someone says a code was sent to you by mistake and asks you to forward it.',
     'They pressure you to share it quickly or claim they need it to help you.',
     'The request may come from a friend or family member whose account was taken over.'
   ],
   'Never share the code. If you already shared it, try to register your number in WhatsApp again, enable two-step verification once you regain access, and warn your contacts through another channel.',
   '/scams/whatsapp-verification-code-scam-clear.png', 1),
  ('bank', 'Banking', 'Fake bank SMS or phishing link',
   'A message claims there is a payment, account block, or security problem and asks you to tap a link.',
   array[
     'The link is shortened or does not match your bank''s official website.',
     'It asks for a PIN, password, card details, or OTP.',
     'It creates urgency around a surprising payment or threat.'
   ],
   'Do not use the link. Open your official banking app or call the number on the back of your card.',
   '/scams/fake-bank-sms.png', 2),
  ('sim', 'SIM swap', 'SIM-swap fraud',
   'Your number unexpectedly loses service while scammers try to receive banking one-time passwords.',
   array[
     'Your phone suddenly has no signal.',
     'You receive an unexpected SIM-swap notification.',
     'Your banking details change unexpectedly.'
   ],
   'Call your mobile network from another phone immediately, then contact your bank.',
   '/scams/sim-swap-scam.png', 3),
  ('job', 'Job scams', 'Job offer that asks for a fee',
   'A supposed recruiter offers work, then asks for payment for training, equipment, or placement.',
   array[
     'The salary is unusually high for little information.',
     'They ask for money before you start work.',
     'The sender uses a free email address rather than the company domain.'
   ],
   'Do not pay or share ID documents. Verify the vacancy on the employer''s official website.',
   null, 4),
  ('market', 'Marketplace', 'Fake proof-of-payment',
   'A buyer sends a convincing payment confirmation and pressures you to release goods before funds clear.',
   array[
     'They insist on courier collection immediately.',
     'The payment email or screenshot looks unusual.',
     'Your banking app does not show cleared funds.'
   ],
   'Release goods only after cleared funds appear in your own banking app.',
   '/scams/fake-proof-of-payment-training-sample.png', 5),
  ('otp', 'Banking', 'One-time password (OTP) request',
   'Someone claiming to be from your bank asks for the code sent to your phone to approve or stop a transaction.',
   array[
     'They ask for an OTP, PIN, or banking-app approval.',
     'They create panic about fraud or a blocked account.',
     'They ask you to read the code aloud or enter it on a link.'
   ],
   'Your bank will not ask you to disclose an OTP. End the call, then contact the bank using its official number.',
   null, 6),
  ('delivery', 'Phishing', 'Fake parcel or delivery notification',
   'A text or email says a parcel is delayed and asks you to pay a small fee or confirm delivery details.',
   array[
     'You were not expecting a parcel.',
     'The link does not match the courier''s official website.',
     'A small payment is requested to collect card details.'
   ],
   'Do not open the link. Track parcels only through the courier''s official app or website.',
   '/scams/fake-parcel-delivery.png', 7),
  ('sars', 'Phishing', 'Fake SARS refund or tax notice',
   'A message claims you are due a tax refund or owe money and directs you to a website or attachment.',
   array[
     'The message uses a strange email address or shortened link.',
     'It asks for banking credentials or an upfront payment.',
     'The language is urgent or contains unusual errors.'
   ],
   'Do not use the message link. Sign in through the official SARS eFiling service or contact SARS directly.',
   null, 8),
  ('remote', 'Tech support', 'Remote-access or tech-support scam',
   'A caller says your phone or computer has a virus and asks you to install an app so they can fix it.',
   array[
     'The contact was unexpected.',
     'They ask you to install remote-control software.',
     'They request banking details, passwords, or a payment to clean your device.'
   ],
   'Hang up and uninstall any remote-access app you installed. Change passwords from a safe device and contact your bank if details were shared.',
   null, 9),
  ('loan', 'Financial scams', 'Advance-fee loan scam',
   'A lender promises an easy loan but asks for an administration, insurance, or release fee before paying out.',
   array[
     'Approval is guaranteed with no affordability checks.',
     'You must pay before receiving the loan.',
     'The lender cannot be verified through official channels.'
   ],
   'Do not pay a fee or share banking credentials. Verify financial service providers before applying.',
   null, 10),
  ('charity', 'Impersonation', 'Charity or disaster-relief impersonation',
   'Fraudsters use a real charity''s name after an emergency and ask for donations through personal accounts or links.',
   array[
     'The request is sent by an unfamiliar account.',
     'They insist on payment to a personal number or wallet.',
     'The campaign cannot be found on the charity''s official channels.'
   ],
   'Donate only through a verified charity website or established official account.',
   null, 11),
  ('boss', 'Impersonation', 'Boss or family emergency impersonation',
   'A scammer pretends to be your manager or a relative on a new number and asks for urgent money or vouchers.',
   array[
     'They say their phone is broken or they cannot talk.',
     'They demand secrecy and urgency.',
     'The request is out of character or asks for gift cards.'
   ],
   'Verify through a known phone number or in person before taking any action. Do not share vouchers or transfer funds.',
   null, 12)
on conflict (slug) do nothing;
