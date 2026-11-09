# Deploying stowgui.com

## Website (GitHub Pages)

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**: add `PAYMENT_LINK` (Stripe Payment Link URL) and `LICENSE_API_URL` (e.g. `https://license.stowgui.com`). Without them the Buy button is disabled and the key form asks people to write to support.
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

`wrangler.toml` routes the Worker to `license.stowgui.com`, which requires the stowgui.com zone on Cloudflare (keep the GitHub Pages records as "DNS only"). If DNS stays elsewhere, remove the `routes` line and use the `*.workers.dev` URL as `LICENSE_API_URL`.

```sh
cd worker
npx wrangler login
npx wrangler d1 create stowgui-licenses      # put the id into wrangler.toml
npm run db:migrate
npm run keypair                              # keep the output safe
npx wrangler secret put LICENSE_SIGNING_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npm run deploy
```
