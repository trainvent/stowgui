import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PRICE_ID = 'price_1Uauhs3SIDKPozJgG76NVzVE';
const WEBHOOK_URL = 'https://stowgui-license.trainvent.workers.dev/stripe/webhook';
const SUCCESS_URL = 'https://stowgui.com/buy/success/';
const INVOICE_FOOTER = 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.';
const CONSENT = 'I agree to the [terms](https://stowgui.com/en/terms/) and that delivery of the license key begins immediately. I know that I lose my right of withdrawal once delivery has begun. / Ich stimme den [AGB](https://stowgui.com/de/terms/) zu und dass die Lieferung des Lizenzschlüssels sofort beginnt. Mir ist bekannt, dass ich dadurch mit Beginn der Lieferung mein Widerrufsrecht verliere.';
const EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'charge.refunded', 'charge.dispute.created'];
const manifest = JSON.parse(readFileSync(new URL('../worker/src/legal/manifest.json', import.meta.url)));
const params = {
  'line_items[0][price]': PRICE_ID, 'line_items[0][quantity]': '1',
  billing_address_collection: 'required', 'consent_collection[terms_of_service]': 'required',
  'custom_text[terms_of_service_acceptance][message]': CONSENT,
  'after_completion[type]': 'redirect', 'after_completion[redirect][url]': SUCCESS_URL,
  'invoice_creation[enabled]': 'true', 'invoice_creation[invoice_data][footer]': INVOICE_FOOTER,
  'metadata[app]': 'stowgui', 'metadata[legal_source_sha256]': manifest.source,
};
for (const [name, hash] of Object.entries(manifest.pdfs)) params[`metadata[${name.replaceAll('.', '_')}]`] = hash;

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
  if (account.id !== 'acct_1TBaml3SIDKPozJg') throw new Error('Select the verified Trainvent live account before provisioning StowGUI.');
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
