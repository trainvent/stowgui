import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

export const PRODUCTION_PUBLIC_KEY = '9uNumF5g3RuMcoNIqrzns1SqX6O2DE_EHdiZ8HspLpA';
const MAX_COUNT = 20;
const LICENSED_MAJOR = 1;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const literal = value => value === null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;

export async function issuePlan({ email, count, locale, signingKey, publicKey = PRODUCTION_PUBLIC_KEY, now = Math.floor(Date.now() / 1000), newId = () => crypto.randomUUID() }) {
  email = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new Error('Provide a valid holder email.');
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) throw new Error(`Count must be 1–${MAX_COUNT}.`);
  if (locale !== 'de' && locale !== 'en') throw new Error('Locale must be de or en.');
  const { x } = await crypto.subtle.exportKey('jwk', signingKey);
  if (x !== publicKey) throw new Error('Signing key does not match the production public key.');
  const statements = [];
  const ids = [];
  for (let i = 0; i < count; i++) {
    const id = newId();
    const body = Buffer.from(JSON.stringify({ v: 1, id, major: LICENSED_MAJOR, issued: now })).toString('base64url');
    const signature = Buffer.from(await crypto.subtle.sign('Ed25519', signingKey, new TextEncoder().encode(body))).toString('base64url');
    statements.push(`INSERT INTO licenses (id,email,locale,checkout_session,payment_intent,license_key,created_at,revoked_at,last_email_at) VALUES (${literal(id)},${literal(email)},${literal(locale)},${literal(`gift:${id}`)},NULL,${literal(`${body}.${signature}`)},${now},NULL,NULL)`);
    ids.push(id);
  }
  return { email, ids, statements };
}

async function main() {
  const args = process.argv.slice(2);
  const get = name => args[args.indexOf(name) + 1];
  for (const flag of ['--email', '--count']) if (!args.includes(flag) || !get(flag) || get(flag).startsWith('--')) throw new Error(`Required: ${flag}`);
  const email = get('--email');
  const count = Number(get('--count'));
  const locale = args.includes('--locale') ? get('--locale') : 'de';
  console.log(`Issue ${count} unpaid licence(s) to ${email.trim().toLowerCase()} (${locale}).`);
  if (!args.includes('--apply')) { console.log('Preview only. Add --apply --signing-key-file <file> to issue them.'); return; }
  if (!args.includes('--signing-key-file')) throw new Error('Required: --signing-key-file');
  const encoded = readFileSync(get('--signing-key-file'), 'utf8').trim().match(/[A-Za-z0-9_-]{60,}/)?.[0];
  if (!encoded) throw new Error('No PKCS#8 base64url signing key found.');
  const signingKey = await crypto.subtle.importKey('pkcs8', Buffer.from(encoded, 'base64url'), 'Ed25519', true, ['sign']);
  const plan = await issuePlan({ email, count, locale, signingKey });
  const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const result = spawnSync(process.execPath, [resolve(cwd, 'node_modules/wrangler/bin/wrangler.js'), 'd1', 'execute', 'stowgui-licenses', '--remote', '--json', '--command', `${plan.statements.join(';\n')};`], { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error('D1 insert failed; inspect the database before retrying.');
  console.log(`Issued ${plan.ids.length} licence(s):\n${plan.ids.join('\n')}\nRequest them at https://stowgui.com/${locale}/license/ with ${plan.email}; no key is printed here.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
