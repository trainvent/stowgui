# After launch

Sales went live on 2026-11-17 through Stripe Managed Payments. The launch
history is in [archive](archive/).

## Legal and tax

- [ ] Counsel review of the German/English terms, withdrawal notice and privacy
  policy together with the real checkout and key email, including business
  jurisdiction and sanctions/export restrictions.
- [ ] Get written confirmation from Stripe/Link of who sells, invoices, handles
  VAT and handles withdrawals for Managed Payments sales.
- [ ] Ask the tax adviser how Managed Payments sales fit Trainvent's own VAT and
  income-tax position.
- [ ] Decide the retention period for withdrawal and licence records, add the
  deletion routine and check it against the privacy notice and processor terms.
- [ ] Archive each published revision of the four PDFs with its checkout
  configuration (`manifest.json` hashes are in the Payment Link metadata).

## Product

- [ ] Test a business purchase with a validated tax ID (invoice to a company).
- [ ] macOS downloaded-app activation smoke test; Intel testing deferred.
- [ ] Replace the placeholder favicon (`app/icon.svg`) once there is a logo.
- [ ] Check the key email's layout in Nextcloud Mail.

## Notes

- The Stripe account's public Terms of service URL is
  `https://stowgui.com/en/terms/`. It applies to every checkout on the Trainvent
  account that asks for terms acceptance.
