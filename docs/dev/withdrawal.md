# Online withdrawal

Implementation is local and not yet deployed. The user approved the dedicated
page, public endpoint and stored records on 2026-11-16. Keep sales disabled
until the rollout gates below are resolved.

## Customer flow

Both language variants have a prominent footer link to `/de/withdrawal/` or
`/en/withdrawal/`. Customers enter their name, a contract description/order
reference and receipt email, review the declaration, then confirm it. No login,
licence key or automatic order/eligibility match is required. Confirmation
acknowledges receipt, not a refund decision or automatic licence revocation.

The German notice follows the current statutory model, completed for Trainvent
and the planned function URL. The English notice matches it. The digital-content
early-expiry explanation is outside the model, and the model form is kept on
one PDF page. These drafts require final review against the actual checkout;
the public URL must work before the notice is published or emailed to buyers.

Sources: [§356a BGB](https://www.gesetze-im-internet.de/bgb/__356a.html),
[notice model](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_1.html),
[form model](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_2.html).

## Endpoint and record

`POST /withdrawal` accepts JSON `{name, contract_reference, email, locale}`
and a client-generated UUID v4 in `Idempotency-Key`. The same key and values
return the original server receipt ID/time; changing values under that key
returns 409. Successful submissions return 202 and `{id, received_at}`.
Failed transport requests should retry with the original key and values.

Migration `0005_withdrawals.sql` stores the provided fields, the exact declaration,
original receipt time and delivery attempts/status. It has no relationship to
license revocation. The handler does not look up purchases or include stored
customer data in an email to an unverified address. Request bodies and field
lengths are bounded; control characters and malformed fields are rejected.
Only configured site origins are accepted, with CORS preflight and per-IP
rate limiting using a separately prefixed key in the existing limiter.

The record is committed before delivery. Receipt emails contain the declaration,
customer-provided fields, original UTC timestamp and receipt reference. They
use plain text and the domain-restricted Resend sender without tracking.
The user also approved a separate notification to `support@trainvent.com`.
Support receives only the submitted declaration/details and can reply to the
provided email. Its delivery has independent attempts/status: retrying a failed
support notification does not resend an already delivered customer receipt.
Atomic D1 claims lease delivery for five minutes. Failed delivery uses bounded
exponential backoff up to one hour; a minute cron retries batches of 20.
Resend's stable idempotency key reduces duplicate provider delivery. Its
idempotency window is finite: after a crash/long outage an additional receipt
can be delivered, but the declaration is still recorded only once.

## Verification

- Worker type checking and 40 tests pass, including real local D1 storage,
  duplicate/conflicting submissions, concurrent claims, failed delivery/retry,
  origin/input/size/rate rejection and receipt content.
- Both language flows passed browser review, confirmation and persisted receipt
  testing with temporary D1 and local email capture. Editing preserves entered
  details and each step moves keyboard focus to its heading.
- No real withdrawal, external receipt email or production record was created
  by these tests.

## Rollout gates

- Agree retention/deletion rules and an operator routine to process the approved
  support notifications, track refunds and monitor delivery failures. The current
  migration deliberately does not invent a legal retention period or delete
  live records. Do not deploy until these operational duties are assigned.
- Confirm Trainvent/Stripe responsibilities and actual licence-terms presentation
  in Managed Payments checkout. Its UI disables the seller terms checkbox and
  custom consent wording; do not assume recorded early-expiry consent exists.
- Review the completed notices, privacy disclosures and mandatory rights with
  counsel. Recheck provider terms when launching.
- Apply the migration before deploying the Worker/cron. Update Stripe's event
  subscription from `charge.dispute.created` to `charge.dispute.closed` with the
  new Worker; preserve purchase/refund events and existing keys.
- Set the production website's licence API URL, deploy/test the function and
  received email, then publish matching notices/PDFs/checkout metadata together.
  Website push and sales activation require separate user instructions.
