-- CyberSafe quizzes for the ten newly added learning modules.
-- Run the entire file in Supabase SQL Editor after seed_learning_modules.sql.
-- Existing Password Security and Phishing quizzes are not changed.

alter table public.quiz_questions
  add column if not exists quizz_id bigint references public."Quizz"(id) on delete cascade;

with quiz_seed (slug, quiz_title, quiz_description) as (
  values
    ('whatsapp-account-safety', 'WhatsApp Account Safety Quiz', 'Test your understanding of WhatsApp verification and takeover scams.'),
    ('banking-safety-essentials', 'Banking Safety Essentials Quiz', 'Test your ability to recognise and respond to banking scams.'),
    ('sim-swap-response', 'SIM-Swap Response Quiz', 'Test your knowledge of urgent SIM-swap safety steps.'),
    ('safe-online-shopping', 'Safe Online Shopping Quiz', 'Test your ability to recognise online marketplace scams.'),
    ('digital-safety-schools', 'Digital Safety for Schools Quiz', 'Test safer habits for shared devices and learning platforms.'),
    ('safe-online-research', 'Safe Online Research Quiz', 'Test your ability to check online information before sharing.'),
    ('public-wifi-safety', 'Public Wi-Fi Safety Quiz', 'Test safer choices when using public Wi-Fi.'),
    ('cyberbullying-support', 'Cyberbullying Safety Quiz', 'Test safe and supportive responses to cyberbullying.'),
    ('personal-information', 'Personal Information Safety Quiz', 'Test your ability to protect personal information and OTPs.'),
    ('safe-job-search', 'Safe Job Search Quiz', 'Test your ability to recognise fake job offers.')
)
insert into public."Quizz" ("Title", module_id, "Tier", "Description")
select seed.quiz_title, module.id, module.difficulty::public."Tier", seed.quiz_description
from quiz_seed as seed
join public.modules as module on module.slug = seed.slug
where not exists (
  select 1 from public."Quizz" as quiz where quiz.module_id = module.id
);

with question_seed (slug, question, options, correct_index, explanation, order_index) as (
  values
    ('whatsapp-account-safety', 'What should you do if someone asks you to forward a WhatsApp verification code?', jsonb_build_array('Forward it if they are a friend', 'Keep the code private and do not send it', 'Post it in a group for advice', 'Reply with your password instead'), 1, 'Verification codes can be used to register your WhatsApp number on another device. Never share them.', 1),
    ('whatsapp-account-safety', 'Which setting adds an extra layer of protection to your WhatsApp account?', jsonb_build_array('Two-step verification', 'Read receipts', 'A profile photo', 'Dark mode'), 0, 'Two-step verification adds a PIN that helps protect your account from takeovers.', 2),
    ('whatsapp-account-safety', 'A friend sends an urgent message asking for money from a new number. What is the safest first step?', jsonb_build_array('Send the money quickly', 'Forward the message to everyone', 'Verify with the person using a known number or in person', 'Share your banking OTP'), 2, 'A compromised account or impersonator can use urgency. Verify through a trusted channel first.', 3),

    ('banking-safety-essentials', 'How should you check a suspicious banking alert?', jsonb_build_array('Tap the link in the SMS', 'Open your official banking app or call a verified number', 'Reply with your PIN', 'Forward it to a stranger'), 1, 'Use only your bank app or a verified contact number to check an alert.', 1),
    ('banking-safety-essentials', 'Which detail should never be shared with a caller claiming to be from your bank?', jsonb_build_array('A one-time password (OTP)', 'The bank branch name', 'Your first name', 'The date'), 0, 'Banks do not ask you to disclose OTPs, PINs, or passwords.', 2),
    ('banking-safety-essentials', 'Why do scam messages often create urgency?', jsonb_build_array('To help you compare options', 'To make you act before checking the message', 'To improve your phone signal', 'To update the banking app'), 1, 'Urgency is a social-engineering tactic designed to stop careful checking.', 3),

    ('sim-swap-response', 'What can be an early warning sign of a SIM-swap attack?', jsonb_build_array('Your phone has unexpected loss of signal', 'Your battery is full', 'Your Wi-Fi is fast', 'Your screen is bright'), 0, 'Unexpected loss of mobile service can mean your number was moved to another SIM.', 1),
    ('sim-swap-response', 'If you suspect a SIM swap, who should you contact first?', jsonb_build_array('Only a social-media contact', 'Your mobile network and bank from another phone', 'An online marketplace buyer', 'Nobody until tomorrow'), 1, 'Your mobile network can stop the SIM swap and your bank can protect account access.', 2),
    ('sim-swap-response', 'Why is a SIM swap dangerous for banking accounts?', jsonb_build_array('It changes your profile photo', 'Criminals may receive SMS verification codes', 'It improves network speed', 'It deletes all contacts automatically'), 1, 'Many accounts still use SMS codes for password resets and transaction approvals.', 3),

    ('safe-online-shopping', 'When should you release an item to an online buyer?', jsonb_build_array('After a payment screenshot arrives', 'After cleared funds appear in your own banking app', 'When a courier arrives', 'After the buyer promises to pay later'), 1, 'Only cleared funds in your own account confirm that payment was received.', 1),
    ('safe-online-shopping', 'Why is a payment screenshot not enough proof?', jsonb_build_array('Screenshots can be edited or belong to another transaction', 'They always show the wrong date', 'Banks never send receipts', 'Couriers cannot read them'), 0, 'A screenshot can be changed or unrelated to your account. Check your own bank app.', 2),
    ('safe-online-shopping', 'Which request is a warning sign in a marketplace sale?', jsonb_build_array('The buyer asks a normal question', 'The buyer pressures you to release goods before funds clear', 'The buyer uses a clear profile photo', 'The buyer says thank you'), 1, 'Pressure to release goods before payment clears is common in proof-of-payment scams.', 3),

    ('digital-safety-schools', 'What should you do after using a shared school computer?', jsonb_build_array('Save your password for the next lesson', 'Sign out completely', 'Leave your account open', 'Share your login with classmates'), 1, 'Always sign out and avoid saving passwords on a shared device.', 1),
    ('digital-safety-schools', 'What is safest when a browser asks to save your password on a shared device?', jsonb_build_array('Accept the prompt', 'Decline the prompt', 'Send the password to a group chat', 'Change the browser colour'), 1, 'Saved browser passwords could be used by the next person on the device.', 2),
    ('digital-safety-schools', 'What should you do with an unknown link posted in a class group?', jsonb_build_array('Open it immediately', 'Check it with a trusted educator or official source', 'Share it to other groups', 'Enter your school password'), 1, 'Unknown links may lead to phishing pages or harmful downloads.', 3),

    ('safe-online-research', 'What should you check before sharing an alarming online post?', jsonb_build_array('The source, author, date, and evidence', 'Only the number of likes', 'Whether it uses capital letters', 'Whether a friend shared it'), 0, 'Reliable research checks where information came from and whether evidence supports it.', 1),
    ('safe-online-research', 'Why can an old post be misleading?', jsonb_build_array('It may be presented as a new emergency', 'It cannot contain any words', 'It always has fewer likes', 'It cannot be shared'), 0, 'Old events are often reposted without context to create unnecessary panic.', 2),
    ('safe-online-research', 'Which source is best for confirming an important safety claim?', jsonb_build_array('An anonymous forwarded message', 'An official organisation or recognised reliable source', 'A random comment', 'A post with the most emojis'), 1, 'Official and recognised sources are more likely to provide accurate, current information.', 3),

    ('public-wifi-safety', 'Which activity should you avoid on unknown public Wi-Fi?', jsonb_build_array('Reading public news', 'Banking or signing in to sensitive accounts', 'Looking at a restaurant menu', 'Checking the weather'), 1, 'Use a trusted connection or mobile data for banking and private accounts.', 1),
    ('public-wifi-safety', 'A public Wi-Fi page asks you to install a certificate. What should you do?', jsonb_build_array('Install it immediately', 'Do not install it and leave the network if unsure', 'Share it with friends', 'Enter your banking password'), 1, 'Unknown profiles and certificates can change how your device handles secure traffic.', 2),
    ('public-wifi-safety', 'Why can a Wi-Fi name be suspicious?', jsonb_build_array('A scammer can create a name that almost matches the real venue', 'Real venues never offer Wi-Fi', 'Wi-Fi names cannot contain spaces', 'Phones cannot connect to Wi-Fi'), 0, 'Criminals can create lookalike network names to attract users.', 3),

    ('cyberbullying-support', 'What is a safe first response to cyberbullying?', jsonb_build_array('Share the harmful post widely', 'Save evidence privately, report it, and seek support', 'Reply with another insult', 'Delete all your accounts immediately'), 1, 'Keep evidence for a report without spreading harmful material further.', 1),
    ('cyberbullying-support', 'Why should screenshots of harmful content not be shared publicly?', jsonb_build_array('They can amplify the harm and remove privacy', 'They use too much phone storage', 'They cannot be reported', 'They are always fake'), 0, 'Sharing screenshots can keep harmful content circulating and worsen the impact.', 2),
    ('cyberbullying-support', 'Who can help after cyberbullying occurs?', jsonb_build_array('A trusted adult, educator, or support person', 'Only the person posting abuse', 'Nobody', 'A marketplace courier'), 0, 'Getting support early can help stop the behaviour and protect the person affected.', 3),

    ('personal-information', 'Which detail should you never provide on an unexpected call?', jsonb_build_array('A one-time password (OTP)', 'Your favourite colour', 'A public business name', 'The weather'), 0, 'OTPs can approve transactions or reset accounts and must remain private.', 1),
    ('personal-information', 'How should you verify an unexpected service-provider request?', jsonb_build_array('Use the caller''s link', 'Contact the provider using an official number or website you find yourself', 'Send a photo of your ID', 'Share a password first'), 1, 'Independent verification prevents scammers from directing you to fake channels.', 2),
    ('personal-information', 'Why do scammers request small personal details?', jsonb_build_array('They can combine details to impersonate you or take over accounts', 'They want to improve your profile photo', 'They need to repair your Wi-Fi', 'They can change your phone wallpaper'), 0, 'Small pieces of information can be combined for identity fraud.', 3),

    ('safe-job-search', 'Which request is a major warning sign in a job offer?', jsonb_build_array('A request to pay a fee before starting work', 'A clear interview invitation', 'A company website', 'A job description'), 0, 'Legitimate employers do not charge you upfront to secure a job.', 1),
    ('safe-job-search', 'How can you verify a job vacancy?', jsonb_build_array('Check the employer''s official website or verified channels', 'Trust any message with a logo', 'Pay a recruiter immediately', 'Share your banking OTP'), 0, 'Use official employer channels to check whether a vacancy is genuine.', 2),
    ('safe-job-search', 'What information should you share in an early job application?', jsonb_build_array('Only information genuinely needed for a legitimate application', 'Your banking PIN', 'Every identity document and OTP', 'Money for a training fee'), 0, 'Limit personal information until you have verified the employer and opportunity.', 3)
)
insert into public.quiz_questions (
  quizz_id, question, options, correct_index, explanation, order_index
)
select
  quiz.id, seed.question, seed.options, seed.correct_index,
  seed.explanation, seed.order_index
from question_seed as seed
join public.modules as module on module.slug = seed.slug
join public."Quizz" as quiz on quiz.module_id = module.id
where not exists (
  select 1
  from public.quiz_questions as existing_question
  where existing_question.quizz_id = quiz.id
    and existing_question.order_index = seed.order_index
);

-- Questions four and five for each new module. Keeping these in a second
-- insert makes the five-question structure easy to review and rerun safely.
with extension_question_seed (slug, question, options, correct_index, explanation, order_index) as (
  values
    ('whatsapp-account-safety', 'What should you do if your WhatsApp account is taken over?', jsonb_build_array('Tell contacts through another channel and secure the account', 'Ignore it for a week', 'Share more verification codes', 'Create a public post with your OTP'), 0, 'Warn contacts so they do not trust scam messages from the compromised account, then follow WhatsApp recovery steps.', 4),
    ('whatsapp-account-safety', 'Which message is most likely a scam?', jsonb_build_array('Your friend asks you to share a code sent to your phone', 'A contact says hello', 'A family group shares a photo', 'A friend sends a birthday wish'), 0, 'A request for a verification code is a common WhatsApp takeover tactic.', 5),

    ('banking-safety-essentials', 'What should you do if you think banking details have been shared with a scammer?', jsonb_build_array('Call your bank immediately using a verified number', 'Wait for the scammer to call again', 'Share another OTP', 'Delete the SMS only'), 0, 'Contacting the bank quickly gives it the best chance to secure your accounts and stop transactions.', 4),
    ('banking-safety-essentials', 'Which source should you use to find a bank contact number?', jsonb_build_array('The number on the back of your card or official website', 'The number in an unexpected SMS', 'A number sent by a stranger', 'A social-media comment'), 0, 'Use a contact number you obtained independently from a trusted official source.', 5),

    ('sim-swap-response', 'What should you avoid doing after a suspected SIM swap?', jsonb_build_array('Sharing any verification codes that arrive', 'Calling your mobile network', 'Contacting your bank', 'Using another phone to get help'), 0, 'Do not share verification codes; criminals may be trying to use them to access your accounts.', 4),
    ('sim-swap-response', 'Which account is especially important to secure after a SIM swap?', jsonb_build_array('Your banking and email accounts', 'Only a weather app', 'A wallpaper app', 'A calculator'), 0, 'Email and banking accounts can be used to reset access to many other services.', 5),

    ('safe-online-shopping', 'What should you do if a buyer says funds will reflect later?', jsonb_build_array('Wait until cleared funds appear before releasing the item', 'Release the item because they sound convincing', 'Send the buyer your banking password', 'Cancel your bank card immediately'), 0, 'Only your own banking app can confirm cleared payment.', 4),
    ('safe-online-shopping', 'Which payment method gives a seller the most reliable confirmation?', jsonb_build_array('Cleared funds shown in the seller''s own bank account', 'A buyer''s edited screenshot', 'A message saying payment is pending', 'A courier''s promise'), 0, 'A seller should verify payment independently in their own account.', 5),

    ('digital-safety-schools', 'What should a learner do if someone asks for their school password?', jsonb_build_array('Keep it private and report suspicious requests', 'Share it with the person', 'Post it in a class group', 'Write it on a shared computer'), 0, 'Passwords are personal; suspicious requests should be reported to a trusted educator or support person.', 4),
    ('digital-safety-schools', 'Why should learners avoid posting personal details in public class chats?', jsonb_build_array('Details can be copied, misused, or shared beyond the group', 'Public chats automatically delete all details', 'It makes Wi-Fi slower', 'It changes the homework deadline'), 0, 'Public or large groups can expose personal information to people outside the intended audience.', 5),

    ('safe-online-research', 'What is a useful way to check whether a claim is reliable?', jsonb_build_array('Compare it with more than one trusted source', 'Share it before checking', 'Trust it because it is urgent', 'Use only the headline'), 0, 'Cross-checking with reliable sources helps identify misinformation.', 4),
    ('safe-online-research', 'What should you do if you cannot verify a claim?', jsonb_build_array('Do not share it as fact', 'Add a stronger headline', 'Send it to every group', 'Assume it is true'), 0, 'Unverified claims should not be passed on as reliable information.', 5),

    ('public-wifi-safety', 'What should you do when you finish using a public Wi-Fi network?', jsonb_build_array('Forget the network if you do not need it again', 'Save the password in a public post', 'Leave banking apps open', 'Install unknown certificates'), 0, 'Forgetting a public network reduces automatic reconnection to an unsafe or fake network later.', 4),
    ('public-wifi-safety', 'Which connection is safer for an urgent banking task away from home?', jsonb_build_array('Your mobile data connection', 'An unknown free Wi-Fi network', 'A network asking for a certificate', 'A suspicious hotspot with a familiar name'), 0, 'Mobile data is generally safer than an untrusted public Wi-Fi connection for sensitive tasks.', 5),

    ('cyberbullying-support', 'What should you do if you receive a threatening message online?', jsonb_build_array('Save the evidence and tell a trusted adult or support person', 'Delete all evidence before reporting', 'Reply with a threat', 'Share it publicly'), 0, 'Evidence can help a school, platform, or trusted adult understand and act on the problem.', 4),
    ('cyberbullying-support', 'Which platform action can help stop continued abuse?', jsonb_build_array('Block and report the account', 'Give the account your password', 'Follow the account', 'Share its posts'), 0, 'Blocking and reporting are designed to limit contact and alert the platform to harmful behaviour.', 5),

    ('personal-information', 'Which item is safest to keep out of a public social-media post?', jsonb_build_array('A photo of an identity document', 'A general hobby', 'A public event poster', 'A book recommendation'), 0, 'Identity documents contain information that can be used for identity fraud.', 4),
    ('personal-information', 'What should you do when an unexpected message asks you to confirm personal details?', jsonb_build_array('Verify independently before responding', 'Reply with all requested details', 'Send an OTP to prove it is you', 'Click every link in the message'), 0, 'Independent verification prevents a scammer from controlling the channel you use to check them.', 5),

    ('safe-job-search', 'Why is a free email address a possible warning sign in a job offer?', jsonb_build_array('It may not match the employer''s official domain', 'All real employers use free addresses', 'It guarantees a job is genuine', 'It makes interviews shorter'), 0, 'A mismatch between the claimed employer and email domain is worth checking carefully.', 4),
    ('safe-job-search', 'What should you do if a recruiter demands a payment before an interview?', jsonb_build_array('Do not pay; verify the employer through official channels', 'Pay quickly to secure the role', 'Share your banking OTP', 'Send a photo of your bank card'), 0, 'Upfront recruitment fees are a major warning sign of a job scam.', 5)
)
insert into public.quiz_questions (
  quizz_id, question, options, correct_index, explanation, order_index
)
select
  quiz.id, seed.question, seed.options, seed.correct_index,
  seed.explanation, seed.order_index
from extension_question_seed as seed
join public.modules as module on module.slug = seed.slug
join public."Quizz" as quiz on quiz.module_id = module.id
where not exists (
  select 1
  from public.quiz_questions as existing_question
  where existing_question.quizz_id = quiz.id
    and existing_question.order_index = seed.order_index
);

-- Verify: each new module should have one quiz and five questions.
select
  module.title as module_title,
  quiz."Title" as quiz_title,
  count(question.id) as question_count
from public.modules as module
left join public."Quizz" as quiz on quiz.module_id = module.id
left join public.quiz_questions as question on question.quizz_id = quiz.id
where module.order_index between 3 and 12
group by module.title, quiz."Title", module.order_index
order by module.order_index;
