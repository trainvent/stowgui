import { it, expect } from 'vitest';
import { Miniflare } from 'miniflare';
import { readFileSync } from 'node:fs';
import { issuePlan } from '../scripts/issue-licenses.mjs';

it('issues verifiable unpaid licences that recovery finds and refunds never touch', async () => {
  const mf = new Miniflare({ workers: [{ config: {
    name: 'issue', compatibilityDate: '2026-11-01',
    manifest: { mainModule: 'index.js', modules: { 'index.js': { type: 'esm', contents: "export default { fetch() { return new Response('ok'); } }" } } },
    env: { DB: { type: 'd1', id: 'issue-db' } },
  } }] });
  try {
    const db = await mf.getD1Database('DB');
    const sql = readFileSync(new URL('../migrations/0001_licenses.sql', import.meta.url), 'utf8');
    await db.batch(sql.split(';').filter(s => s.trim()).map(s => db.prepare(s)));
    const keys = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
    const { x: publicKey } = await crypto.subtle.exportKey('jwk', keys.publicKey);
    let n = 0;
    const plan = await issuePlan({ email: ' Me@Example.com ', count: 3, locale: 'de', signingKey: keys.privateKey, publicKey, now: 5, newId: () => `gift-${++n}` });
    await db.batch(plan.statements.map(s => db.prepare(s)));
    const rows = (await db.prepare('SELECT * FROM licenses WHERE email = ? AND revoked_at IS NULL ORDER BY id').bind('me@example.com').all()).results;
    expect(rows.map(r => r.checkout_session)).toEqual(['gift:gift-1', 'gift:gift-2', 'gift:gift-3']);
    for (const row of rows) {
      const [body, signature] = row.license_key.split('.');
      expect(JSON.parse(Buffer.from(body, 'base64url').toString())).toEqual({ v: 1, id: row.id, major: 1, issued: 5 });
      expect(await crypto.subtle.verify('Ed25519', keys.publicKey, Buffer.from(signature, 'base64url'), new TextEncoder().encode(body))).toBe(true);
      expect(row).toMatchObject({ payment_intent: null, last_email_at: null, locale: 'de' });
    }
    const wrong = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
    await expect(issuePlan({ email: 'me@example.com', count: 1, locale: 'de', signingKey: wrong.privateKey, publicKey })).rejects.toThrow('does not match');
    await expect(issuePlan({ email: 'me@example.com', count: 0, locale: 'de', signingKey: keys.privateKey, publicKey })).rejects.toThrow('Count');
  } finally { await mf.dispose(); }
});
