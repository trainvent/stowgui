import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { generateKeyPairSync, createHmac, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir, mkdtemp, rm } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { STRIPE_ACCOUNT_ID, TEST_PRODUCT_ID, PERSONAL_UTILITY_TAX_CODE, EVENTS, checkoutSettings } from './stripe-checkout-settings.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workerDir = join(repo, 'worker');
const check = process.argv.includes('--check');
const appOnly = process.argv.includes('--app');
const SITE_PORT = Number(process.env.STOWGUI_SITE_PORT ?? 3000);
const API_PORT = Number(process.env.STOWGUI_CHECKOUT_PORT ?? 18766);
const site = `http://127.0.0.1:${SITE_PORT}`;
const state = check ? await mkdtemp(join(tmpdir(), 'stowgui-checkout-check-')) : join(workerDir, '.wrangler/checkout-test');
const appRepo = resolve(process.env.STOWGUI_APP_DIR ?? join(repo, '../stowgui_source'));
const profile = check ? join(state, 'profile') : join(appRepo, 'target/checkout-sandbox');
const MAX_REQUEST_BYTES = 1_048_576;
const SECRET_PATTERN = /whsec_[A-Za-z0-9_]+/g;
const EMAIL_TITLE = 'Test inbox';
const EMPTY_MAIL = 'Complete a test checkout to see its license email here.';
const children = [];
let mf, server, originalContext, latestMail;
let shuttingDown = false;

function stripe(method, path, fields = {}) {
  const args = [method, path];
  for (const [key, value] of Object.entries(fields)) args.push('-d', `${key}=${value}`);
  const result = spawnSync('stripe', args, { encoding: 'utf8' });
  let data;
  try { data = JSON.parse(result.stdout); } catch { throw new Error(`Stripe command failed: ${path}. Check CLI authorization.`); }
  if (result.status !== 0 || data.error) throw new Error(data.error?.message ?? 'Stripe request failed.');
  return data;
}
function launch(command, args, options = {}) {
  const child = spawn(command, args, { cwd: repo, ...options });
  children.push(child);
  child.on('error', error => { console.error(error.message); void shutdown(1); });
  return child;
}
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGTERM');
  if (server) await new Promise(done => server.close(done));
  if (mf) await mf.dispose();
  if (originalContext?.account_id) {
    const args = ['switch', originalContext.account_id, '--format', 'json'];
    if (originalContext.mode === 'live') args.push('--live');
    spawnSync('stripe', args, { encoding: 'utf8' });
  }
  if (check) await rm(state, { recursive: true, force: true });
  process.exitCode = code;
}
process.once('SIGINT', () => { void shutdown(); });
process.once('SIGTERM', () => { void shutdown(); });

async function main() {
  if (appOnly) {
    await readFile(join(profile, 'connection.json'));
    const child = launch('cargo', ['run', '-p', 'stowgui', '--example', 'license_sandbox', '--', profile, '1'], { cwd: appRepo, stdio: 'inherit' });
    await new Promise(done => child.once('exit', code => { process.exitCode = code ?? 1; done(); }));
    return;
  }
  await mkdir(state, { recursive: true, mode: 0o700 });
  let keys;
  try { keys = JSON.parse(await readFile(join(state, 'keys.json'), 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const pair = generateKeyPairSync('ed25519');
    keys = { signing_key: pair.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64url'), public_key: pair.publicKey.export({ format: 'jwk' }).x };
    await writeFile(join(state, 'keys.json'), JSON.stringify(keys), { mode: 0o600, flag: 'wx' });
  }
  let link = { id: 'plink_test_local', url: 'https://example.invalid/test' };
  let webhookSecret = 'local-smoke-only';
  if (!check) {
    const context = spawnSync('stripe', ['whoami', '--format', 'json'], { encoding: 'utf8' });
    if (context.status !== 0 || !context.stdout.trim()) throw new Error('Stripe authorization is unavailable or expired. Run stripe login and authorize Trainvent Test-Modus.');
    originalContext = JSON.parse(context.stdout);
    const selected = spawnSync('stripe', ['switch', STRIPE_ACCOUNT_ID, '--format', 'json'], { encoding: 'utf8' });
    if (selected.status !== 0) throw new Error('Authorize the Trainvent test account in Stripe CLI first.');
    const account = stripe('get', '/v1/account');
    if (account.id !== STRIPE_ACCOUNT_ID) throw new Error('Unexpected Stripe account.');
    const product = stripe('get', `/v1/products/${TEST_PRODUCT_ID}`);
    if (product.livemode || product.name !== 'StowGUI license') throw new Error('Unexpected test product.');
    if (product.tax_code !== PERSONAL_UTILITY_TAX_CODE) stripe('post', `/v1/products/${TEST_PRODUCT_ID}`, { tax_code: PERSONAL_UTILITY_TAX_CODE });
    const prices = stripe('get', '/v1/prices', { product: TEST_PRODUCT_ID, active: 'true', limit: '100' });
    let price = prices.data.find(item => !item.livemode && item.currency === 'eur' && item.unit_amount === 500 && item.type === 'one_time' && item.tax_behavior === 'inclusive');
    if (!price) price = stripe('post', '/v1/prices', { product: TEST_PRODUCT_ID, currency: 'eur', unit_amount: '500', tax_behavior: 'inclusive' });
    const settings = checkoutSettings(price.id, `${site}/buy/success/`);
    const links = stripe('get', '/v1/payment_links', { limit: '100' });
    link = links.data.find(item => !item.livemode && Boolean(item.managed_payments?.enabled) && item.metadata?.app === 'stowgui' && item.metadata?.checkout_environment === 'local' && item.metadata?.legal_source_sha256 === settings.manifest.source && item.after_completion?.redirect?.url === `${site}/buy/success/`);
    if (!link) link = stripe('post', '/v1/payment_links', { ...settings.params, 'metadata[checkout_environment]': 'local' });
    if (link.livemode) throw new Error('Refusing to use a live Payment Link.');
    if (!link.active) link = stripe('post', `/v1/payment_links/${link.id}`, { active: 'true' });
    await writeFile(join(state, 'checkout.json'), JSON.stringify({ account: STRIPE_ACCOUNT_ID, payment_link: link.id, url: link.url, livemode: false }), { mode: 0o600 });
    const listener = launch('stripe', ['listen', '--events', EVENTS.join(','), '--forward-to', `http://127.0.0.1:${API_PORT}/stripe/webhook`], { stdio: ['ignore', 'pipe', 'pipe'] });
    webhookSecret = await new Promise((done, reject) => {
      const timeout = setTimeout(() => reject(new Error('Stripe listener did not become ready.')), 30_000);
      const receive = line => {
        const secret = line.match(SECRET_PATTERN)?.[0];
        if (secret) { clearTimeout(timeout); done(secret); }
        else process.stdout.write(line.replace(SECRET_PATTERN, '[webhook secret]'));
      };
      for (const stream of [listener.stdout, listener.stderr]) {
        let buffered = '';
        stream.on('data', data => {
          buffered += data.toString();
          const lines = buffered.split(/\r?\n/);
          buffered = lines.pop();
          for (const line of lines) receive(`${line}\n`);
        });
      }
      listener.once('exit', () => { clearTimeout(timeout); reject(new Error('Stripe listener stopped.')); if (server) void shutdown(1); });
    });
  }
  const require = createRequire(join(workerDir, 'package.json'));
  const { Miniflare } = require('miniflare');
  const { build } = require('esbuild');
  const built = await build({ entryPoints: [join(workerDir, 'src/local-checkout.ts')], bundle: true, write: false, format: 'esm', platform: 'node' });
  const bundlePath = join(state, 'handler.mjs');
  await writeFile(bundlePath, built.outputFiles[0].text, { mode: 0o600 });
  const { localCheckout } = await import(pathToFileURL(bundlePath).href);
  mf = new Miniflare({ host: '127.0.0.1', port: 0, resourcePersistencePath: check ? undefined : join(state, 'database'), telemetry: { enabled: false }, workers: [{ config: {
    name: 'checkout-test', compatibilityDate: '2026-11-01',
    manifest: { mainModule: 'index.js', modules: { 'index.js': { type: 'esm', contents: "export default { fetch() { return new Response('local'); } }" } } },
    env: { DB: { type: 'd1', id: 'local-checkout-test' } },
  } }] });
  const db = await mf.getD1Database('DB');
  await db.prepare('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)').run();
  for (const name of (await readdir(join(workerDir, 'migrations'))).filter(name => name.endsWith('.sql')).sort()) {
    if (await db.prepare('SELECT name FROM local_migrations WHERE name=?').bind(name).first()) continue;
    const sql = await readFile(join(workerDir, 'migrations', name), 'utf8');
    await db.batch([...sql.split(';').map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)), db.prepare('INSERT INTO local_migrations VALUES (?)').bind(name)]);
  }
  const capture = async (_url, init) => {
    latestMail = JSON.parse(init.body);
    await writeFile(join(state, 'email.json'), JSON.stringify(latestMail), { mode: 0o600 });
    await writeFile(join(state, 'email.html'), latestMail.html, { mode: 0o600 });
    for (const attachment of latestMail.attachments) await writeFile(join(state, attachment.filename), Buffer.from(attachment.content, 'base64'), { mode: 0o600 });
    const key = latestMail.text.match(/[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{60,}/)?.[0];
    if (key) await writeFile(join(profile, 'test-key.txt'), `${key}\n`, { mode: 0o600 });
    console.log(`Test email captured. Open http://127.0.0.1:${API_PORT}/mail`);
    return new Response('{}', { status: 201 });
  };
  await mkdir(join(profile, 'devices/1/home'), { recursive: true, mode: 0o700 });
  const handler = localCheckout(db, keys.signing_key, webhookSecret, link.id, site, capture);
  server = createServer(async (incoming, outgoing) => {
    try {
      const url = new URL(incoming.url, `http://127.0.0.1:${API_PORT}`);
      if (![`127.0.0.1:${API_PORT}`, `localhost:${API_PORT}`].includes(incoming.headers.host) && !check) { outgoing.writeHead(403).end(); return; }
      let response;
      if (incoming.method === 'GET' && url.pathname === '/mail') {
        let html = `<h1>${EMAIL_TITLE}</h1><p>${EMPTY_MAIL}</p>`;
        if (latestMail) {
          const links = latestMail.attachments.map(a => `<a href="/mail/attachments/${encodeURIComponent(a.filename)}">${a.filename}</a>`).join(' · ');
          html = latestMail.html.replace(/(<body[^>]*>)/, `$1<header style="padding:16px"><h1>${EMAIL_TITLE}</h1>${links}<hr></header>`);
        }
        response = new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      } else if (incoming.method === 'GET' && url.pathname.startsWith('/mail/attachments/')) {
        const name = decodeURIComponent(url.pathname.slice('/mail/attachments/'.length));
        const attachment = latestMail?.attachments.find(a => a.filename === name);
        response = attachment ? new Response(Buffer.from(attachment.content, 'base64'), { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' } }) : new Response('not found', { status: 404 });
      } else {
        const chunks = []; let size = 0;
        for await (const chunk of incoming) { size += chunk.length; if (size > MAX_REQUEST_BYTES) throw new Error('Request too large.'); chunks.push(chunk); }
        const body = Buffer.concat(chunks);
        response = await handler(new Request(url, { method: incoming.method, headers: incoming.headers, ...(body.length ? { body } : {}) }));
      }
      outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) { console.error(error.message); outgoing.writeHead(500).end('Local checkout error'); }
  });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(check ? 0 : API_PORT, '127.0.0.1', done); });
  const address = `http://127.0.0.1:${server.address().port}`;
  await writeFile(join(profile, 'connection.json'), JSON.stringify({ public_key: keys.public_key, api: address }), { mode: 0o600 });
  if (check) {
    const event = async (type, object) => {
      const payload = JSON.stringify({ id: `evt_${type}`, type, data: { object } });
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createHmac('sha256', webhookSecret).update(`${timestamp}.${payload}`).digest('hex');
      return fetch(`${address}/stripe/webhook`, { method: 'POST', body: payload, headers: { 'Stripe-Signature': `t=${timestamp},v1=${signature}` } });
    };
    assert.equal((await event('checkout.session.completed', { id: 'cs_test_smoke', payment_link: link.id, payment_status: 'paid', amount_total: 500, currency: 'eur', payment_intent: 'pi_test_smoke', customer_details: { email: 'dummy@trainvent.com', address: { country: 'DE' } }, consent: { terms_of_service: 'accepted' } })).status, 200);
    assert.ok(latestMail.text.includes('Im Checkout akzeptiert: StowGUI-AGB (im Anhang)'));
    const manifest = checkoutSettings('unused').manifest;
    for (const attachment of latestMail.attachments) assert.equal(createHash('sha256').update(Buffer.from(attachment.content, 'base64')).digest('hex'), manifest.pdfs[attachment.filename]);
    const key = (await readFile(join(profile, 'test-key.txt'), 'utf8')).trim();
    const activate = () => fetch(`${address}/license/activate`, { method: 'POST', body: JSON.stringify({ key, device_id: crypto.randomUUID() }) });
    assert.equal((await activate()).status, 200);
    assert.equal((await event('charge.refunded', { payment_intent: 'pi_test_smoke', refunded: true })).status, 200);
    assert.equal((await activate()).status, 403);
    console.log(`Local checkout smoke passed: signed webhook, recorded consent only, email, PDF checksums, activation and refund revocation. No Stripe payment or real email was sent.`);
    await shutdown(); return;
  }
  const next = launch(process.execPath, [join(repo, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', String(SITE_PORT)], {
    env: { ...process.env, NEXT_PUBLIC_PAYMENT_LINK: link.url, NEXT_PUBLIC_LICENSE_API_URL: address }, stdio: 'inherit',
  });
  next.once('exit', code => { if (!shuttingDown) void shutdown(code ?? 1); });
  console.log(`Local website: ${site}/en/\nStripe TEST checkout: ${link.url}\nLocal inbox: ${address}/mail\nDesktop test profile: npm run dev:checkout:app\nNo real charges or emails. Ctrl+C stops all services.`);
}
main().catch(async error => { console.error(error.message); await shutdown(1); });
