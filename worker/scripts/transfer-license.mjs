import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const literal = value => value === null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function transferPlan(original, email, signingKey, id = crypto.randomUUID(), now = Math.floor(Date.now() / 1000)) {
  email = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254 || email === original.email.toLowerCase()) throw new Error('Provide a different valid recipient email.');
  if (original.revoked_at !== null) throw new Error('The license is already revoked.');
  const [body, signature] = original.license_key.split('.');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  const publicKey = await crypto.subtle.importKey('jwk', { ...(await crypto.subtle.exportKey('jwk', signingKey)), d: undefined, key_ops: ['verify'] }, 'Ed25519', false, ['verify']);
  if (!await crypto.subtle.verify('Ed25519', publicKey, Buffer.from(signature, 'base64url'), new TextEncoder().encode(body)) || payload.id !== original.id) throw new Error('Signing key does not match the original license.');
  const nextBody = Buffer.from(JSON.stringify({ ...payload, id, issued: now })).toString('base64url');
  const nextSignature = Buffer.from(await crypto.subtle.sign('Ed25519', signingKey, new TextEncoder().encode(nextBody))).toString('base64url');
  const key = `${nextBody}.${nextSignature}`;
  const session = `transfer:${original.id}:${id}`;
  const guard = `id = ${literal(original.id)} AND email = ${literal(original.email)} AND license_key = ${literal(original.license_key)} AND revoked_at IS NULL`;
  const exists = `EXISTS (SELECT 1 FROM licenses WHERE id = ${literal(id)})`;
  const statements = [
    `INSERT INTO licenses (id,email,locale,checkout_session,payment_intent,license_key,created_at,revoked_at,last_email_at) SELECT ${literal(id)},${literal(email)},locale,${literal(session)},payment_intent,${literal(key)},${now},NULL,NULL FROM licenses WHERE ${guard}`,
    `UPDATE licenses SET revoked_at = ${now} WHERE ${guard} AND ${exists}`,
    `DELETE FROM activations WHERE license_id = ${literal(original.id)} AND ${exists}`,
    `SELECT id,email,revoked_at FROM licenses WHERE id IN (${literal(original.id)},${literal(id)})`,
  ];
  return { id, email, statements };
}

async function main() {
  const args = process.argv.slice(2);
  const get = name => args[args.indexOf(name) + 1];
  for (const flag of ['--license', '--from', '--to', '--signing-key-file']) {
    if (!args.includes(flag) || !get(flag) || get(flag).startsWith('--')) throw new Error(`Required: ${flag}`);
  }
  const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const wrangler = resolve(cwd, 'node_modules/wrangler/bin/wrangler.js');
  const query = sql => {
    const result = spawnSync(process.execPath, [wrangler, 'd1', 'execute', 'stowgui-licenses', '--remote', '--json', '--command', sql], { cwd, encoding: 'utf8' });
    if (result.status !== 0) throw new Error('D1 operation failed; inspect the database before retrying.');
    return JSON.parse(result.stdout).flatMap(r => r.results ?? []);
  };
  const records = query(`SELECT * FROM licenses WHERE id = ${literal(get('--license'))}`);
  const original = records[0];
  if (!original || original.email !== get('--from').trim().toLowerCase()) throw new Error('License and current holder do not match.');
  console.log(`Transfer ${original.id}: ${original.email} → ${get('--to')}`);
  if (!args.includes('--apply')) { console.log('Preview only. Authenticate the holder, obtain deletion confirmation and recipient agreement before using --apply --holder-verified --deletion-confirmed --recipient-agreed.'); return; }
  for (const flag of ['--holder-verified', '--deletion-confirmed', '--recipient-agreed']) if (!args.includes(flag)) throw new Error(`Required: ${flag}`);
  const encoded = readFileSync(get('--signing-key-file'), 'utf8').trim().match(/[A-Za-z0-9_-]{60,}/)?.[0];
  if (!encoded) throw new Error('No PKCS#8 base64url signing key found.');
  const signingKey = await crypto.subtle.importKey('pkcs8', Buffer.from(encoded, 'base64url'), 'Ed25519', true, ['sign']);
  const plan = await transferPlan(original, get('--to'), signingKey);
  const result = query(`${plan.statements.join(';\n')};`);
  if (!result.some(r => r.id === plan.id)) throw new Error('Transfer did not apply; the original record changed.');
  console.log(`Transferred to ${plan.email}. Replacement ID: ${plan.id}. Use the website recovery form to deliver the replacement key; no key is printed here.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
