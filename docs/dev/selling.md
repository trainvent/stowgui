# Selling StowGUI

## Flow

1. Buy button → Stripe Payment Link (hosted checkout).
2. After payment Stripe redirects to `https://stowgui.com/buy/success/`, which forwards to the visitor's language.
3. Stripe sends `checkout.session.completed` to the Worker (`POST /stripe/webhook`). The Worker signs a license key, stores it in D1 and emails it via Brevo. If the email fails, the Worker returns an error and Stripe's retry sends it.
4. `charge.refunded` (full refund) and `charge.dispute.created` revoke the key. The app sees this at its next activation/check-in. An offline installation can use its existing token until its signed 30-day expiry.
5. `/license/` on the site lets buyers request their key again (`POST /license/resend`, 5-minute cooldown, same answer for unknown addresses).

## Stripe setup (do it in test mode first)

1. **Product**: "StowGUI license", one-time price 5,00 EUR.
2. **Settings → Public details**: business name Trainvent, support email, terms URL `https://stowgui.com/en/terms/`, privacy URL `https://stowgui.com/en/privacy/`.
3. **Invoices**: enable post-payment invoices on the Payment Link and add the footer `Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.`
4. **Payment Link**:
   - Quantity fixed at 1, collect billing address (needed for invoices).
   - Require agreement to the terms of service.
   - For immediate delivery, obtain express consent to delivery before the withdrawal period ends and acknowledgment of losing the right when delivery begins (§ 356 (5) BGB). Terms acceptance alone is not sufficient evidence of these declarations. Verify the actual hosted checkout, what Stripe records, and the contract confirmation before enabling live payments. Suggested consent wording:
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

## Purchase terms and confirmation

The German and English terms live in `dictionaries/de.ts` and `en.ts`. They cover personal/commercial use by one holder (one designated user for an organization), three installations, all 1.x versions, online activation and 30 days offline. The shutdown commitment is to provide existing holders a free update or another way to continue without periodic activation if the service is permanently discontinued.

Before live sales, supply the required contract confirmation on a durable medium, such as an email with the applicable terms/withdrawal information as text or an attachment. A link to a mutable terms page alone is not the same as supplying that content. Record the consent/acknowledgment actually obtained; never infer it just from payment or claim consent in an email when it was not collected. The current key email is delivery information, not a complete contract confirmation. If the early-expiry conditions are not met, handle the statutory withdrawal right instead of relying on immediate key delivery.

## License transfers

The holder may sell or give the complete license without a transfer fee, after stopping paid use and deleting licensed copies, keys and activation tokens under their control (including backups). Required purchase records may be retained without a right to reuse the credentials. The license cannot be split into seats or shared between holders.

Support arranges the change of holder and recovery address. Forwarding the old key is insufficient: the original holder could still request it through recovery. The operator process must authenticate the current holder, obtain the new holder's contact details appropriately, preserve accounting records, revoke the old credential and release old activations, issue a replacement with the same entitlement, and verify recovery only reaches the new holder. Old offline tokens cannot be remotely erased; the previous holder's duty to stop using and delete them applies immediately.

There is no operator transfer command or dedicated transfer endpoint yet. Implement and test the handover process before launch; do not describe it as automatic or process a transfer by changing only `licenses.email`. No new key format is required.

## Review before launch

Have the German customer terms and actual checkout/confirmation reviewed together. Verify processor arrangements, international transfers and retention/deletion practices against the published privacy notice. The operational license store is separate from statutory accounting retention. Third-party notices for the desktop build are tracked in the app repository.

Sources checked 2026-11-11: [§ 356 BGB](https://www.gesetze-im-internet.de/bgb/__356.html), [§ 312f BGB](https://www.gesetze-im-internet.de/bgb/__312f.html), [UsedSoft judgment summary](https://eur-lex.europa.eu/legal-content/EN/SUM/?uri=CELEX:62011CJ0128), [European Commission on personal data](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en).
