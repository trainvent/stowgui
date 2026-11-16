# Transactional email

The source uses Resend's HTTP email API. The deployed Worker still uses Brevo
until the migration checklist in `tasks/legal-launch-review.md` is completed.
Do not deploy this source without the Resend domain and secret being ready.

`worker/src/email.ts` retains the existing license body, language selection,
plain-text/HTML alternatives and purchase confirmation. It maps the bundled
PDF names to Resend's `attachments[].filename`, preserving their base64 bytes.
HTTP failures propagate to the webhook handler so Stripe retries delivery.
The local checkout captures the same Resend request without sending mail.

Provision Resend through Stripe Projects on Trainvent. Current provisioning is
blocked by account eligibility, not missing service availability. After access
is resolved, use the CLI-installed Projects instructions for service creation
and credential retrieval. Never print or commit API-key values.

Verify `stowgui.com` for sending and read back `open_tracking: false` and
`click_tracking: false` on the domain. These are domain settings, not email
payload switches. Keep inbound-mail DNS and website records intact. Prefer a
domain-restricted sending key for the Worker, stored as `RESEND_API_KEY` through
Wrangler. Retire the old Brevo secret only after successful cutover.

Before deployment, update the privacy notice from Brevo to the verified Resend
arrangement, regenerate and visually inspect the PDFs, and refresh checkout
document references. After deployment, inspect an authorized received email's
MIME HTML for injected images and rewritten links; local request tests cannot
prove what the provider delivers. Verify both PDFs, language, key bytes,
reply-to and sender authentication.

References: [send email](https://resend.com/docs/api-reference/emails/send-email),
[domain tracking settings](https://resend.com/docs/api-reference/domains/update-domain).
