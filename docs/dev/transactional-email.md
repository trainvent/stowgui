# Transactional email

The Worker sends licence and withdrawal emails through Resend's HTTP API.

`worker/src/email.ts` builds the license body, language selection,
plain-text/HTML alternatives and purchase confirmation. It maps the bundled
PDF names to Resend's `attachments[].filename`, preserving their base64 bytes.
HTTP failures propagate to the webhook handler so Stripe retries delivery.
The local checkout captures the same Resend request without sending mail.

Never print or commit API-key values.

The `stowgui.com` domain is verified in Ireland (`eu-west-1`), using the
`resend-mail` return path (the `send` name belongs to an older Brevo setup).
The Resend domain ID is `2717361d-acd7-477f-8509-697b6046e658`. Verify and read back `open_tracking: false` and
`click_tracking: false` on the domain. These are domain settings, not email
payload switches. Keep inbound-mail DNS and website records intact. Prefer a
domain-restricted sending key for the Worker, stored as `RESEND_API_KEY` through
Wrangler.

The privacy notices and PDFs describe Resend, disabled tracking and US message
storage under its DPA/SCCs; Ireland is the sending region, not a storage-location
guarantee. After changing the sender, inspect a received email's MIME HTML for
injected images and rewritten links, and check both PDFs, language, key bytes,
reply-to and sender authentication; local tests cannot prove what the provider
delivers.

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
widths, and copy a wrapped key to confirm its bytes.
