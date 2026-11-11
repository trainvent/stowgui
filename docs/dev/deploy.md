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
