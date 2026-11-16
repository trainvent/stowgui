# Legal launch remediation

Status: in progress, 2026-11-16. Keep sales disabled until the launch gates below pass.

## Confirmed decisions

- Worldwide sales through a merchant of record (MoR), selected by the user on 2026-11-16. Provider selection and commercial terms remain open. Stripe Projects provisions infrastructure; it does not make the existing Stripe Payment Link a MoR checkout.
- Replace Brevo with Resend. After Stripe rejected project creation for the existing Trainvent account, the user authorized direct Resend setup on 2026-11-16. The Stripe support request remains unsent.

## 1. Transactional email: first priority

- [x] Retest the deployed Brevo sender. User authorized recovery of existing test keys to their own `dummy@trainvent.com` inbox. HTTP 202; received 2026-11-16 at 08:07 CET. [Received message](https://mail.google.com/mail/u/?authuser=leon%40trainvent.com#all/1a1e32e402f2d5a3).
- [x] Inspect received MIME HTML without loading images. Two injected image tags share one Brevo `/tr/op/` URL: one Outlook conditional image and one hidden image. The download URL remains unchanged; there are no rewritten download links in this sample. Pixel presence does not establish event anonymity. SPF, DKIM and DMARC pass.
- [x] Prepare the Resend mailer, Worker secret binding and local checkout capture. Preserve language selection, exact key bytes, reply-to, HTML/text alternatives, PDFs and recorded consent. Provider failures must still trigger webhook retries.
- [x] Investigate Stripe Projects access; user chose direct setup after this blocker. Catalog contains `resend/email`; no resource was provisioned. Latest Projects plugin is 0.52.0. `stripe whoami` confirms Trainvent Super Administrator access. Explicit live-account initialization returns `PROJECTS_ACCOUNT_CONTEXT_UNSUPPORTED`, reason `projects_ineligible`, `retryable: false`. Project list is empty. The signed-in Projects dashboard shows only product information and documentation, with no activation control. Preflight reports ready but does not catch this server rejection.
- [x] User completed direct Resend signup/login in the `trainvent` team. Keep API-key values out of output and git.
- [x] Add the Resend domain in Ireland with tracking disabled. With explicit user approval, replace the initial unverified entry to use `resend-mail` rather than Brevo's existing `send` name. Current Resend domain ID: `2717361d-acd7-477f-8509-697b6046e658`. User chose to add DNS records themselves: TXT `resend._domainkey` (public signing key shown in Resend), CNAME `rresend-mail` → `rsend-euw1.forge.rmta.net`, CNAME `resend-mail` → `send.forge.rmta.net`. Existing Brevo DNS is unchanged.
- [x] Verify `stowgui.com` sender domain; add only required DNS records, preserving existing website and inbound mail. Disable both open and click tracking at domain level and read the settings back. Install a domain-restricted sending key as `RESEND_API_KEY` with Wrangler.
- [x] Check Resend's DPA, transfers and retention and update German/English privacy source and PDFs. Resend's DPA applies on account signup and includes SCCs. Ireland controls sending; stored message/log data is in the US. The verified Free plan has standard 30-day email/log retention. [Resend GDPR documentation](https://resend.com/security/gdpr), [DPA](https://resend.com/legal/dpa). The separate support-email provider remains part of the general privacy-practices review.
- [x] Deploy the Resend Worker and updated attachments after domain verification. Received recovery test at 08:43:04 CET in the authorized inbox: [message](https://mail.google.com/mail/u/?authuser=leon%40trainvent.com#all/1a1e34f44f379fa6). HTML contains zero image tags and no tracking URLs; download URL is unchanged. SPF, aligned stowgui.com DKIM and DMARC pass. Both received PDF SHA-256 values match the bundle. Two existing keys are present; none were issued, changed or revoked by this test.
- [x] Confirm the Worker key is send-only and restricted to stowgui.com. Revoke the temporary full-access Resend CLI grant, verify HTTP 401 “Grant has been revoked,” and remove its local profile. Remove the temporary local API-key file and this Worker's unused `BREVO_API_KEY` binding. The Brevo account and DNS records remain unchanged.
- [x] Verify the local purchase/consent/PDF/activation/refund flow with Resend-format capture. Actual provider delivery is covered separately by the received recovery test; no new hosted Stripe purchase was made.

Resend supports [domain-level tracking controls](https://resend.com/docs/api-reference/domains/update-domain) and [base64 email attachments](https://resend.com/docs/api-reference/emails/send-email). The EDPB puts email pixels within the scope of ePrivacy Article 5(3), but its scope guidance does not decide every consent exemption. Do not equate anonymisation with exemption under German law. [EDPB final guidance](https://www.edpb.europa.eu/documents/guideline/guidelines-22023-on-technical-scope-of-art-53-of-eprivacy-directive_en), [§25 TDDDG](https://www.gesetze-im-internet.de/tdddg/__25.html).

## 2. Contract and privacy copy

- [x] Add the essential-contractual-obligations definition in section 7, in German and English.
- [x] Separate payment performance, fraud prevention and statutory processing purposes/bases. Add Art. 6(1)(f) and the relevant interests for Cloudflare request data and GitHub updates; retain (b) for activation and contract performance. Stripe itself distinguishes fraud-prevention interests from legal-compliance duties; do not claim every Stripe fraud-related operation can only use (f). [Stripe privacy policy](https://stripe.com/privacy).
- [x] Describe key recovery, email support and data needed to perform the contract.
- [x] Add revision dates to all four documents and contract-language/input-correction/email-confirmation information to the terms. These describe the current checkout and require rechecking during MoR migration.
- [x] Regenerate all four PDFs and inspect every rendered page; bundle and manifests match the dictionary texts. Archive each published revision and checkout configuration at publication. Hashes alone do not recover old PDFs.
- [ ] Resolve section 4 dispute wording together with policy. The current handler permanently revokes on dispute creation and does not restore access after a won dispute. This is broader than a final chargeback. Do not add a sentence presenting all opened disputes as automatic lawful termination. Proposed policy for approval: suspend paid access during a dispute, restore it when resolved in the seller's favour, terminate only on a valid withdrawal/full refund or legally effective termination. Counsel must confirm wording and mandatory rights. Changing persisted revocation states requires user approval before implementation.
- [ ] Replace withdrawal instructions/form with correctly completed current statutory models, with the early-expiry explanation outside the model notice. Reconcile MoR seller identity, refund recipient and withdrawal-function location. [Official model](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_1.html).
- [ ] Have counsel assess the combined terms/delivery checkbox; separate express consent and acknowledgment if the selected checkout permits. Treat withdrawal rights as continuing where early-expiry evidence is insufficient, rather than assuming the €5 price removes the risk.
- [ ] Counsel review of low-priority business jurisdiction and applicable sanctions/export restrictions. Do not add a clause purporting to restrict consumer venue rights.

## 3. Worldwide checkout through a merchant of record

- [ ] Select a provider accepting a German sole proprietor and downloadable desktop software. Compare net proceeds at €5, minimum payouts, supported countries, tax invoices/B2B IDs, refunds, disputes and customer support responsibilities. Worldwide means the provider's supported markets, subject to restrictions.
- [ ] Confirm in writing who sells to the consumer, invoices, collects/remits indirect tax and handles withdrawal. MoR does not remove the developer's own income-tax/accounting or product obligations.
- [ ] Replace direct Stripe checkout for new sales. Map signed, replay-safe paid/refund/dispute events to license issuance and revocation while preserving existing keys and legacy Stripe purchase handling. Propose schema/API changes for approval before implementation.
- [ ] Remove the blanket §19 invoice footer from the new provider checkout; use the provider's correct tax invoices. Do not enable Stripe automatic tax as a substitute for MoR setup.
- [ ] Test customer country and business-tax-ID handling, paid confirmation, duplicate events, refunds and disputes in the provider sandbox. Keep real checkout activation as a separate explicit launch step.

The review's €10,000 claim needs qualification: the threshold combines relevant cross-border EU B2C electronic services and intra-EU distance goods sales across the business, in both the preceding and current calendar years. Germany's domestic exemption is not automatic EU-wide exemption; a separate cross-border SME scheme has existed since 2025. Ask the tax adviser to apply these rules to the actual business, rather than treating OSS as the only possible regime. [§3a(5) UStG](https://www.gesetze-im-internet.de/ustg_1980/__3a.html), [BMF cross-border SME guidance](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-03-18-sonderregelung-kleinunternehmer.pdf?__blob=publicationFile&v=3).

## 4. Online withdrawal

The final German law applies from 19 June 2026; this is already a launch requirement, not an unverified future proposal. [Promulgated law](https://eur-lex.europa.eu/legal-content/DE/TXT/PDF/?uri=NIM%3A202601649), [§356a BGB](https://www.gesetze-im-internet.de/bgb/__356a.html).

- [ ] Confirm whether the selected MoR supplies the required function for these contracts. If not, agree the responsibility and implementation before integrating it.
- [ ] Prepare 2-3 rough UI options before choosing the final design, as required by the user's UI rule. The minimum flow is a prominent `Vertrag widerrufen` entry, name/contract reference/acknowledgment email, review and `Widerruf bestätigen`, then immediate durable acknowledgment with the declaration and submission date/time. Do not require an account, license key or advance validity adjudication to submit.
- [ ] Proposed fallback, not yet approved: a localized static withdrawal page calling a Worker `POST /withdrawal` endpoint with `{name, contract_reference, email}`; a durable submission/outbox record and retryable receipt delivery; origin checks, validation, abuse limits and duplicate protection. A receipt acknowledges submission and does not promise that eligibility or a refund has already been decided. Ask before introducing this public endpoint and stored-data schema.
- [ ] Test timely submission, invalid/missing input, duplicate requests, receipt failure/retry, inaccessible accounts and ambiguous/expired orders. Publish the function's location in the statutory notice and confirmation.

Digital-content early expiry requires performance start, express consent, acknowledgment and contract confirmation; delivery alone is insufficient. The current statutory provision is [§356(6) BGB](https://www.gesetze-im-internet.de/bgb/__356.html). `docs/dev/selling.md` still cites paragraph 5; correct that citation together with the legally reviewed checkout changes.

## Launch gates

- [x] Resend delivery received and verified without tracking; updated privacy source and email PDFs describe the verified configuration.
- [x] Publish and verify the German/English privacy pages after a fresh received-message test on 2026-11-16. Publication commit `e890cdd01e2530e32f7db44f72e6586b3e9caf6c` contains only the two privacy dictionary properties, based on the previously published website. Unrelated local release and terms changes were preserved without publication. [Successful Pages run](https://github.com/trainvent/stowgui/actions/runs/43826573504).
- [ ] Refresh the selected checkout's document references before sales.
- [ ] MoR approved/onboarded, tax/invoicing responsibilities confirmed and sandbox acceptance passed.
- [ ] Withdrawal function/notice, consent, dispute policy and German/English terms reviewed together by counsel.
- [ ] All published document revisions archived; site, email attachments and checkout metadata match.
- [ ] Website/Worker checks pass; request launch authorization. The user separately authorized the Worker email cutover; website push and checkout activation remain separate steps.

## Stripe support request (not sent; superseded by direct setup)

Please check Stripe Projects eligibility for my existing Trainvent account,
`acct_1TBaml3SIDKPozJg`. I want to provision Resend through Projects on this
account. Stripe CLI 1.55.1 and the latest Projects plugin 0.52.0 are installed;
the CLI authenticates as a Super Administrator authorized for this account.
Catalog search finds `resend/email`, and initialization preflight says ready,
but actual initialization with the explicit live account returns
`PROJECTS_ACCOUNT_CONTEXT_UNSUPPORTED`, reason `projects_ineligible`,
`retryable: false`. The signed-in Projects overview only displays product
information and a documentation link, without an enable/onboarding action.
What eligibility requirement or onboarding step is missing, and can Projects
be enabled for this existing account?

## Local verification

- Worker type checking and all 34 tests pass, including local D1 integration.
- Website production build, type checking, lint and legal-attachment freshness pass.
- Local checkout smoke passes through the Resend request capture: signed purchase event, exact consent, PDF checksums, activation and full-refund revocation. No real email/payment is sent by this check.
- All nine rendered pages of the four updated PDFs were inspected. Copies are in `~/Dokumente/Agents/stowgui/legal/`.
- Resend domain verified, restricted key installed, provider delivery and received attachment hashes passed. Worker code version `8c48b0aa-d749-4ac9-a13f-28ef3f92b5a0`; removing the obsolete Brevo binding produced active version `474b668b-70f8-472e-9c60-7fce47b17466`. The original cutover did not push the website or enable sales. The privacy-only website publication was subsequently authorized and verified as recorded above; sales remain disabled.
- The first recovery request 16 seconds after deployment still produced a Brevo message with old PDFs. Cloudflare reported the new version and its downloaded script contained Resend and no Brevo sender. The repeat after the normal five-minute resend cooldown reached Resend correctly. Rollout propagation is the likely explanation; no source workaround was applied.


## Fresh test and policy publication - 2026-11-16

At the user's request, a fresh recovery email reached `dummy@trainvent.com` at
08:48:06 CET: [received message](https://mail.google.com/mail/u/?authuser=leon%40trainvent.com#all/1a1e353e02e78b97).
The received HTML has no image tags or tracking URLs; SPF, aligned Resend DKIM
and DMARC pass. Both current PDFs and the existing keys are present. The prior
08:43 test established the exact attachment hashes and unchanged key bytes.

After this passed, the privacy-only publication was type-checked, linted and
built locally, pushed directly to remote main and deployed successfully by
GitHub Actions. Live `/de/privacy/` and `/en/privacy/` return the updated Resend
notice, disabled tracking and US storage/SCC disclosure without Brevo. The
publication was merged into local main, preserving all unpushed work. Checkout
activation and publication of other pending local changes remain separate.
