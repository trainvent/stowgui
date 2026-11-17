import { spawnSync } from 'node:child_process';
import { readFileSync, cpSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sandbox = join(root, 'worker/.wrangler/sandbox');
const sandboxApi = 'https://stowgui-license-sandbox.trainvent.workers.dev';
const checkout = JSON.parse(readFileSync(join(sandbox, 'checkout.json'), 'utf8'));
if (checkout.livemode !== false || !checkout.url.startsWith('https://buy.stripe.com/test_')) throw new Error('Refusing a live checkout in the sandbox.');
const result = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', env: {
  ...process.env, NEXT_PUBLIC_SANDBOX: 'true', NEXT_PUBLIC_LICENSE_API_URL: sandboxApi, NEXT_PUBLIC_PAYMENT_LINK: checkout.url,
} });
if (result.status) process.exit(result.status);
const site = join(sandbox, 'site');
rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(join(root, 'out'), site, { recursive: true });
rmSync(join(site, 'CNAME'), { force: true });
writeFileSync(join(site, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
rmSync(join(site, 'sitemap.xml'), { force: true });
console.log('Separate sandbox site built with Stripe TEST checkout and no-index settings.');
