import { spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { LIVE_PRICE_ID, STRIPE_ACCOUNT_ID, WEBHOOK_URL, EVENTS, checkoutSettings } from './stripe-checkout-settings.mjs';
const { params, manifest } = checkoutSettings(LIVE_PRICE_ID);

function stripe(method, path, fields = {}) {
  const args = [method, path, '--live'];
  for (const [key, value] of Object.entries(fields)) args.push('-d', `${key}=${value}`);
  const response = spawnSync('stripe', args, { encoding: 'utf8' });
  let result;
  try { result = JSON.parse(response.stdout); } catch { throw new Error('Stripe CLI failed; check authentication.'); }
  if (response.status !== 0 || result.error) throw new Error(result.error?.message ?? 'Stripe request failed.');
  return result;
}

if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ paymentLink: params, webhook: { url: WEBHOOK_URL, events: EVENTS }, note: 'Preview only. --apply creates a live Payment Link, immediately deactivates it, and prepares the webhook secret. It does not deploy application code or publish a checkout URL.' }, null, 2));
} else {
  const account = stripe('get', '/v1/account');
  if (account.id !== STRIPE_ACCOUNT_ID) throw new Error('Select the verified Trainvent live account before provisioning StowGUI.');
  const links = stripe('get', '/v1/payment_links', { limit: '100' });
  let link = links.data.find(item => item.metadata?.app === 'stowgui' && item.metadata?.legal_source_sha256 === manifest.source);
  if (!link) {
    link = stripe('post', '/v1/payment_links', params);
    // Stripe supports active only on update, not on link creation.
    link = stripe('post', `/v1/payment_links/${link.id}`, { active: 'false' });
  }
  console.log(JSON.stringify({ paymentLinkId: link.id, url: link.url, active: link.active }));
  const endpoints = stripe('get', '/v1/webhook_endpoints', { limit: '100' });
  let endpoint = endpoints.data.find(item => item.url === WEBHOOK_URL);
  if (!endpoint) {
    endpoint = stripe('post', '/v1/webhook_endpoints', Object.fromEntries([
      ['url', WEBHOOK_URL], ['description', 'StowGUI license delivery'],
      ...EVENTS.map((event, i) => [`enabled_events[${i}]`, event]),
    ]));
    // A new endpoint's secret is only returned once; install it without logging it.
    const workerDir = fileURLToPath(new URL('../worker/', import.meta.url));
    const secretPath = fileURLToPath(new URL('../worker/.wrangler/live-webhook-secret.txt', import.meta.url));
    writeFileSync(secretPath, endpoint.secret, { mode: 0o600, flag: 'wx' });
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../worker/node_modules/wrangler/bin/wrangler.js', import.meta.url)), 'secret', 'put', 'STRIPE_WEBHOOK_SECRET'], {
      cwd: workerDir, input: endpoint.secret, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (result.status !== 0) throw new Error(`Webhook ${endpoint.id} was created but its secret could not be installed. Its secret is saved in worker/.wrangler/live-webhook-secret.txt; install it before continuing; do not activate the link.`);
    unlinkSync(secretPath);
    console.log('Live webhook secret installed.');
  }
  console.log(`Webhook: ${endpoint.id}. Verify events and secret, set STRIPE_PAYMENT_LINK_ID=${link.id}, deploy and test before activating the link or setting PAYMENT_LINK.`);
}
