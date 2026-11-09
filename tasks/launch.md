# Launch stowgui.com

Things only you can do, roughly in order.

- [ ] Decide: the FAQ and terms promise a voluntary refund within 14 days. Keep it or remove it (`dictionaries/*.ts`).
- [ ] Have the terms, withdrawal notice and privacy policy reviewed (`dictionaries/en.ts`, `de.ts`). The German texts are the legally relevant ones.
- [ ] Enable GitHub Pages and set the custom domain and DNS (`docs/dev/deploy.md`).
- [ ] Create the Cloudflare D1 database, key pair and secrets; deploy the Worker. Store the private key in your password manager.
- [ ] Give the public key to the app repo (`stowgui_source`) for the offline license check.
- [ ] Verify stowgui.com in Resend.
- [ ] Set up Stripe product, Payment Link and webhook in test mode (`docs/dev/selling.md`), run a test purchase end to end, then repeat in live mode.
- [ ] Set the GitHub variables `PAYMENT_LINK` and `LICENSE_API_URL`.
- [ ] Publish app builds as GitHub releases in trainvent/stowgui (the download page links to the latest release).
- [ ] Replace the placeholder favicon (`app/icon.svg`) once there is a StowGUI logo.
