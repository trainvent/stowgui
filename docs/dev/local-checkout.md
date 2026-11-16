# Local website and Stripe test checkout

Run `npm run dev:checkout` in the website repository. Stripe CLI must already be
authorized for Test-Modus in Trainvent account `acct_1TBaml3SIDKPozJg`.
The launcher selects that test context and restores the prior CLI context on exit.
It refuses live prices/links. No real charge or email is sent.

The launcher starts:

- The normal Next.js site at `http://127.0.0.1:3000/en/`, with its Buy button pointing
  to a dedicated Stripe **test** Payment Link. Checkout returns to the local success page.
- Stripe CLI forwarding the four fulfillment/refund/dispute events to the local service.
- The current production webhook/license handlers against a separate persistent local D1 database,
  with a separate Ed25519 key. The live Worker, its secrets, D1 and Payment Link are unchanged.
- A local inbox at `http://127.0.0.1:18766/mail`. The exact Resend request payload is
  captured rather than transmitted, including the recorded checkout agreement and
  the real bundled legal PDFs. The preview lets you open those attachments.

Use Stripe's test card `4242 4242 4242 4242`, a future expiry date and any three-digit
CVC in the hosted **test** checkout. Check the consent text and then complete it.
The local inbox should show the key and the current contract documents. These keys
are intentionally rejected by the normal released app because they use a separate
signing key and license service.

For activation, run `npm run dev:checkout:app` in another terminal. This launches
StowGUI's existing test-profile example from the neighboring `stowgui_source` repo.
Copy the key from the local inbox into Settings → License. Its settings, activation
state and file-operation home are in `stowgui_source/target/checkout-sandbox`.
Use disposable files: the app can still access folders selected on the computer.

Refund the test payment in Stripe Test-Modus and check the license online in that
test app. The forwarded refund event revokes the corresponding local license.
No live purchase/refund is part of this test.

Ctrl+C stops the website, listener and local runtime. State is private under
`worker/.wrangler/checkout-test/`; it includes test credentials, database and last
captured email/PDFs. It is ignored by Git. Do not delete it while you need existing
test licenses. The hosted test checkout can only fulfill while the local listener
is running. Never use it as the public Buy link.

`npm run dev:checkout:check` runs an isolated local smoke test without contacting
Stripe or sending email: signed checkout webhook, recorded consent, PDF checksums,
activation and refund revocation. This verifies the local harness, not completion
of an actual hosted checkout. `STOWGUI_SITE_PORT`, `STOWGUI_CHECKOUT_PORT` and
`STOWGUI_APP_DIR` override the default ports and neighboring app checkout.

The provider delivery/attachment test remains separate; Resend recovery delivery
and received PDF hashes were verified on 2026-11-16 (see
`tasks/legal-launch-review.md`). Historical Brevo delivery was verified through the
hosted service on 2026-11-15. A local preview cannot verify provider delivery or tracking.
