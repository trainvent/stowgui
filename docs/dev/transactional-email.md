# Transactional email

The source and deployed Worker use Resend's HTTP email API. The switch was
deployed on 2026-11-16; received-message acceptance is recorded in
`tasks/legal-launch-review.md`. Sales remain disabled pending the other
legal-launch gates.

`worker/src/email.ts` retains the existing license body, language selection,
plain-text/HTML alternatives and purchase confirmation. It maps the bundled
PDF names to Resend's `attachments[].filename`, preserving their base64 bytes.
HTTP failures propagate to the webhook handler so Stripe retries delivery.
The local checkout captures the same Resend request without sending mail.

Provision Resend directly. Stripe Projects rejected creation for the existing
Trainvent account with `projects_ineligible`; the user authorized direct setup
on 2026-11-16. The user creates or signs in to the Resend account and accepts
its terms. Never print or commit API-key values.

The `stowgui.com` domain is verified in Ireland (`eu-west-1`), using the
`resend-mail` return path so the existing Brevo `send` record is preserved.
The Resend domain ID is `2717361d-acd7-477f-8509-697b6046e658`. Verify and read back `open_tracking: false` and
`click_tracking: false` on the domain. These are domain settings, not email
payload switches. Keep inbound-mail DNS and website records intact. Prefer a
domain-restricted sending key for the Worker, stored as `RESEND_API_KEY` through
Wrangler. The old Brevo Worker secret was removed after successful received-email
acceptance; the Brevo account and existing DNS records were left intact. The
temporary full-access CLI grant was revoked and its local profile removed.

The German/English privacy source and bundled PDFs describe Resend, disabled
tracking and US message storage under its DPA/SCCs. Ireland is the sending
region, not a storage-location guarantee. The German/English privacy pages
were published separately on 2026-11-16 (commit e890cdd), with live-page
verification. Other pending local terms and release changes remain unpushed.
Refresh checkout document references before enabling sales. After deployment, inspect an authorized received email's
MIME HTML for injected images and rewritten links; local request tests cannot
prove what the provider delivers. Verify both PDFs, language, key bytes,
reply-to and sender authentication.

References: [send email](https://resend.com/docs/api-reference/emails/send-email),
[domain tracking settings](https://resend.com/docs/api-reference/domains/update-domain).
