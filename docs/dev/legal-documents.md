# Legal PDF attachments

The license email includes two PDFs in the recipient's language: terms of sale
(including the withdrawal notice and model form) and privacy policy. The content
comes directly from `dictionaries/de.ts` and `en.ts`, with interpolated price and
installation allowance resolved from `lib/config.ts`. The generator does not
rewrite or legally review the texts.

Run `npm run legal:generate` with Python, ReportLab 4.4.9 and DejaVu Sans fonts
installed. Set `PDF_PYTHON` to the required Python executable when needed. By
default, review copies go to `~/Dokumente/Agents/stowgui/legal/`. The Worker imports
base64 attachments from `worker/src/legal/attachments.json`, so no external
fetch is needed to attach them. `manifest.json` records the source, generator
and PDF SHA-256 values. Commit both generated files with changes to legal copy.

Render and inspect every PDF page after regeneration. `npm run legal:check`
checks source freshness and bundled checksums without Python; website CI runs
it before building. Keep a copy of each published revision with its checkout
configuration and purchase records. The preparation script adds document hashes
to Payment Link metadata (copied by Stripe to Checkout Sessions).

Purchase emails include the checkout reference and amount when supplied by
Stripe. They repeat the exact accepted checkbox text only when the signed
webhook reports terms acceptance and supplies that text. No consent is inferred
from payment alone. Recovery messages do not claim to confirm a new purchase or
consent; their attachments are current reference copies, not evidence of which
revision a historical buyer originally accepted. Automatic recovery of historical
contract PDFs is not implemented.

PDF attachments alone do not establish explicit checkout consent, replace an
invoice, establish the actual processor/retention practices, or complete a legal
review of the German checkout and confirmation together.

## Live checkout preparation

`node scripts/prepare-live-checkout.mjs` previews the intended Stripe settings.
With `--apply`, it creates an **inactive** live Payment Link with explicit
immediate-delivery/withdrawal wording, billing address, invoice and document
hashes. It reuses a matching existing link and webhook, creates the four-event
StowGUI webhook when absent, and installs a newly created webhook secret via
Wrangler without printing it. On installation failure, the secret remains in
`worker/.wrangler/live-webhook-secret.txt` with mode 0600; install it before
continuing. Do not recreate an endpoint blindly after a failure.

The CLI key needs Payment Links Write and Webhook Endpoints Write. Existing
endpoints' secrets cannot be read back; verify a reused endpoint's secret and
subscribed events before continuing. Set the Worker payment-link ID and deploy
before activating the link. Complete a purchase/email/activation/refund check,
review the actual checkout, and only then enable the website Buy button.
