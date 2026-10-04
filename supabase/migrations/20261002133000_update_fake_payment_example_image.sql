-- Use the supplied bank-payment example in the Fake proof-of-payment guide.
update public.scam_guides
set example_image_path = '/scams/fake-proof-of-payment-account-number-redacted.png',
    updated_at = now()
where slug = 'market';
