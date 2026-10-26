-- Make the Scam Library consistently text-first and expand every built-in guide.
-- Existing image files are intentionally left in Storage; only their guide references are cleared.

update public.scam_guides
set example_image_path = null,
    updated_at = now()
where example_image_path is not null;

update public.scam_guides as guide
set summary = content.summary,
    warning_signs = content.warning_signs,
    recommended_action = content.recommended_action,
    example_image_path = null,
    updated_at = now()
from (values
  (
    'whatsapp',
    'You receive a WhatsApp verification code you did not request. Soon after, someone claiming to be a friend or family member says the code was sent to them by mistake and asks you to forward it. The code is actually for your account, and sharing it can let someone register your number on another device.',
    array[
      'A person asks you to forward a six-digit code or read it aloud.',
      'They create urgency or claim they need the code to fix a mistake.',
      'The request comes from a contact whose account may already be taken over.',
      'You receive a login or registration code that you did not request.'
    ]::text[],
    'Never share a verification code, even with someone you know. If you shared it, try to register your number in WhatsApp again, turn on two-step verification when you regain access, and warn your contacts through another channel. Review linked devices and remove any you do not recognise.'
  ),
  (
    'bank',
    'A text or email claims there is a suspicious payment, an account block, or a security problem. It urges you to open a link to “secure” your account, where a fake page may ask for your login, card details, PIN, or one-time code.',
    array[
      'The message is unexpected and pressures you to act immediately.',
      'The sender or link does not match contact details you independently know to be your bank’s.',
      'The page asks for a PIN, password, full card details, or one-time PIN.',
      'The message says you must move money to a “safe” account or install an app.'
    ]::text[],
    'Do not open the link, reply, or approve a transaction you did not initiate. Open your banking app yourself or call the number printed on your card. If you entered details or approved a payment, contact your bank immediately using a verified number and follow its instructions to secure the account.'
  ),
  (
    'sim',
    'Your phone suddenly loses mobile service, and calls or messages stop arriving. A scammer may have persuaded your mobile network to move your number to a SIM they control, allowing them to receive calls and one-time codes meant for you.',
    array[
      'Your SIM unexpectedly shows no service or stops receiving calls and SMS.',
      'You receive an unfamiliar SIM-swap or number-transfer notification.',
      'Banking or email password-reset messages arrive that you did not request.',
      'You lose access to accounts shortly after the mobile service interruption.'
    ]::text[],
    'Use another phone to contact your mobile network immediately and ask it to secure or restore your number. Contact your bank using a verified number, secure your email and financial accounts from a trusted device, and change passwords if you suspect they were accessed. Do not share one-time codes with callers.'
  ),
  (
    'job',
    'A recruiter offers a job after little or no interview and then says you must pay for training, equipment, screening, or placement before starting. For example, they may promise a remote data-entry role and send a link for a “refundable” credit check that collects payment or personal details.',
    array[
      'You are asked to pay money before you have a verified job offer or start work.',
      'The salary or opportunity sounds unusually generous for very little screening.',
      'The recruiter uses a personal email or number and cannot be verified through the employer.',
      'A link asks for banking details, card information, identity documents, or a one-time PIN.'
    ]::text[],
    'Do not pay an upfront fee or submit sensitive information through a recruiter’s link. Find the employer’s official website independently and confirm the vacancy and recruiter using contact details listed there. If you have paid or shared financial details, contact your bank promptly; keep the messages and payment records.'
  ),
  (
    'market',
    'A buyer sends a screenshot or email that appears to confirm payment and pressures you to hand over an item before the money is visible in your own account. They may claim the transfer is delayed, arrange a courier urgently, or ask you to refund an alleged overpayment.',
    array[
      'The buyer relies on a screenshot, email, or SMS instead of cleared funds in your account.',
      'They pressure you to release the item before you can check your banking app.',
      'A courier or third party is introduced at the last minute.',
      'They claim to have overpaid and ask you to send money back before the payment clears.'
    ]::text[],
    'Keep the item until the correct amount appears as cleared funds in your own banking app; do not use links or phone numbers supplied as “proof.” Verify any payment directly with your bank. If you already handed over goods, preserve the messages, listing, delivery details, and payment claim, then report it to the platform and relevant authorities.'
  ),
  (
    'otp',
    'Someone calls or messages pretending to be from your bank and says they need to stop fraud or reverse a payment. They ask you to read out a one-time PIN, approve a notification, or enter a code into a link; that action may authorise access or a transaction.',
    array[
      'The caller asks you to disclose a one-time PIN, password, or app approval.',
      'They create panic about a transaction or threaten to block your account.',
      'They ask you to move money, install remote-access software, or follow a link.',
      'The contact is unsolicited and cannot be verified through your bank’s official channels.'
    ]::text[],
    'Do not tell anyone a one-time PIN or approve a request you did not start. End the call and contact your bank using the number on your card or its official app. If you shared a code or approved a request, call the bank immediately to secure your account and dispute any unauthorised transactions.'
  ),
  (
    'delivery',
    'A message says a parcel is delayed, needs a small redelivery or customs fee, or requires you to confirm your address. The link leads to a lookalike courier page that may collect card details, login credentials, or a one-time PIN.',
    array[
      'The delivery message is unexpected or does not identify an order you recognise.',
      'A small fee is used to make a payment link seem harmless.',
      'The web address is shortened, misspelled, or different from the courier’s official site.',
      'The page asks for banking credentials, card details, or a one-time PIN.'
    ]::text[],
    'Do not use the message link or pay through the page. Check tracking in the courier’s official app or by typing its website address yourself, using a tracking number from your order. If you entered card or banking details, contact your bank promptly and monitor the account.'
  ),
  (
    'sars',
    'An email, SMS, or document claims you owe tax or are due a refund and urges you to act before a deadline. It may include official-looking branding, payment details, or a link to a fake eFiling page designed to collect credentials or banking information.',
    array[
      'The notice arrives unexpectedly and uses urgent threats or promises of a refund.',
      'The sender address or link is unfamiliar or does not match an official SARS channel.',
      'It asks for your password, one-time PIN, full banking details, or payment to an unexpected account.',
      'The tax position or reference cannot be confirmed by signing in independently.'
    ]::text[],
    'Do not click the message link, open unexpected attachments, or pay using bank details in the message. Type the official SARS eFiling address yourself or use a trusted official channel to check your account. If you entered credentials or payment details, change the password through the official service and contact your bank and SARS through verified contact details.'
  ),
  (
    'remote',
    'An unsolicited caller claims your device has a virus, your internet will be disconnected, or your account is at risk. They ask you to install remote-control software so they can “help,” then may view your screen, access accounts, or persuade you to make a payment.',
    array[
      'The call or pop-up is unexpected and claims there is an urgent technical problem.',
      'The person asks you to install remote-access software or share a screen code.',
      'They request passwords, banking details, one-time PINs, or payment for a quick fix.',
      'They discourage you from ending the session or contacting the company directly.'
    ]::text[],
    'End the call and do not install software or grant screen access. If you already did, disconnect the device from the internet, remove the remote-access app, and use a separate trusted device to change important passwords. Contact your bank immediately if the device or caller could access your finances.'
  ),
  (
    'loan',
    'A lender promises fast approval or a guaranteed loan, then asks for an upfront administration, insurance, or release fee before sending the money. After one payment, they may invent another fee or stop responding.',
    array[
      'The lender guarantees approval without a credible assessment.',
      'You must pay before receiving the loan or signing verifiable terms.',
      'The fee is requested into a personal account or through an unusual payment method.',
      'The lender’s identity and contact details cannot be independently verified.'
    ]::text[],
    'Do not pay an advance fee or share online-banking credentials or one-time PINs. Independently verify the lender and read the loan terms before providing documents. If you already paid, contact your bank promptly, keep all messages and receipts, and report the suspected fraud.'
  ),
  (
    'charity',
    'After a disaster or urgent community need, someone uses a charity’s name or photos to request donations through a personal account, wallet, or unfamiliar link. The organisation may be real, while the payment destination is not.',
    array[
      'The appeal arrives through an unfamiliar profile or newly created page.',
      'You are asked to pay a personal account or send cash, airtime, or cryptocurrency.',
      'The request uses emotional pressure and discourages you from checking details.',
      'The campaign is not listed on the charity’s independently located official channels.'
    ]::text[],
    'Pause before donating. Find the charity’s official website or verified contact independently and confirm the appeal and payment details with them. Donate through a channel the organisation confirms; if you already paid to a suspicious account, contact your bank and keep the transaction details.'
  ),
  (
    'boss',
    'An unexpected message or call claims to come from your manager or a family member using a new number. They describe an urgent problem, ask you to keep it secret, and pressure you to send money, buy vouchers, or share sensitive information before you can verify the story.',
    array[
      'The person contacts you from a new number and says their usual phone is unavailable.',
      'They create panic with a sudden emergency or a deadline to act.',
      'They tell you not to call anyone else or to keep the request secret.',
      'They ask for an instant EFT, cash, airtime, gift cards, vouchers, or cryptocurrency.',
      'They avoid a voice or video call or become angry when you ask to verify the story.'
    ]::text[],
    'Pause and do not send money, vouchers, passwords, or one-time PINs. Contact the person using a number you already trust, or verify the request with another family member or colleague. For a workplace request, confirm it through an established company channel. If you already paid, contact your bank or payment provider immediately and preserve the messages and payment details.'
  ),
  (
    'account-recovery',
    'A message claims your account is on hold and says it will be permanently locked unless you complete recovery within a short deadline. It includes an unfamiliar link to a page that may imitate the service and ask for your password, verification code, or payment details.',
    array[
      'You did not request recovery but receive an unexpected account warning.',
      'The message threatens a permanent lock unless you act before a deadline.',
      'The link is shortened, unfamiliar, or sent through an unexpected channel.',
      'The page asks for a password, verification code, payment details, or other sensitive information.'
    ]::text[],
    'Do not open the link or reply. Open the service’s official app or type its address yourself to check your account. If you entered details, change your password through the official service, enable two-step verification, sign out other sessions, and contact support using verified details.'
  ),
  (
    'romance',
    'Someone you meet online builds trust or a romantic relationship, but repeatedly avoids meeting or speaking live. Later, they describe an emergency, travel problem, or investment opportunity and ask for money, gifts, account access, or help moving funds.',
    array[
      'The relationship becomes intense very quickly, while live calls or meetings are repeatedly avoided.',
      'A series of urgent crises require money, airtime, travel costs, or gift cards.',
      'They ask you to invest in cryptocurrency, receive money, or transfer funds for them.',
      'They pressure you to keep the relationship or payments secret or request intimate images.'
    ]::text[],
    'Do not send money, share financial details, or provide intimate images under pressure. Talk with someone you trust and verify claims independently; photos and documents supplied by the person are not proof of identity. If you paid or shared details, contact your bank, preserve messages and receipts, and report the profile to the platform.'
  ),
  (
    'insurance-points',
    'A text or email claims your insurance rewards or loyalty points are about to expire and urges you to claim them immediately. A link may lead to a fake rewards page that asks for your policy login, card details, a one-time PIN, or a small processing fee.',
    array[
      'The expiry warning is unexpected and pressures you to act immediately.',
      'The claim link is shortened, misspelled, or unrelated to the insurer’s official domain.',
      'The page asks for a password, one-time PIN, card details, or a processing fee.',
      'The points balance or offer cannot be confirmed in the insurer’s official app or website.'
    ]::text[],
    'Do not tap the message link, pay a fee, or share passwords or one-time PINs. Open your insurer’s official app or type its website address yourself to check the rewards, or call the number on your policy documents. If you entered details, change your password through the official service and contact your insurer and bank promptly.'
  ),
  (
    'vehicle-fine',
    'A text or email claims you have an unpaid traffic or vehicle fine and urges you to pay before extra penalties or restrictions apply. The link may imitate a traffic authority or municipality and collect card details, banking credentials, or a one-time PIN.',
    array[
      'The fine notice is unexpected and gives you little time to pay.',
      'It threatens extra fees, legal action, or restrictions unless you act immediately.',
      'The payment link is shortened or does not match an official authority or municipality.',
      'The page asks for card details, banking credentials, or a one-time PIN.'
    ]::text[],
    'Do not use the message link or enter payment details or one-time PINs. Check the fine through the relevant traffic authority or municipality using contact details you find independently, or visit its official website directly. If you already paid or shared banking details, contact your bank promptly and keep the message and payment records.'
  )
) as content(slug, summary, warning_signs, recommended_action)
where guide.slug = content.slug;
