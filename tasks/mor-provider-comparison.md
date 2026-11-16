# Merchant-of-record choice for StowGUI

Investigated 2026-11-16. The user selected worldwide sales through Stripe
Managed Payments and approved creating then immediately deactivating its first
live link, including the stated service terms and fee structure. The link is
inactive and unpublished. The alternatives and pricing evidence below record
the basis for that choice.

## Selected provider: Stripe Managed Payments

Germany and automated downloadable software are listed as eligible, subject to
account/product review. Managed Payments supports one-time Payment Links,
which keeps the existing checkout and webhook integration relatively small.
It requires a new link; an existing link cannot be converted in place.

Trainvent's signed-in live Dashboard offers Managed Payments onboarding. Its
introductory setup screen lists selecting a product category and configuring
checkout. This establishes that onboarding is offered, not final approval;
the user approved the category `txcd_10202001` for personal utility purchases.
The StowGUI product is marked eligible; the separate Aperiodos product was not
changed. The created live link `plink_1UcLkP3SIDKPozJgf3ky30XT` was deactivated
immediately and read back as `active: false`, Managed Payments enabled, EUR5
inclusive price, fixed quantity one, billing address collection, automatic
provider invoice with no §19 footer, and the existing success-page redirect.
The website still has no live Buy link. The production Worker still filters
for the old inactive link until coordinated migration.

The actual checkout UI disables seller terms acceptance and custom consent
text. It shows Link terms/privacy and refers to Trainvent's conditions without
a separate Trainvent terms link in the observed footer. Resolve incorporation
of the licence conditions before publication; email attachments alone are not
evidence of pre-contract acceptance. No early-expiry waiver was present in the
completed sandbox Checkout Session. Preserve the withdrawal right accordingly.

## Sandbox acceptance

The new helper and `dev:checkout -- --managed` prepare a separate Stripe TEST
product/link with the approved category and EUR5 inclusive price, forwarding
signed events to a local Worker with captured email. A sandbox purchase on
2026-11-16 charged EUR5 inclusive of EUR0.80 German VAT, issued a valid local
key and captured the German PDFs without fabricated consent. The real Stripe
TEST full-refund webhook then made local activation return 403. The browser
redirected to the localized success page. No live money or external key email
was used. France and UK country-selection previews both displayed EUR0.83 VAT
inside the same EUR5 total. Link exposes business-name and tax-ID fields;
validated B2B invoice handling remains untested, and a business-use software
category was not selected for the first checkout. Confirm that classification
before expanding beyond the approved personal-use purchase target.

Test purchase: `cs_test_a0GF63AJIci0dk9yNznF1uZG6oQpLdVMlcdfPgGcofrh4eUf16DQji1Qzh`.
Paid event: `evt_1UcLok3SIDKPozJgUdW4gxqJ`; refund event:
`evt_3UcLod3SIDKPozJg03wa4c2P`. Test link: `plink_1UcLmU3SIDKPozJgyhMtkz5s`.

The German list price adds 3.5% to ordinary payment fees. With a standard EEA
card, 1.5% + EUR0.25 plus Managed Payments is EUR0.50 on a EUR5 charged amount.
This is a transaction-fee example, not take-home revenue: VAT deductions,
premium/international card fees and exceptional charges can change the result.

SMP's service terms describe it as merchant of record while retaining the user
as Seller and assigning the user substantial product, refund/dispute and legal
responsibilities. Do not promise that adopting it transfers all consumer-law
obligations. Link's refund/support route alone is not proof of the required
online withdrawal function. Inspect the real checkout and agree responsibility
for the website function before sales.

Sources: [eligibility](https://docs.stripe.com/payments/managed-payments/eligibility),
[Payment Links](https://docs.stripe.com/payments/managed-payments/use-payment-links),
[how it works](https://docs.stripe.com/payments/managed-payments/how-it-works),
[German pricing](https://stripe.com/de/pricing),
[German service terms](https://stripe.com/de/legal/ssa-service-terms#stripe-managed-payments),
[Link buyer terms](https://link.com/terms). Link currently announces terms changes
for 20 November 2026; recheck before launch.

## Alternatives

| Provider | Fit | Cost/verification caveat |
| --- | --- | --- |
| Lemon Squeezy | Germany supported; hosted checkout, downloads and optional licensing | Published 5% + US$0.50, plus listed non-US/PayPal and non-US bank payout fees where applicable. Existing StowGUI signing/activation should remain authoritative rather than introducing a second key system. |
| Paddle | Supports software and sole-trader verification; Germany not excluded | Published 5% + US$0.50; products under US$10 are directed to bespoke pricing. Obtain an actual quote for a EUR5 product. |

Lemon Squeezy sources: [pricing](https://www.lemonsqueezy.com/pricing),
[fee detail](https://docs.lemonsqueezy.com/help/getting-started/fees),
[supported countries](https://docs.lemonsqueezy.com/help/getting-started/supported-countries),
[product features](https://docs.lemonsqueezy.com/help/products/adding-products).
Paddle sources: [pricing](https://www.paddle.com/pricing),
[supported seller countries](https://www.paddle.com/help/start/account-verification/which-countries-are-supported-by-paddle),
[sole-trader verification](https://www.paddle.com/help/start/account-verification/what-is-identity-verification).

## Search record

Stripe Directory queries `merchant of record software` and `merchant of record`
with `--format json --limit 8` each returned an empty list. The shortlist above
comes from the providers' primary documentation, not fabricated Directory
matches. No purchase or provider contact was made.

## Before enabling anything

- Confirm the actual Trainvent account and product can use the chosen service.
- Review actual fees, seller/processor roles, refund rights, buyer wording and
  responsibility for the withdrawal interface with the user.
- Confirm the correct software tax category from the provider's current list.
- Decide whether EUR5 includes customer-country tax; keep price copy consistent.
- Prepare a new inactive checkout, preserve old purchases/keys, and run a
  provider sandbox purchase/refund/activation test before requesting launch.
