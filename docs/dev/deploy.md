# Deploying stowgui.com

## Website (GitHub Pages)

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**: add `PAYMENT_LINK` (Stripe Payment Link URL) and `LICENSE_API_URL` (`https://stowgui-license.trainvent.workers.dev`, already set). Without them the Buy button is disabled and the key form asks people to write to support.
3. Push to `main`. `.github/workflows/pages.yml` lints, type-checks, builds and deploys; pull requests only build.
4. **Settings → Pages → Custom domain**: `stowgui.com` (`public/CNAME` already contains it). Enable **Enforce HTTPS** once the certificate is ready.
5. DNS at your registrar:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
   | AAAA | @ | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
   | CNAME | www | trainvent.github.io |

   Verify the domain for the `trainvent` organisation (Org settings → Pages) to prevent takeovers.

## License Worker (Cloudflare)

The Worker runs at `https://stowgui-license.trainvent.workers.dev` (Cloudflare account of leon@trainvent.com, D1 database `stowgui-licenses` in WEUR). stowgui.com's DNS is at the registrar (Above.com), so a `license.stowgui.com` custom domain would need the zone moved to Cloudflare first.

```sh
cd worker
npx wrangler login
npm run db:migrate
npm run keypair                              # keep the output safe
npx wrangler secret put LICENSE_SIGNING_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put BREVO_API_KEY
npm run deploy
```

## D1 deployment workaround

Use `npm run deploy` in `worker/`, not a direct `wrangler deploy`. `scripts/deploy.mjs` reads the canonical `wrangler.toml` through Wrangler, writes a private temporary upload config, and delegates deployment to Wrangler. It changes only the D1 upload binding from deprecated `id` to current `database_id`; the database UUID, secret inheritance, variables and other bindings are preserved. The temporary file is removed afterward. Development and migrations continue to use `wrangler.toml` unchanged.

On 2026-11-11, standard uploads with Wrangler 4.159.0 and 4.160.0 failed with error 10021, while the same Worker and database using `database_id` uploaded and deployed successfully. The deployed version is `0f981bf6-f6f2-4ac5-906a-dc2e9f7c1c4b`. See [the upstream follow-up](../../tasks/wrangler-d1-binding.md) for the removal condition. The workaround uses Wrangler's experimental raw-config API and metadata escape hatch, so rerun the dry run and deployment checks after upgrading Wrangler.

A local bundle check is `npm run deploy -- --dry-run`. This does not test whether Cloudflare accepts the remote binding: the regression occurs in the upload API, and the live upload/endpoint checks are the verification for that failure.


## Hosted license sandbox

The separate Worker is `https://stowgui-license-sandbox.trainvent.workers.dev`.
Its configuration is `worker/wrangler.sandbox.toml`; its D1 database is
`stowgui-licenses-sandbox` (`2aebb254-ecf8-483c-81d0-62930fc9c33c`). Its signing
key, credentials and rate-limit namespace are separate from production.
The sandbox entrypoint runs the production license handler but exposes only
activation, check-in, list, rename and deactivate routes, plus a `/health`
marker. Payment webhooks, recovery email and all other routes return 404.

From `worker/`, prepare private test credentials and desktop profiles:

```sh
npm run sandbox:seed
```

This preserves existing sandbox credentials in `.wrangler/sandbox/credentials.json`
and writes private `secrets.json` and `seed.sql` files alongside them. Do not
commit these files or copy production signing keys here. The default desktop
checkout is `../../stowgui_source`; set `STOWGUI_APP_DIR` if it is elsewhere.
A new machine must receive the private sandbox credentials securely, or provision
new credentials and redeploy/reseed the sandbox together. Preparing a new local
key alone does not change the hosted service's signing key.

Migrate and seed only the sandbox, then check and deploy its bundle:

```sh
npm run sandbox:migrate
npx wrangler d1 execute stowgui-licenses-sandbox --config wrangler.sandbox.toml --remote --file .wrangler/sandbox/seed.sql
npm run sandbox:deploy -- --dry-run
npm run sandbox:deploy
```

The deployment wrapper now accepts `--config`; its default remains the original
production `wrangler.toml`. Sandbox deployment explicitly selects the separate
config and uploads only the sandbox signing key using `--secrets-file`.
The database seed is idempotent and does not reset existing activation or
revocation scenarios. Interactive testing and the Rust smoke check use different
synthetic licenses.

From the desktop repository, launch without a local server:

```sh
node scripts/license-sandbox.mjs cloud 1
node scripts/license-sandbox.mjs cloud-check
```

Use the key in `target/cloud-license-sandbox/test-key.txt` in the desktop app's
License settings; `2`, `3` and `4` select other profiles. `cloud-check` uses its
own credential/profile under `target/cloud-license-sandbox/check/` and checks
activation, signatures, persistence, renewal, rename and self-deactivation.
The normal activation limit remains ten management/activation requests per
minute per license; wait a minute if repeatedly running checks triggers it.

Deployed on 2026-11-11 as version `044a7609-844f-4c25-a758-f3dbe14abc6b`, with
migrations 0001–0003 applied to the sandbox database. Hosted checks confirmed
route restrictions, forged-key rejection, three active seats after a fourth
activation and explicit reclaim. Production's deployment remained
`0f981bf6-f6f2-4ac5-906a-dc2e9f7c1c4b`.
