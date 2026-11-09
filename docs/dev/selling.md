# Selling StowGUI

## Flow

1. Buy button → Stripe Payment Link (hosted checkout).
2. After payment Stripe redirects to `https://stowgui.com/buy/success/`, which forwards to the visitor's language.
3. Stripe sends `checkout.session.completed` to the Worker (`POST /stripe/webhook`). The Worker signs a license key, stores it in D1 and emails it via Brevo. If the email fails, the Worker returns an error and Stripe's retry sends it.
4. `charge.refunded` (full refund) and `charge.dispute.created` revoke the key. The app sees this through `GET /license/status?id=…`.
5. `/license/` on the site lets buyers request their key again (`POST /license/resend`, 5-minute cooldown, same answer for unknown addresses).

## Stripe setup (do it in test mode first)

1. **Product**: "StowGUI license", one-time price 5,00 EUR.
2. **Settings → Public details**: business name Trainvent, support email, terms URL `https://stowgui.com/en/terms/`, privacy URL `https://stowgui.com/en/privacy/`.
3. **Invoices**: enable post-payment invoices on the Payment Link and add the footer `Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.`
4. **Payment Link**:
   - Quantity fixed at 1, collect billing address (needed for invoices).
   - Require agreement to the terms of service.
   - Custom text for the terms checkbox (withdrawal waiver for digital content, § 356 (5) BGB):
     > I agree that delivery of the license key begins immediately, and I know that I lose my right of withdrawal once delivery has begun. / Ich stimme zu, dass die Lieferung des Lizenzschlüssels sofort beginnt, und weiß, dass ich dadurch mein Widerrufsrecht verliere.
   - After payment: redirect to `https://stowgui.com/buy/success/`.
   - Put the link URL into the GitHub variable `PAYMENT_LINK` and its id (`plink_…`) into `STRIPE_PAYMENT_LINK_ID` in `worker/wrangler.toml`.
5. **Webhook endpoint**: `https://stowgui-license.trainvent.workers.dev/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Brevo setup

1. **Senders, domains & dedicated IPs → Domains**: add `stowgui.com` and put the records Brevo shows (Brevo code TXT, DKIM, DMARC) into the DNS at the registrar (Above.com). They don't touch the GitHub Pages records.
2. **Senders**: add `license@stowgui.com` (name "StowGUI").
3. **SMTP & API → API keys**: create a key for the Worker and store it with `npx wrangler secret put BREVO_API_KEY` in `worker/`.

Key emails come from `license@stowgui.com` with replies to support@trainvent.com.

## Local end-to-end test

```sh
cd worker
npx wrangler d1 migrations apply stowgui-licenses --local
printf 'STRIPE_WEBHOOK_SECRET=whsec_...\nLICENSE_SIGNING_KEY=...\nBREVO_API_KEY=xkeysib-...\n' > .dev.vars
npm run dev
stripe listen --forward-to localhost:8787/stripe/webhook   # prints the whsec_ secret
stripe trigger checkout.session.completed
npx wrangler d1 execute stowgui-licenses --local --command "SELECT id, email, revoked_at FROM licenses"
```
