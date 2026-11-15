import { it, expect } from 'vitest';
import { Miniflare } from 'miniflare';
import { readFileSync } from 'node:fs';
import { transferPlan } from '../scripts/transfer-license.mjs';

it('transfers atomically, preserves entitlement and refunds, and moves recovery', async () => {
  const mf = new Miniflare({ workers: [{ config: {
    name: 'transfer', compatibilityDate: '2026-11-01',
    manifest: { mainModule: 'index.js', modules: { 'index.js': { type: 'esm', contents: "export default { fetch() { return new Response('ok'); } }" } } },
    env: { DB: { type: 'd1', id: 'transfer-db' } },
  } }] });
  try {
    const db = await mf.getD1Database('DB');
    for (const name of ['0001_licenses.sql', '0002_activations.sql']) {
      const sql = readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
      await db.batch(sql.split(';').filter(s => s.trim()).map(s => db.prepare(s)));
    }
    const keys = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
    const body = Buffer.from(JSON.stringify({ v: 1, id: 'old', major: 7, issued: 1 })).toString('base64url');
    const signature = Buffer.from(await crypto.subtle.sign('Ed25519', keys.privateKey, new TextEncoder().encode(body))).toString('base64url');
    const original = { id: 'old', email: 'old@example.com', license_key: `${body}.${signature}`, revoked_at: null };
    await db.prepare("INSERT INTO licenses (id,email,locale,checkout_session,payment_intent,license_key,created_at) VALUES ('old',?,'de','cs','pi',?,1)").bind(original.email, original.license_key).run();
    await db.prepare("INSERT INTO activations VALUES ('old','device','activation',1,1)").run();
    const plan = await transferPlan(original, 'NEW@example.com', keys.privateKey, 'replacement', 2);
    await db.batch(plan.statements.map(s => db.prepare(s)));
    const rows = (await db.prepare('SELECT * FROM licenses ORDER BY created_at').all()).results;
    expect(rows[0]).toMatchObject({ email: 'old@example.com', revoked_at: 2, checkout_session: 'cs' });
    expect(rows[1]).toMatchObject({ email: 'new@example.com', revoked_at: null, payment_intent: 'pi', last_email_at: null });
    expect(JSON.parse(Buffer.from(rows[1].license_key.split('.')[0], 'base64url').toString())).toMatchObject({ v: 1, major: 7, id: 'replacement' });
    expect((await db.prepare('SELECT * FROM activations').all()).results).toHaveLength(0);
    expect((await db.prepare('SELECT * FROM licenses WHERE email = ? AND revoked_at IS NULL').bind('old@example.com').all()).results).toHaveLength(0);
    const repeat = await transferPlan(original, 'other@example.com', keys.privateKey, 'repeat', 3);
    await db.batch(repeat.statements.map(s => db.prepare(s)));
    expect((await db.prepare('SELECT * FROM licenses').all()).results).toHaveLength(2);
    await db.prepare("UPDATE licenses SET revoked_at=4 WHERE payment_intent='pi' AND revoked_at IS NULL").run();
    expect((await db.prepare('SELECT * FROM licenses WHERE revoked_at IS NULL').all()).results).toHaveLength(0);
    await expect(transferPlan({ ...original, revoked_at: 2 }, 'new@example.com', keys.privateKey)).rejects.toThrow('already revoked');
    const wrong = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
    await expect(transferPlan(original, 'new@example.com', wrong.privateKey)).rejects.toThrow('does not match');
  } finally { await mf.dispose(); }
}, 15000);
