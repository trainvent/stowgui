# Selling StowGUI

Sales run through Stripe Managed Payments: Stripe's affiliate Link is merchant of
record and handles payment, VAT, invoices and transaction support. Trainvent
provides the product, licence and support.

## Flow

1. Buy button → Stripe Payment Link (hosted checkout).
2. After payment Stripe redirects to `https://stowgui.com/buy/success/`, which forwards to the visitor's language.
3. Stripe sends `checkout.session.completed` to the Worker (`POST /stripe/webhook`). The Worker signs a license key, stores it in D1 and emails it via Resend. If the email fails, the Worker returns an error and Stripe's retry sends it.
4. `charge.refunded` (full refund) and `charge.dispute.closed` with status `lost` revoke the key. Open disputes, wins and closed inquiries keep access. The app sees revocation at its next activation/check-in. An offline installation can use its existing token until its signed 30-day expiry. If a loss is later overturned, support must check payment and any independent refund/termination before restoring access; never clear revocation solely on a won-dispute or funds-reinstated event. Existing historical revocations are not automatically changed.
5. `/license/` on the site lets buyers request their key again (`POST /license/resend`, 5-minute cooldown, same answer for unknown addresses).

## Stripe setup

- **Product**: "StowGUI license", tax code `txcd_10202001` (personal utility software), one-time price 5,00 EUR tax-inclusive.
- **Settings → Public details**: business name Trainvent, support email, terms URL `https://stowgui.com/en/terms/`, privacy URL `https://stowgui.com/en/privacy/`. The checkout's terms checkbox links to this terms URL; it applies to the whole Trainvent account.
- **Payment Link** `plink_1UcLkP3SIDKPozJgf3ky30XT`: Managed Payments, quantity 1, billing address, terms acceptance required, redirect to `https://stowgui.com/buy/success/`. `scripts/stripe-checkout-settings.mjs` holds these settings. Managed Payments does not allow custom checkout text, so no early-expiry consent is collected: buyers keep the 14-day withdrawal right.
- The link URL is the GitHub variable `PAYMENT_LINK`; its ID is `STRIPE_PAYMENT_LINK_ID` in `worker/wrangler.toml`. The Worker ignores purchases from other links.
- **Webhook** `we_1Uc3U63SIDKPozJgYJaCYa0m` → `https://stowgui-license.trainvent.workers.dev/stripe/webhook`, events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.closed`. Its signing secret is `STRIPE_WEBHOOK_SECRET`. Keep Dashboard dispute notifications on for handling cases and later reversals.

## Withdrawals

`/withdrawal/` stores the declaration and emails a receipt to the buyer and a notice to support (see [withdrawal](withdrawal.md)). It does not refund or revoke anything: support issues the full refund in the Stripe Dashboard, and the refund event revokes the key.

## Email

Key emails come from `license@stowgui.com` through Resend, with replies to support@trainvent.com. Open and click tracking are off; see [transactional email](transactional-email.md).

## Local test

`npm run dev:checkout` runs the whole purchase flow against Stripe test mode with a local database and inbox; see [local checkout testing](local-checkout.md).

## Purchase terms and confirmation

The German and English terms live in `dictionaries/de.ts` and `en.ts`. They cover personal/commercial use by one holder (one designated user for an organization), three installations, all 1.x versions, online activation and 30 days offline. The shutdown commitment is to provide existing holders a free update or another way to continue without periodic activation if the service is permanently discontinued.

Each key email is the contract confirmation on a durable medium: it attaches the current terms (with withdrawal information and the model form) and the privacy notice, and states the order reference, amount paid and, when Stripe records it, that the terms were accepted at checkout. Never claim consent in an email that checkout did not collect. See [PDF generation and limitations](legal-documents.md).

## License transfers

The holder may sell or give the complete license without a transfer fee, after stopping paid use and deleting licensed copies, keys and activation tokens under their control (including backups). Required purchase records may be retained without a right to reuse the credentials. The license cannot be split into seats or shared between holders.

Support arranges the change of holder and recovery address. Forwarding the old key is insufficient: the original holder could still request it through recovery. The operator process must authenticate the current holder, obtain the new holder's contact details appropriately, preserve accounting records, revoke the old credential and release old activations, issue a replacement with the same entitlement, and verify recovery only reaches the new holder. Old offline tokens cannot be remotely erased; the previous holder's duty to stop using and delete them applies immediately.

The operator command is `node worker/scripts/transfer-license.mjs --license <id> --from <current-email> --to <new-email> --signing-key-file <private-key-file>`. It previews by default. After authenticating the holder through their current recovery address, obtaining their confirmation that licensed copies/keys/tokens were removed, and obtaining the recipient's agreement, add `--apply --holder-verified --deletion-confirmed --recipient-agreed`.

The command uses the existing Wrangler login and D1 binding. It verifies the supplied signing key against the old credential, preserves its entitlement, and batches replacement issuance, old-key revocation and old-seat deletion. It guards against a concurrently changed/revoked original. Original purchase records remain unchanged; the replacement has a `transfer:<old-id>:<new-id>` reference and retains the payment intent so a later refund/dispute revokes the replacement too. Record the support authorization and resulting replacement ID privately. The command prints no key. Send the replacement through the website recovery form and confirm receipt; the former holder's recovery address must return no active key from this purchase. Check both old activation rejection and new activation. A failure after submission requires inspecting the database before retrying. Existing offline tokens remain usable until expiry unless deleted by the previous holder.

The local D1 integration test covers entitlement preservation, old-seat removal, recovery isolation, stale repeat requests and later refunds. No production customer has been transferred by these tests. No schema or issued-key format change is required.

## Sources

The open legal review items are in [after launch](../../tasks/after-launch.md). Sources checked 2026-11-11: [§ 356 BGB](https://www.gesetze-im-internet.de/bgb/__356.html), [§ 312f BGB](https://www.gesetze-im-internet.de/bgb/__312f.html), [UsedSoft judgment summary](https://eur-lex.europa.eu/legal-content/EN/SUM/?uri=CELEX:62011CJ0128), [European Commission on personal data](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en).
