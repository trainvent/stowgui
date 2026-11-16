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

## Email layout

Email content is left aligned without a centered width cap or extra body
padding. License keys use adjacent inline-block spans, each containing four
original characters. There are no inserted spaces, zero-width characters or
hard line breaks; the text alternative and the selected/copied HTML text retain
the original key bytes.

This is a sanitizer workaround: Nextcloud Mail configures HTMLPurifier with
`CSS.AllowTricky`, which preserves `display:inline-block`, while the purifier's
CSS definitions do not include the wrapping properties used by the original
message. Its XHTML rules also predate `wbr`. Keep the inline spans even when
modern wrapping CSS works in a direct browser preview.

Source references: [Nextcloud purifier setup](https://github.com/nextcloud/mail/blob/main/lib/Service/Html.php),
[HTMLPurifier CSS definitions](https://github.com/ezyang/htmlpurifier/blob/master/library/HTMLPurifier/CSSDefinition.php).

When changing layout, test with wrapping CSS removed, at both narrow and wide
widths, and copy a wrapped key to confirm its bytes. The 2026-11-16 browser
fixture reproduced a 130-pixel inset and 3280-pixel scroll width in a 900-pixel
frame before the fix. Afterward, the inset was zero and scroll width matched the
viewport at both 320- and 900-pixel frame widths. Copying a wrapped 327-character
fixture key preserved every character. The user's own Nextcloud rendering
check remains separate because the signed-in client was unavailable to the
agent.
