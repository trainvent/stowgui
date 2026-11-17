# Deploying stowgui.com

## Website (GitHub Pages)

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**: `PAYMENT_LINK` (live Stripe Payment Link URL) and `LICENSE_API_URL` (`https://stowgui-license.trainvent.workers.dev`). Without them the Buy button is disabled and the key form asks people to write to support.
3. Push to `main`. `.github/workflows/pages.yml` lints, type-checks, builds and deploys; pull requests only build.
4. **Settings → Pages → Custom domain**: `stowgui.com` (`public/CNAME` already contains it), with **Enforce HTTPS**.
5. DNS at the registrar:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
   | AAAA | @ | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
   | CNAME | www | trainvent.github.io |

   The domain is verified for the `trainvent` organisation (Org settings → Pages) to prevent takeovers.

## License Worker (Cloudflare)

The Worker runs at `https://stowgui-license.trainvent.workers.dev` (D1 database `stowgui-licenses` in WEUR). stowgui.com's DNS is at the registrar (Above.com), so a `license.stowgui.com` custom domain would need the zone moved to Cloudflare first. Email goes through Resend; see [transactional email](transactional-email.md) before changing the sender.

```sh
cd worker
npx wrangler login
npm run db:migrate
npm run keypair                              # first setup only; keep the output safe
npx wrangler secret put LICENSE_SIGNING_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npm run deploy
```

Apply new migrations with `npm run db:migrate` before deploying code that needs them.

## Hosted sandbox

A separate Worker, `https://stowgui-license-sandbox.trainvent.workers.dev`, hosts
a sandbox build of the site with the production purchase, activation, recovery
and withdrawal handlers. Config: `worker/wrangler.sandbox.toml`; database:
`stowgui-licenses-sandbox`. Its signing key, secrets and rate-limit namespace are
separate from production. It accepts only signed Stripe TEST events from the
dedicated TEST link `plink_1UcMFl3SIDKPozJgaof11Fv0` (webhook
`we_1UcMFn3SIDKPozJg9VqHhjEp`) and captures all email into its own database; no
email leaves it.

Open `/de/` or `/en/` on the sandbox. The banner links to the private test inbox;
its key is in `worker/.wrangler/sandbox/inbox-key.txt`. Use synthetic customer
details and Stripe test cards. Captured keys only verify with the desktop
sandbox profile, not the production app.

Set up or refresh it:

```sh
# from worker/: private credentials, secrets.json and seed.sql in .wrangler/sandbox/
npm run sandbox:seed
npm run sandbox:migrate
npm run sandbox:mail-migrate
npx wrangler d1 execute stowgui-licenses-sandbox --config wrangler.sandbox.toml --remote --file .wrangler/sandbox/seed.sql

# from the repository root: static sandbox site (refuses live checkout URLs, noindex)
npm run sandbox:build

# from worker/
npm run sandbox:deploy
```

`sandbox:seed` keeps existing credentials and secrets; it is idempotent and does
not reset activation or revocation scenarios. Never copy production signing keys
into `.wrangler/sandbox/` or commit its files. A new machine needs the private
sandbox credentials, or new credentials followed by a reseed and redeploy.

`node scripts/check-hosted-sandbox.mjs` (repository root) verifies the hosted
site, inbox access, rejection of live events, duplicate-safe issuance, PDF
checksums, activation, dispute and refund revocation and withdrawal receipts
with synthetic signed events. It writes its result to
`worker/.wrangler/sandbox/acceptance.json`.

From the desktop repository, `node scripts/license-sandbox.mjs cloud 1` prepares
a desktop profile (key in `target/cloud-license-sandbox/test-key.txt`; `2`–`4`
select other profiles) and `node scripts/license-sandbox.mjs cloud-check` checks
activation, renewal, rename and deactivation. The activation limit is ten
requests per minute per licence.
