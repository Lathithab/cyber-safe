-- Expand the impersonation guide with a text-first example and detach its image.
-- The image file remains in Storage; this clears the guide's reference to it.

update public.scam_guides
set summary = 'An unexpected message or call claims to come from your manager or a family member using a new number. They describe an urgent problem, ask you to keep it secret, and pressure you to send money, buy vouchers, or share sensitive information before you can verify the story.',
    warning_signs = array[
      'The person contacts you from a new or unfamiliar number and says their usual phone is unavailable.',
      'They create panic with a sudden emergency, deadline, or claim that someone will be in trouble unless you act now.',
      'They tell you not to call anyone else or to keep the request secret.',
      'They ask for an instant EFT, cash, airtime, gift cards, vouchers, or cryptocurrency.',
      'They avoid a voice or video call, or become angry when you ask questions.',
      'The payment details or request do not match what you know about the person or organisation.'
    ],
    recommended_action = 'Pause and do not send money, vouchers, passwords, or one-time PINs. Contact the person using a number you already trust, or verify the request with another family member or colleague. For a workplace request, confirm it through an established company channel. If you already paid, contact your bank or payment provider immediately, preserve messages and payment details, and report the incident to the appropriate authorities.',
    example_image_path = null,
    updated_at = now()
where slug = 'boss';
