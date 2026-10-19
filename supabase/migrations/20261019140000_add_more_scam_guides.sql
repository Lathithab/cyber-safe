-- Additional text-first guides in the Scam Library's existing categories.
-- example_image_path is optional, so it is omitted and remains NULL.
insert into public.scam_guides
  (slug, category, title, summary, warning_signs, recommended_action, published, sort_order)
values
  (
    'whatsapp-linked-device', 'WhatsApp', 'WhatsApp linked-device takeover scam',
    'Someone impersonating support, a competition organiser, or a person you know asks you to scan a QR code or enter a linking code. This can connect their device to your account so they can read messages and impersonate you.',
    array[
      'A stranger says your account needs verification or offers help recovering it.',
      'You are asked to scan a QR code or share a device-linking code you did not request.',
      'A contact sends an unusual link or request, especially from an account that may be compromised.',
      'An unfamiliar device appears in WhatsApp’s Linked devices list.'
    ],
    'Do not scan a code or share a verification or linking code at someone else’s request. Open WhatsApp yourself, review Settings → Linked devices, and log out any device you do not recognise. If you lose access, register your number again in the official app, secure your voicemail and email, and warn contacts through another channel.',
    true, 17
  ),
  (
    'safe-account-transfer', 'Banking', '“Move your money to a safe account” scam',
    'A caller claims to be from your bank’s fraud team and says your account is under attack. They pressure you to transfer money to a supposedly safe account, share a one-time PIN, or approve a transaction that actually sends money to the scammer.',
    array[
      'The caller unexpectedly reports urgent fraud and insists you act while on the phone.',
      'They tell you to transfer funds to another account, even one described as belonging to the bank or police.',
      'They ask for your PIN, password, one-time PIN, or banking-app approval.',
      'They discourage you from ending the call to contact your bank independently.'
    ],
    'Do not transfer money, disclose codes, or approve a request you did not initiate. End the call and contact your bank using the number on your card or in its official app. If you have already transferred funds or shared access, call the bank immediately and keep the caller’s number, messages, and transaction details.',
    true, 18
  ),
  (
    'sim-upgrade', 'SIM swap', 'Fake SIM upgrade or number-porting scam',
    'A caller or message claims that your SIM needs an urgent upgrade, replacement, or number transfer. They ask for identity details or a one-time code, then use the information to take control of your number and intercept calls or SMS messages.',
    array[
      'You receive an unexpected request to confirm a SIM replacement or number port.',
      'Someone asks you to read out a network verification code or send a copy of your identity document.',
      'You are pressured to act quickly to avoid losing your number or service.',
      'Your phone suddenly loses service or you receive a SIM-change notification you did not request.'
    ],
    'Do not share a network verification code or identity documents through an unsolicited call or message. Contact your mobile network through its official app, website, or a number you find independently to verify any change. If your service stops unexpectedly, use another phone to contact the network and your bank immediately, then secure email and financial accounts.',
    true, 19
  ),
  (
    'task-job-scam', 'Job scams', 'Fake online task or rating job',
    'A recruiter offers easy online work such as rating products, liking videos, or completing small tasks for unusually high pay. After showing fake earnings, they demand a deposit or “recharge” to unlock tasks or withdraw the money.',
    array[
      'The job promises high returns for simple clicks, ratings, or short tasks.',
      'You are asked to deposit money, buy cryptocurrency, or pay to unlock work or withdraw earnings.',
      'The recruiter moves the conversation to an unofficial messaging group and cannot be verified with an employer.',
      'A dashboard shows earnings, but withdrawals require another payment or fee.'
    ],
    'Do not pay to access work or withdraw supposed earnings, and do not install apps from links sent by a recruiter. Verify the company and vacancy through contact details on its official website. If you deposited money or shared credentials, contact your bank or payment provider promptly and preserve the messages and transaction records.',
    true, 20
  ),
  (
    'rental-deposit', 'Marketplace', 'Fake rental listing and deposit scam',
    'A convincing property listing advertises a room or flat at an attractive price. The person claiming to be the landlord says there are many applicants and asks for a deposit or viewing fee before you can inspect the property or confirm they have authority to rent it.',
    array[
      'The rent is unusually low or the listing uses copied photos and vague details.',
      'The advertiser is unavailable for an in-person or live video viewing and gives a reason to stay away.',
      'You are pressured to pay a deposit or viewing fee before seeing the property or signing verified documents.',
      'Payment is requested into a personal account with a different name from the purported landlord or agency.'
    ],
    'Do not pay before viewing the property and independently confirming the landlord or agent’s authority. Verify the address and agency using contact details you find yourself, read the lease, and get a receipt for any legitimate payment. If you have paid, contact your bank immediately and report the listing to the platform.',
    true, 21
  ),
  (
    'prepaid-electricity-token', 'Phishing', 'Prepaid electricity token or meter-reset scam',
    'A message or social-media post claims you can get discounted electricity, a refund, or a free token if you follow a link or contact an agent. The scammer may collect payment, banking details, or a one-time PIN, or send a token that does not work.',
    array[
      'The offer arrives unexpectedly and promises free electricity, a refund, or a large discount.',
      'You are directed to an unfamiliar payment page, personal account, or messaging number.',
      'The seller asks for your banking password, card details, or one-time PIN to issue a token.',
      'The offer cannot be confirmed with your municipality or authorised electricity reseller.'
    ],
    'Buy tokens only through your municipality or a provider you independently verify. Do not share banking passwords or one-time PINs to receive a token. Confirm meter or account changes with the relevant authority through its official contact details; if you paid or shared financial information, contact your bank promptly.',
    true, 22
  ),
  (
    'guaranteed-investment-returns', 'Financial scams', 'Guaranteed-return investment or crypto scam',
    'A promoter advertises unusually high or guaranteed returns from forex, cryptocurrency, or an exclusive investment group. Early account screens or small withdrawals may look convincing, but later you are asked to invest more or pay fees before withdrawing supposed profits.',
    array[
      'Returns are described as guaranteed, risk-free, or unusually high in a short time.',
      'You are pressured to act quickly or recruit friends and family.',
      'The promoter asks you to send money or cryptocurrency to a personal wallet or unfamiliar platform.',
      'You must pay tax, an unlock fee, or another deposit before you can withdraw.'
    ],
    'Pause before investing and independently verify the company and its regulatory status with the relevant South African financial regulator. Do not rely on testimonials, screenshots, or endorsements in a chat group, and never pay an extra fee to release supposed profits without verification. If you sent money, contact your bank or exchange immediately and preserve wallet addresses and messages.',
    true, 23
  ),
  (
    'grant-verification-impersonation', 'Impersonation', 'Fake government grant verification message',
    'A message or social-media account impersonates a government department or grant service and says you must re-verify, renew, or collect a payment. A link may steal identity and banking details, or the sender may ask for a fee or one-time PIN to release the grant.',
    array[
      'The message promises a new grant or payment and asks you to apply through an unexpected link.',
      'It threatens that an existing benefit will stop unless you act immediately.',
      'The page asks for a one-time PIN, online-banking password, card details, or an upfront fee.',
      'The announcement cannot be confirmed through the relevant department’s official channels.'
    ],
    'Do not use the message link, pay a release fee, or share a one-time PIN. Check grant information directly with the responsible department or agency using contact details you find on its official website or at a service office. If you shared identity or banking details, contact your bank and the relevant agency promptly, and keep the message for reporting.',
    true, 24
  )
on conflict (slug) do nothing;
