# Launch stowgui.com

Things only you can do, roughly in order.

- [ ] Decide: the FAQ and terms promise a voluntary refund within 14 days. Keep it or remove it (`dictionaries/*.ts`).
- [ ] Have the terms, withdrawal notice and privacy policy reviewed (`dictionaries/en.ts`, `de.ts`). The German texts are the legally relevant ones.
- [x] Enable GitHub Pages and set the custom domain and DNS (`docs/dev/deploy.md`).
- [x] Create the Cloudflare D1 database, key pair and signing secret; deploy the Worker.
- [ ] Move the private key from `~/Dokumente/Agents/stowgui/license-signing-key.txt` into your password manager, then delete the file.
- [ ] Add the Worker secrets `STRIPE_WEBHOOK_SECRET` and `RESEND_API_KEY` once Stripe and Resend exist (`cd worker && npx wrangler secret put …`).
- [ ] Give the public key to the app repo (`stowgui_source`) for the offline license check.
- [ ] Verify stowgui.com in Resend.
- [ ] Set up Stripe product, Payment Link and webhook in test mode (`docs/dev/selling.md`), run a test purchase end to end, then repeat in live mode.
- [ ] Set the GitHub variable `PAYMENT_LINK` (`LICENSE_API_URL` is set).
- [ ] Publish app builds as GitHub releases in trainvent/stowgui (the download page links to the latest release).
- [ ] Replace the placeholder favicon (`app/icon.svg`) once there is a StowGUI logo.
