# Launch stowgui.com

Things only you can do, roughly in order.

- [ ] Have the terms, withdrawal notice and privacy policy reviewed (`dictionaries/en.ts`, `de.ts`). The German texts are the legally relevant ones.
- [x] Enable GitHub Pages and set the custom domain and DNS (`docs/dev/deploy.md`).
- [x] Create the Cloudflare D1 database, key pair and signing secret; deploy the Worker.
- [ ] Move the private key from `~/Dokumente/Agents/stowgui/license-signing-key.txt` into your password manager, then delete the file.
- [x] Add the Worker secret `STRIPE_WEBHOOK_SECRET` (test mode).
- [ ] Add the Worker secret `BREVO_API_KEY` (`cd worker && npx wrangler secret put BREVO_API_KEY`).
- [ ] Give the public key to the app repo (`stowgui_source`) for the offline license check.
- [ ] Authenticate stowgui.com in Brevo and add the sender `license@stowgui.com` (`docs/dev/selling.md`).
- [x] Stripe test mode: product `prod_Vb8fRfea3E5K6M`, Payment Link `plink_1UZwOj3SIDKPozJgKEF9GUO7`, webhook `we_1UZwOq3SIDKPozJgy4z0m2DW`.
- [x] Run a test purchase end to end (2026-11-09: key issued, emailed via Brevo, signature valid, refund revoked it).
- [ ] Repeat the Stripe setup in live mode (`stripe … --live`), then swap `STRIPE_WEBHOOK_SECRET` and `STRIPE_PAYMENT_LINK_ID` to the live values.
- [ ] Set the GitHub variable `PAYMENT_LINK` (`LICENSE_API_URL` is set).
- [ ] Publish app builds as GitHub releases in trainvent/stowgui (the download page links to the latest release). Publishing the release also emails everyone watching the repo for releases.
- [ ] Set `RELEASED = true` in `lib/config.ts` to replace "Coming soon" with Buy and Download.
- [ ] Replace the placeholder favicon (`app/icon.svg`) once there is a StowGUI logo.
