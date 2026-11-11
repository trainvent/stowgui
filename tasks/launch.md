# Launch stowgui.com

Things only you can do, roughly in order.

- [ ] Have the terms, withdrawal notice and privacy policy reviewed (`dictionaries/en.ts`, `de.ts`). The German texts are the legally relevant ones.
- [x] Enable GitHub Pages and set the custom domain and DNS (`docs/dev/deploy.md`).
- [x] Create the Cloudflare D1 database, key pair and signing secret; deploy the Worker.
- [ ] Move the private key from `~/Dokumente/Agents/stowgui/license-signing-key.txt` into your password manager, then delete the file.
- [x] Add the Worker secret `STRIPE_WEBHOOK_SECRET` (test mode).
- [ ] Add the Worker secret `BREVO_API_KEY` (`cd worker && npx wrangler secret put BREVO_API_KEY`).
- [x] Embed the existing public key in the app repo (`stowgui_source`) for signature verification.
- [x] Apply `worker/migrations/0002_activations.sql` to the remote database (2026-11-11).
- [ ] Deploy the activation/check-in API with its `ACTIVATION_LIMIT` binding. Upload is blocked by Cloudflare error 10021 generating the existing D1 binding; see the test record below.
- [ ] Validate three devices, fourth-device eviction, explicit reclaim and renewal from the built app against the deployed Worker.
- [x] Update German and English purchase copy, terms and privacy notice for 30-day offline use, whole-license transfers and service shutdown.
- [ ] Provide a durable contract confirmation and verify explicit digital-delivery consent/acknowledgment in the real checkout; the current key email is not the complete confirmation.
- [ ] Implement and test the support transfer procedure: authenticate the holder, revoke/reissue credentials, release old seats and move recovery to the new holder while preserving accounting records. See `docs/dev/selling.md`.
- [ ] Verify privacy notice details against processor agreements and actual retention/deletion practices.
- [ ] Authenticate stowgui.com in Brevo and add the sender `license@stowgui.com` (`docs/dev/selling.md`).
- [x] Stripe test mode: product `prod_Vb8fRfea3E5K6M`, Payment Link `plink_1UZwOj3SIDKPozJgKEF9GUO7`, webhook `we_1UZwOq3SIDKPozJgy4z0m2DW`.
- [x] Run a test purchase end to end (2026-11-09: key issued, emailed via Brevo, signature valid, refund revoked it).
- [ ] Repeat the Stripe setup in live mode (`stripe … --live`), then swap `STRIPE_WEBHOOK_SECRET` and `STRIPE_PAYMENT_LINK_ID` to the live values.
- [ ] Set the GitHub variable `PAYMENT_LINK` (`LICENSE_API_URL` is set).
- [ ] Publish app builds as GitHub releases in trainvent/stowgui (the download page links to the latest release). Publishing the release also emails everyone watching the repo for releases.
- [ ] Set `RELEASED = true` in `lib/config.ts` to replace "Coming soon" with Buy and Download.
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
