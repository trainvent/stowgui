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
configuration and purchase records. `scripts/stripe-checkout-settings.mjs` adds the document hashes
to Payment Link metadata (copied by Stripe to Checkout Sessions).

Purchase emails include the checkout reference and amount, and state that the
attached terms were accepted only when the signed webhook reports terms
acceptance. No consent is inferred from payment alone. Recovery messages do not
claim to confirm a new purchase or consent; their attachments are current
reference copies, not evidence of which revision a historical buyer originally
accepted. Automatic recovery of historical contract PDFs is not implemented.
