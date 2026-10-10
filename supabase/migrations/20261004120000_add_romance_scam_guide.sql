-- Add a published romance-scam guide to the Scam Library.
insert into public.scam_guides
  (slug, category, title, summary, warning_signs, recommended_action, published, sort_order)
values
  (
    'romance',
    'Romance scams',
    'Romance scam and catfishing',
    'Someone builds a romantic connection online, then uses trust or a sudden crisis to ask for money, gifts, or access to your accounts.',
    array[
      'They quickly declare strong feelings but avoid meeting or having a live video call.',
      'They repeatedly have emergencies that require money, airtime, travel costs, or gift cards.',
      'They ask you to invest in cryptocurrency or send money to a personal account.',
      'They pressure you to keep the relationship or payments secret, or ask for intimate images or financial details.'
    ],
    'Pause before sending money, gifts, intimate images, or account details. Talk it through with someone you trust and verify the person independently; do not rely on photos or documents they provide. If you have paid or shared financial details, contact your bank immediately, save messages and receipts, and report the account to the platform.',
    true,
    13
  )
on conflict (slug) do nothing;
