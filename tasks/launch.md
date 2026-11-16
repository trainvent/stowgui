# Launch stowgui.com

Things only you can do, roughly in order.

Current legal-review work and decisions are tracked in
[legal launch remediation](legal-launch-review.md). The user selected worldwide
sales through a merchant of record and a Brevo-to-Resend migration on 2026-11-16.
Earlier Stripe/Brevo acceptance records below are historical evidence; they do
not close these new launch gates.

- [ ] Have the terms, withdrawal notice and privacy policy reviewed (`dictionaries/en.ts`, `de.ts`). The German texts are the legally relevant ones.
- [x] Enable GitHub Pages and set the custom domain and DNS (`docs/dev/deploy.md`).
- [x] Create the Cloudflare D1 database, key pair and signing secret; deploy the Worker.
- [x] Secure backups of the license and update signing keys confirmed by the user on 2026-11-15.
- [ ] Move the private key from `~/Dokumente/Agents/stowgui/license-signing-key.txt` into your password manager, then delete the file.
- [x] Add the Worker secret `STRIPE_WEBHOOK_SECRET` (test mode).
- [x] Add the Worker secret `BREVO_API_KEY` (`cd worker && npx wrangler secret put BREVO_API_KEY`).
- [x] Embed the existing public key in the app repo (`stowgui_source`) for signature verification.
- [x] Apply `worker/migrations/0002_activations.sql` to the remote database (2026-11-11).
- [x] Deploy the activation/check-in API with its `ACTIVATION_LIMIT` binding (2026-11-11). Resolved the D1 upload error with the current `database_id` field; deploy through `npm run deploy`.
- [x] Verify deployed activation/renewal through the production Rust license code, offline signature/expiry checks, fourth-device eviction, explicit reclaim and the three-seat limit (2026-11-11).
- [x] Enter the key in the desktop GUI against the deployed service (2026-11-12); the automated live check used an isolated profile and the production Rust license code.
- [x] Update German and English purchase copy, terms and privacy notice for 30-day offline use, whole-license transfers and service shutdown.
- [ ] Provide a durable contract confirmation and verify explicit digital-delivery consent/acknowledgment in the real checkout; the current key email is not the complete confirmation.
- [x] Implement and test the support transfer procedure locally: authenticate the holder, revoke/reissue credentials, release old seats and move recovery to the new holder while preserving accounting records. See `docs/dev/selling.md`.
- [ ] Verify privacy notice details against processor agreements and actual retention/deletion practices.
- [x] Authenticate stowgui.com in Brevo and add the sender `license@stowgui.com` (`docs/dev/selling.md`). DNS is in place (checked 2026-11-12): Brevo code TXT, DKIM `brevo1`/`brevo2` CNAMEs and DMARC `p=none`. A received license email on 2026-11-15 passed SPF, aligned stowgui.com DKIM and DMARC; sender delivery is verified.
- [x] Stripe test mode: product `prod_Vb8fRfea3E5K6M`, Payment Link `plink_1UZwOj3SIDKPozJgKEF9GUO7`, webhook `we_1UZwOq3SIDKPozJgy4z0m2DW`.
- [x] Run a test purchase end to end (2026-11-09: key issued, emailed via Brevo, signature valid, refund revoked it).
- [x] Repeat the Stripe infrastructure setup in live mode, then swap `STRIPE_WEBHOOK_SECRET` and `STRIPE_PAYMENT_LINK_ID` to the live values.
  - [x] Live product `prod_Vc8ztUlgOqupQk` and price `price_1Uauhs3SIDKPozJgG76NVzVE` (5 € inclusive) created 2026-11-12.
  - [x] Live Payment Link `plink_1Uc3U43SIDKPozJgQnOSxZjY` and webhook `we_1Uc3U63SIDKPozJgYJaCYa0m` created 2026-11-15 through the authorized CLI. Link is **inactive**. Required consent, billing address, post-payment invoice/footer, redirect and all four webhook events verified. Legal PDF/source hashes are recorded in link metadata.
  - [x] Store the live webhook secret and deploy the Worker with the live `STRIPE_PAYMENT_LINK_ID` (2026-11-15). `PAYMENT_LINK` remains unset and sales disabled.
  - [x] Repeat purchase → contract/key email with current consent and PDFs → activation → refund/revocation in Stripe Test-Modus using the same Worker code and isolated test payment settings; separately verify the live configuration. A live self-purchase is not a launch requirement.
- [ ] Set the GitHub variable `PAYMENT_LINK` (`LICENSE_API_URL` is set).
- [x] Publish app builds as GitHub releases in trainvent/stowgui: Linux 0.1.0 on 2026-11-12. macOS follows (`stowgui_source/tasks/macos-release.md`); then add `"macos"` to `RELEASED_PLATFORMS` in `lib/config.ts`.
- [x] Set `RELEASED = true` (2026-11-12). Buy stays disabled until the live-mode `PAYMENT_LINK` variable is set.
- [ ] Replace the placeholder favicon (`app/icon.svg`) once there is a StowGUI logo.

## Test purchase — 2026-11-11

The user completed the existing Stripe test Payment Link with `dummy@trainvent.com`:

- Checkout `cs_test_a0TLKgngrq25JgZqJD97PNxWCZCoUtALnbtFbGtXUbQmTCBENtIwYcijDi` is complete/paid, `livemode: false`, EUR 5.00. An invoice was created and terms acceptance was recorded.
- The existing deployed webhook created one license and recorded a successful Brevo send. This establishes email API acceptance, not inbox arrival; recipient confirmation is still needed.
- The issued purchase key passed Ed25519 verification against the production public key embedded in the desktop app, with format v1 and major 1 entitlement. No key or signing secret is stored in this document.
- The activation schema migration succeeded. Worker deployment failed twice using Wrangler 4.159.0 and once using 4.160.0 with Cloudflare error 10021: `binding DB of type d1 failed to generate`.
- D1 remains readable and its UUID matches the active Worker binding; jurisdiction is unset. The old Worker remains deployed. `POST /license/activate` currently returns 404. No configuration workaround, replacement database or secret change was applied; the cause remains unconfirmed.
- App activation, renewal and the 30-day offline allowance have not been tested against the deployed service. Complete those after resolving the upload failure. Local tests from the implementation task remain separate evidence.
- Revised website terms and revised key-email copy have not been published by this test. This purchase used the existing checkout and Worker; contract-confirmation and operator-transfer launch items remain open.

## Nextcloud Mail rendering — 2026-11-11

The received test message was inspected through Gmail's MIME representation. It is `text/html`, not an image. Although the original Worker supplied `textContent`, the received body contains Brevo-generated HTML with `<br>` separators, an unbroken signed key and an injected hidden open-tracking image. The screenshot shows horizontal overflow and a clipped message-frame bottom. The pixel explains the blocked-image banner; Nextcloud's exact height-sizing behavior has not been reproduced locally.

- [x] Add explicit HTML with wrapping key paragraphs and a plain-text alternative, without changing key bytes or inserting copy-breaking characters. Escape dynamic values and avoid images, scripts, frames or fixed heights in authored HTML.
- [x] Verify the request format, full footer, key preservation and escaping in regression tests; all 21 Worker tests and type checking pass.
- [x] Deploy and resend to `dummy@trainvent.com`; Gmail confirms receipt of both plain-text and wrapping HTML parts with the full footer (2026-11-11).
- [x] Verify key selection, width and footer visibility in Nextcloud Mail; the user confirmed the corrected message displays properly (2026-11-11).
- [ ] Review Brevo's injected open tracking and the website's no-tracking statements before launch. Do not assume the provider leaves authored HTML or requested plain-text parts unchanged.
  - [x] The key email requests `contactPixelTrackingConsent: false` (anonymised opens/clicks) and `removeTrackingPixel: true` (honoured on Enterprise plans only) (2026-11-12; needs a Worker deploy).
  - [x] User reports enabling anonymous email tracking and agrees to retain Brevo on that basis (2026-11-15). German and English privacy notices now describe anonymous open/click statistics; individual profiling is not used. This records the user's settings change, not an independent account audit or legal conclusion.
  - [ ] Verify the transactional-email setting and anonymised events in Brevo after a fresh key email. Campaign and transactional anonymisation settings are separate. A received pixel alone cannot establish whether event records are anonymised.
  - [ ] Publish the updated privacy notice, deploy the regenerated privacy attachments and refresh checkout document-hash metadata before live sales. Local legal freshness, type checking and lint pass; both updated privacy PDFs were visually reviewed (2026-11-15).

## Deployment resolution and completed live checks — 2026-11-11

Using `database_id` instead of Wrangler's deprecated `id` in upload metadata resolved error 10021. `npm run deploy` now applies this transformation without changing the database; see `docs/dev/deploy.md` and `tasks/wrangler-d1-binding.md`. No secrets, payment-mode settings or purchased license credentials were replaced, and the database was not recreated.

The purchased dummy test key activated successfully through the production Rust `Session` and embedded public key, survived private-file save/reload with offline verification, renewed online, and reported expired when checked beyond the signed offline lifetime. Three additional isolated device activations released the original installation; check-in correctly returned `moved`. Explicit reclaim succeeded. A database query confirmed exactly three active installations for this test license.

The corrected key email reached the Gmail inbox and contains `multipart/alternative` with text/plain and text/html. Its HTML preserves key wrapping and the full footer, has no fixed height, and still contains a provider-injected tracking pixel. The user confirmed the corrected message displays properly in Nextcloud Mail. The provider-tracking review remains pending. The static website was not published by this deployment.


## Computer management rollout

- [x] Apply migrations `0003_device_names.sql` and `0004_unique_device_names.sql`
  to the live database (2026-11-12). Backup before migrating:
  `~/Dokumente/Agents/stowgui/stowgui-licenses-backup-2026-11-12.sql`; Time Travel
  bookmark `00000008-00000000-00005121-523245c9b08383234f714da85cc1c7b4`.
- [x] Deploy the device-list, rename and deactivate endpoints (2026-11-12, version
  `757d056b`). All license endpoints answer `403 invalid` for a forged key.
- [x] Test the built desktop app against the live service with a Stripe test purchase:
  activate, rename, deactivate, then refund and confirm paid actions lock (2026-11-12,
  confirmed by the user).


## Hosted license sandbox

- [x] Separate Cloudflare Worker, D1 database, signing key, test licenses and desktop profiles.
- [x] Deployment configuration and private credential/seed preparation; production deployment unchanged.
- [x] Local tests and dry run; hosted route isolation, forged-key rejection, seat eviction and reclaim checks.
- [ ] Separate staging coverage for purchase delivery/email and signed app updates; license sandbox routes intentionally exclude these.

## Launch preparation — 2026-11-15

- [x] Generate German/English legal PDFs from the existing dictionary texts and attach them to license mail. Worker bundles base64 bytes; CI checks freshness. See `docs/dev/legal-documents.md`.
- [x] Include order reference/amount and accepted checkbox wording when present in the signed Stripe event; never infer consent from payment.
- [x] Implement operator transfer preview/apply command and local D1 integration coverage. Production handover acceptance remains separate.
- [x] Prepare macOS download availability and minimum requirements in the website source. Not deployed by these local changes.
- [x] Deploy and inspect a received attachment email (2026-11-15).
- [ ] Review German checkout and purchase confirmation together.
- [x] Resolve the original CLI permission block through account-specific OAuth authorization. Live StowGUI link/webhook created and configured; see the received-attachments record below.
- [ ] macOS downloaded-app GUI/activation smoke test remains pending, confirmed by the user. Intel physical testing remains deferred.

The earlier checkbox about `BREVO_API_KEY` is stale: Wrangler secret listing on
2026-11-15 confirms it is installed. This does not verify sender authentication
or provider tracking. The existing Stripe test link has required terms consent
and explicit delivery/withdrawal wording; live checkout still needs verification.

## Live Stripe infrastructure and received attachments — 2026-11-15

- Account: `acct_1TBaml3SIDKPozJg` (Trainvent live; existing StowGUI and Aperiodos account).
- Worker deployed with the live link ID and bundled PDF attachments: version `fedab066-18a8-4fbe-9057-9bf07aae8f2f`. Secret installed without printing or committing it. No signing key or database schema changed.
- The preparation script initially sent `active` on Payment Link creation, which Stripe rejects. Corrected to create then immediately deactivate before sharing the URL; the script now verifies the account ID first.
- Checkout settings and all four PDF checksums/source hash verified by reading the live Payment Link; live webhook enabled for completed/async-success purchases, full refunds and disputes.
- Deployed `/license/resend` accepted the explicitly authorized German attachment test to `dummy@trainvent.com` (HTTP 202). Gmail confirms inbox delivery at 13:30:05 UTC; both PDF attachments have byte-for-byte matching SHA-256 values. Terms include the withdrawal notice/model form. Text/HTML alternatives and footer are present. SPF, aligned stowgui.com DKIM and DMARC all pass.
- This was recovery of existing test licenses, **not a paid checkout test**. No charge or refund was initiated.
- Received HTML still includes two Brevo-hosted tracking images. Presence is confirmed; whether provider settings anonymize tracking is not verified. Privacy/provider settings review remains open.
- Unsigned webhook payload rejected with HTTP 400.
- Payment Link remains inactive, GitHub `PAYMENT_LINK` is still unset, and Buy remains disabled. Website/source changes from the previous preparation have not been pushed or deployed here.

## Test-payment clarification — 2026-11-15

The earlier advice to require a live self-purchase was incorrect. Use Stripe
Test-Modus and test payment methods for the purchase/refund acceptance check;
no real money is needed. Earlier test-mode purchase/refund checks passed, but
the current consent/contract-confirmation changes need renewed end-to-end
coverage. Live settings are verified separately. Do not point test purchases
at a Worker that currently accepts only the live Payment Link and signing secret.

Source: https://support.stripe.com/questions/how-do-i-test-my-integration-when-test-mode-isnt-available

## Local checkout test environment — 2026-11-15

- [x] Local website launcher with a dedicated Stripe Test-Modus link, shared live/test consent and invoice settings, and a local success redirect.
- [x] Real Stripe CLI webhook forwarding into the production handlers with a separate local database/signing key. Local Brevo payload capture provides an inbox and attached PDFs without additional email sends.
- [x] Separate desktop test profile and launcher, reusing the existing app sandbox example.
- [x] Isolated local smoke check covers signed purchase events, recorded consent, email/PDF checksums, activation and refund revocation. This uses synthetic events, not a completed hosted checkout.
- [x] Finish Stripe reauthorization and start the local website/listener/service. Buy opens Stripe Sandbox with StowGUI at €5 and the current consent text; redirect verified to the local success page.
- [x] Complete a hosted test checkout through the running local environment, inspect its local confirmation, activate and refund it (2026-11-15; activation and deactivation confirmed by the user).

Instructions: `docs/dev/local-checkout.md`. The live service and inactive live
Payment Link are unchanged by this setup.

## Hosted test checkout acceptance — 2026-11-15

The user completed the dedicated local-website Stripe Test-Modus checkout.
`checkout.session.completed` event `evt_1Uc3tK3SIDKPozJgAohkQEbR` reached the
local production handler and returned 200. The captured German confirmation
contains the purchase reference and current PDF attachments; the user confirmed
that its key activated in the separate desktop test profile.

The user issued the full test refund. `charge.refunded` event
`evt_3Uc3tG3SIDKPozJg1csuMkju` arrived at 14:02:36 UTC and returned 200. A
read-only local database check confirms the purchased license is revoked; the
user then confirmed deactivation in the app. This completes the current
test-mode purchase/confirmation/activation/refund/revocation acceptance flow.

The local confirmation is a captured Brevo payload rather than a real email;
actual provider delivery and identical PDF attachment bytes were separately
verified through the hosted service earlier that day. No live charge or refund
was performed. Legal review, Brevo tracking/privacy and remaining platform
acceptance checks remain separate launch items.


## Resend cutover - 2026-11-16

- [x] Direct Resend setup after Stripe Projects rejected the existing account.
- [x] stowgui.com verified in Ireland, open/click tracking disabled, Worker
  send-only key restricted to the domain and installed as RESEND_API_KEY.
- [x] Deploy current mailer and updated legal attachments. The received recovery
  email at 08:43:04 CET has no image tags or tracking URLs; SPF, DKIM and DMARC
  pass. Both received PDF hashes match the bundle.
- [x] Revoke temporary full-access CLI authorization, remove its local profile,
  temporary key copy and obsolete Brevo Worker secret. Existing Brevo DNS and
  account remain intact.
- [x] Publish updated German/English privacy website after the fresh received-email
  test (2026-11-16, policy-only commit e890cdd; live pages verified).
- [ ] Refresh checkout document references before enabling sales. MoR selection,
  withdrawal flow and legal review remain
  open in [the remediation plan](legal-launch-review.md).

This supersedes the earlier Brevo tracking launch items. The later privacy-only
website publication was separately authorized; other pending local changes were
not published and checkout remains disabled.

## Email alignment and wrapping - 2026-11-16

- [x] Remove the centered 640px content box and extra body padding.
- [x] Replace CSS-only key wrapping with adjacent inline-block segments that
  survive the relevant HTMLPurifier rules. Preserve original key text with no
  spaces, hidden characters or hard line breaks.
- [x] Reproduce the old inset/overflow in a filtered browser fixture and verify
  zero horizontal overflow at narrow and wide widths. Clipboard copying of a
  wrapped 327-character fixture key is byte-for-byte unchanged.
- [x] Worker type checking and all 34 tests pass; deploy version
  `01d37e01-d00c-426f-8508-a1015aa87986`.
- [x] Received the updated recovery test at 09:18:27 CET in
  `dummy@trainvent.com`. MIME HTML contains the new left-aligned wrapper and
  inline-block key segments, no centered margin and no image tags. Both keys
  and both unchanged PDFs are present.
- [ ] User checks the newest message in Nextcloud; the agent could not inspect
  the signed-in client. Separate recovery wording remains a follow-up.

## Single-key recovery test - 2026-11-16

The user explicitly approved retiring the older hosted test licence for
`dummy@trainvent.com` and keeping the newer one. Licence
`6931e38f-8853-4301-8c71-b0a816f49ed8` (Stripe test checkout, 11 November) was
revoked with a guarded single-row update; its purchase record was preserved.
Licence `7d012343-46aa-4ad6-8007-bae307e88bce` (12 November) remains active.
The live status API confirms the older licence is inactive and the newer active.

After the normal resend cooldown, the recovery email received at 09:23:46 CET
contains exactly one existing key, with the new left-aligned HTML and both
current PDFs. Plain-text and rendered HTML key bytes agree. Recovery behavior
for customers with multiple valid purchases was not changed.
