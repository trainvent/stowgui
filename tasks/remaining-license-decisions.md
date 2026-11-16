# Remaining licence and withdrawal decisions

Prepared 2026-11-16. The user approved Stripe Managed Payments, access during
open disputes, revocation on full refund/confirmed lost chargeback, and the
dedicated withdrawal page with a new endpoint and records. These changes are
implemented locally; no production withdrawal migration or deployment has run.

Current implementation and rollout gates: [withdrawal function](../docs/dev/withdrawal.md).

## Disputes

The previously deployed `charge.dispute.created` handler permanently revokes access. An
opened dispute is not its final outcome, and the implementation cannot restore
access automatically if it is won. Match the final terms to the chosen policy.

Two simple options avoid introducing a new stored licence format:

1. **Approved: keep access during a dispute; revoke on an actual full refund or a final
   lost chargeback.** Listen to dispute closure rather than dispute creation.
   A won/withdrawn dispute leaves access intact. Before adopting this, confirm
   how later reinstatement/appeals are handled, so there is an explicit recovery
   path rather than assuming a closed status can never change.
2. **Refund-based revocation only.** Opening or losing a dispute does not
   automatically revoke the licence. Support can review exceptional cases.
   This accepts some unpaid use in exchange for avoiding additional access
   states on a EUR5 product.

The more complex alternative is temporary suspension with automatic restoration.
That requires a new dispute-state record, reconciliation for out-of-order and
duplicate events, preservation of independent refund/termination reasons, and
user approval for the stored-data changes. Never clear `revoked_at` merely
because a dispute was won: it could erase a separate refund or manual revocation.

No historical licence records should be restored or changed as part of a new
policy without separate approval. The two historical test purchases retain
their explicitly approved states.

## Withdrawal function: rough options

The function must collect/confirm the consumer's name, contract identification
and receipt destination, offer a clearly labelled confirmation, and promptly
send a durable acknowledgment containing the declaration and receipt date/time.
Source: [§356a BGB](https://www.gesetze-im-internet.de/bgb/__356a.html).

### A. Dedicated page (recommended fallback)

```text
Footer: Vertrag widerrufen
  -> Name | Bestellreferenz | E-Mail
  -> Erklärung prüfen
  -> Widerruf bestätigen
  -> Eingangsbestätigung per E-Mail
```

Simple, directly linkable and accessible from every site page. The customer
does not need a login or licence key. Submission is not refused merely because
the order or legal eligibility cannot be matched automatically.

### B. Compact dialog

```text
Footer: Vertrag widerrufen
  -> [ Name / Bestellreferenz / E-Mail ]
  -> [ Prüfen / Widerruf bestätigen ]
  -> Receipt email
```

Less navigation, but needs reliable focus/keyboard handling and a durable direct
link/fallback. It has no legal advantage over the dedicated page.

A provider-hosted route could replace either only after its actual function and
responsibility for this sale are verified. A generic support/refund link does
not establish that it meets the statutory function requirements.

## Approved fallback API and stored data

- `POST /withdrawal`: name, contract reference, email; server sets receipt ID
  and submission timestamp. Do not require or expose licence keys.
- Store the declaration before acknowledging submission. Persist receipt
  delivery state and retry failed email delivery without losing the original
  submission time. Choose and document retention/deletion before launch.
- A durable receipt repeats the user's declaration and its received date/time.
  It acknowledges receipt, not an already-approved refund or licence revocation.
- Prevent duplicate submissions and abuse; do not reveal whether an order
  exists, and include no database-derived personal/order details in a receipt
  sent to an unverified destination.
- Server-side validation, origin checks, limits, receipt-delivery retry and
  keyboard/error states need meaningful tests before deployment.

## Document changes after those decisions

Use the correctly completed statutory German notice/model form and a matching
English version; place the digital-content early-expiry explanation outside the
model. Fill in the actual responsible seller/contact and the working withdrawal
URL, not a placeholder. Do not claim legal model protection for paraphrased text.

Sources: [statutory notice](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_1.html),
[statutory form](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_2.html),
[digital-content expiry](https://www.gesetze-im-internet.de/bgb/__356.html).
Review provider checkout consent, transaction confirmation and app licence terms
together. Generate and inspect the four final PDFs only once these decisions
are reflected consistently in the implementation and both languages.
