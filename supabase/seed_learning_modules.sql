-- CyberSafe Learn Security module content
-- Run this file in the Supabase SQL Editor while connected to the project database.
-- It preserves existing module IDs (and therefore existing quizzes) when a module
-- has the same title. It does not create or replace any quiz questions.

begin;

alter table public.modules add column if not exists category text;

create temporary table learning_module_seed (
  slug text,
  title text,
  description text,
  content text,
  difficulty text,
  category text,
  order_index int,
  estimated_minutes int
) on commit drop;

insert into learning_module_seed (
  slug, title, description, content, difficulty, category, order_index, estimated_minutes
) values
(
  'password-security-basics',
  'Password Security Basics',
  'Learn how to create, manage, and protect strong passwords.',
  E'WHY THIS MATTERS\nA reused or predictable password can let one data breach expose several of your accounts. A long, unique passphrase makes each account harder to access.\n\nSCENARIO\nA giveaway site asks you to use the same password as your school email account.\n\nWARNING SIGNS\n• A website asks you to reuse an important password.\n• A password is short, predictable, or based on personal information.\n• Two-factor authentication is not enabled.\n\nPRACTICAL ACTIONS\n1. Use a unique, long password or passphrase for every important account.\n2. Turn on two-factor authentication, preferably with an authenticator app.\n3. Use a trusted password manager instead of saving passwords in chats or notes.\n\nKEY TAKEAWAY\nUse a different strong password for every important account and protect it with two-factor authentication.',
  'Beginner', 'Social engineering', 1, 10
),
(
  'phishing-awareness',
  'Phishing Awareness',
  'Learn how to identify common phishing attempts and avoid falling for them.',
  E'WHY THIS MATTERS\nPhishing messages imitate trusted organisations to steal login or payment information. A message can look convincing while its sender address, link, or urgency reveals the scam.\n\nSCENARIO\nAn email says your parcel is waiting and asks you to pay a small fee through a shortened link.\n\nWARNING SIGNS\n• An unexpected payment or account warning.\n• A shortened or misspelled web address.\n• Threats that a parcel or account will be lost soon.\n\nPRACTICAL ACTIONS\n1. Check the sender address and website independently before acting.\n2. Do not enter card or login details after following an unexpected link.\n3. Visit the company website or app yourself to verify the message.\n\nKEY TAKEAWAY\nDo not trust a link just because the message looks familiar; verify through the real company website.',
  'Beginner', 'Social engineering', 2, 10
),
(
  'whatsapp-account-safety',
  'Protect Your WhatsApp Account',
  'Keep your WhatsApp account secure from verification-code and takeover scams.',
  E'WHY THIS MATTERS\nA WhatsApp verification code proves that somebody is trying to register your phone number on another device. Sharing it can give a scammer control of your account, contacts, and conversations.\n\nSCENARIO\nA contact says they accidentally sent their WhatsApp code to you and asks you to forward it.\n\nWARNING SIGNS\n• A request for a six-digit code.\n• A friend acting unusually urgent.\n• A verification message you did not request.\n\nPRACTICAL ACTIONS\n1. Never share a verification code, even with someone you know.\n2. Enable WhatsApp two-step verification and add a recovery email.\n3. Tell the real contact through another channel if their account may be compromised.\n\nKEY TAKEAWAY\nVerification codes are private—never forward them, even to a friend or family member.',
  'Beginner', 'Social engineering', 3, 15
),
(
  'banking-safety-essentials',
  'Banking Safety Essentials',
  'Protect your banking details and respond safely to suspicious alerts.',
  E'WHY THIS MATTERS\nCriminals copy bank branding and create urgency so that you act before checking the message. A legitimate bank will never need your PIN, password, card details, or one-time password over SMS, email, or a phone call.\n\nSCENARIO\nYou receive an SMS saying your banking profile will be blocked unless you approve a request immediately.\n\nWARNING SIGNS\n• Pressure to act immediately.\n• A link that does not use your bank''s official app or website.\n• Any request for a PIN, password, or OTP.\n\nPRACTICAL ACTIONS\n1. Open your official banking app directly; never use the unexpected message link.\n2. Call the number on the back of your bank card if you are unsure.\n3. Never share a PIN, password, card number, or OTP.\n\nKEY TAKEAWAY\nSlow down: use your official banking app or a verified bank number, not the message link.',
  'Beginner', 'Banking', 4, 30
),
(
  'sim-swap-response',
  'Stop a SIM-Swap Attack',
  'Know the early warning signs and urgent steps that protect your accounts.',
  E'WHY THIS MATTERS\nIn a SIM-swap attack, criminals try to move your phone number to their SIM card. They may then receive SMS verification codes used to reset banking, email, or social-media accounts.\n\nSCENARIO\nYour phone suddenly loses signal and you receive a notification that a SIM swap was requested.\n\nWARNING SIGNS\n• Unexpected loss of mobile signal.\n• A SIM-swap notification you did not request.\n• Password-reset messages or bank alerts you did not trigger.\n\nPRACTICAL ACTIONS\n1. Call your mobile network from another phone immediately.\n2. Contact your bank and secure accounts that use SMS verification.\n3. Change important passwords from a safe device if you suspect account access.\n\nKEY TAKEAWAY\nTreat an unexplained loss of signal as urgent: call your network and bank from another phone.',
  'Intermediate', 'Banking', 5, 20
),
(
  'safe-online-shopping',
  'Shop and Sell Safely Online',
  'Recognise payment, delivery, and marketplace scams before you lose money.',
  E'WHY THIS MATTERS\nOnline marketplace scams commonly use fake proof of payment, fake couriers, or a promise that money will reflect later. A screenshot can be edited; only cleared funds visible in your own banking app confirm payment.\n\nSCENARIO\nA buyer sends a payment screenshot and asks a courier to collect your item before the money reflects.\n\nWARNING SIGNS\n• Pressure to release an item quickly.\n• A payment screenshot instead of cleared funds.\n• A buyer arranging an unfamiliar courier.\n\nPRACTICAL ACTIONS\n1. Only release goods after cleared funds appear in your official banking app.\n2. Do not trust payment screenshots or emails alone.\n3. Keep conversations and payments on the marketplace where possible.\n\nKEY TAKEAWAY\nA screenshot is not payment—release goods only after cleared funds show in your account.',
  'Beginner', 'Banking', 6, 20
),
(
  'digital-safety-schools',
  'Digital Safety for Schools',
  'Build safer habits for shared devices, learning platforms, and class groups.',
  E'WHY THIS MATTERS\nShared devices can be useful for learning, but they are not private. Saved passwords, open browser sessions, and public class chats can expose a learner''s account or personal information.\n\nSCENARIO\nA learner logs in to a shared school computer and sees a browser prompt asking to save their password.\n\nWARNING SIGNS\n• A browser offering to save a password on a shared computer.\n• An account still logged in after a lesson.\n• Unknown links posted in a class group.\n\nPRACTICAL ACTIONS\n1. Sign out fully and do not save passwords on shared devices.\n2. Use only trusted school platforms and report suspicious prompts to an educator.\n3. Keep personal details out of public class chats and posts.\n\nKEY TAKEAWAY\nOn a shared device, sign out completely and never save your password in the browser.',
  'Beginner', 'School resources', 7, 25
),
(
  'safe-online-research',
  'Safe Online Research',
  'Check sources, avoid misinformation, and use online information responsibly.',
  E'WHY THIS MATTERS\nFalse or misleading information spreads quickly when it creates fear, anger, or urgency. Checking who published a claim, when it was published, and whether reliable sources confirm it helps stop misinformation.\n\nSCENARIO\nA class group shares a shocking cybercrime post and asks everyone to repost it immediately.\n\nWARNING SIGNS\n• A demand to share before it is deleted.\n• No named or reliable source.\n• Old information presented as a new emergency.\n\nPRACTICAL ACTIONS\n1. Check the source, author, and publication date before sharing.\n2. Use official or recognised organisations to confirm important claims.\n3. Pause before reposting content designed to create fear or urgency.\n\nKEY TAKEAWAY\nPause before sharing: check the source, date, and evidence first.',
  'Beginner', 'School resources', 8, 20
),
(
  'public-wifi-safety',
  'Stay Safe on Public Wi-Fi',
  'Use public networks more safely and avoid risky prompts and logins.',
  E'WHY THIS MATTERS\nPublic Wi-Fi can be convenient, but you do not control who runs the network or what they can see. Fake Wi-Fi names and malicious sign-in pages may try to collect data or install software on your device.\n\nSCENARIO\nYou connect to free Wi-Fi and a pop-up asks you to install a security certificate.\n\nWARNING SIGNS\n• A network name that looks almost like the real venue.\n• A request to install a profile, certificate, or app.\n• A public connection asking for banking credentials.\n\nPRACTICAL ACTIONS\n1. Avoid banking and sensitive logins on untrusted public Wi-Fi.\n2. Do not install unknown apps, profiles, or certificates.\n3. Forget the network when you are finished and use mobile data for important tasks.\n\nKEY TAKEAWAY\nUse public Wi-Fi for low-risk browsing only; use mobile data for banking and private accounts.',
  'Beginner', 'School resources', 9, 15
),
(
  'cyberbullying-support',
  'Respond to Cyberbullying Safely',
  'Support yourself or others without spreading harmful content further.',
  E'WHY THIS MATTERS\nCyberbullying can spread beyond the original post when others comment, repost, or share screenshots. Keeping evidence for a report is helpful, but public sharing can make the harm worse.\n\nSCENARIO\nSomeone posts hurtful messages about a learner and asks others to share screenshots.\n\nWARNING SIGNS\n• Repeated hurtful messages or threats.\n• Pressure to share embarrassing content.\n• A post encouraging others to target someone.\n\nPRACTICAL ACTIONS\n1. Save evidence privately without amplifying the harmful post.\n2. Block and report the account using the platform tools.\n3. Tell a trusted adult, educator, or support person as soon as possible.\n\nKEY TAKEAWAY\nDo not amplify harm—save evidence privately, report it, and get support from a trusted adult.',
  'Beginner', 'School resources', 10, 25
),
(
  'personal-information',
  'Protect Your Personal Information',
  'Know what information to keep private and how identity scams begin.',
  E'WHY THIS MATTERS\nIdentity scammers collect small pieces of personal information—such as an ID number, address, date of birth, and verification code—to impersonate you or take over accounts.\n\nSCENARIO\nA caller claiming to be from a service provider asks for your ID number and OTP to confirm an upgrade.\n\nWARNING SIGNS\n• An unexpected request for your ID number or OTP.\n• A caller asking you to keep the request secret.\n• A link requesting a photo of an identity document.\n\nPRACTICAL ACTIONS\n1. Do not provide OTPs or identity details during an unexpected call.\n2. Verify requests through an official number or website you find yourself.\n3. Review privacy settings and avoid posting sensitive documents online.\n\nKEY TAKEAWAY\nKeep identity details and OTPs private, then verify any request using an official channel.',
  'Beginner', 'Social engineering', 11, 20
),
(
  'safe-job-search',
  'Find Jobs Safely Online',
  'Avoid fake job offers, recruitment fees, and identity-harvesting scams.',
  E'WHY THIS MATTERS\nFake job adverts exploit people who are looking for work. Scammers may copy a company name, promise an easy job, then request a payment or personal documents before a genuine interview begins.\n\nSCENARIO\nA recruiter offers you a job but asks for a training fee and a copy of your ID before an interview.\n\nWARNING SIGNS\n• A job offer without a real interview.\n• A request for a fee, voucher, or payment.\n• An email address that does not match the employer''s official website.\n\nPRACTICAL ACTIONS\n1. Never pay an upfront fee to secure a job opportunity.\n2. Verify vacancies on the employer''s official website or verified channels.\n3. Share only the information needed for a legitimate application.\n\nKEY TAKEAWAY\nA genuine employer will not ask you to pay money to secure a job opportunity.',
  'Beginner', 'Social engineering', 12, 20
);

-- Update the two existing database modules by title so their current quizzes
-- remain connected to the same module IDs.
update public.modules as module
set
  slug = seed.slug,
  description = seed.description,
  content = seed.content,
  difficulty = seed.difficulty,
  category = seed.category,
  order_index = seed.order_index,
  estimated_minutes = seed.estimated_minutes
from learning_module_seed as seed
where lower(module.title) = lower(seed.title);

-- Add the remaining modules. The title check prevents duplicate cards when
-- this file is run more than once.
insert into public.modules (
  slug, title, description, content, difficulty, category, order_index, estimated_minutes
)
select
  seed.slug, seed.title, seed.description, seed.content, seed.difficulty,
  seed.category, seed.order_index, seed.estimated_minutes
from learning_module_seed as seed
where not exists (
  select 1 from public.modules as module
  where lower(module.title) = lower(seed.title)
);

commit;

-- Verify the module-to-quiz connection. Existing Password Security Basics and
-- Phishing Awareness quizzes should remain connected; the other modules will
-- show a null quiz_id until a matching Quizz record is created.
select
  module.id as module_id,
  module.slug,
  module.title as module_title,
  module.category,
  module.order_index,
  quiz.id as quiz_id,
  quiz."Title" as quiz_title
from public.modules as module
left join public."Quizz" as quiz on quiz.module_id = module.id
order by module.order_index, module.title;
