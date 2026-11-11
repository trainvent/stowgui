import { Miniflare } from "miniflare";
import { readFile } from "node:fs/promises";
import { URL as NodeURL } from "node:url";
import assert from "node:assert/strict";
import { d1Activations } from "../src/activation";
import { it } from "vitest";

it("enforces activation limits in the real local D1 runtime", async () => {
const mf = new Miniflare({ workers: [{ config: {
  name: "test", compatibilityDate: "2026-11-01",
  manifest: { mainModule: "index.js", modules: { "index.js": { type: "esm", contents: "export default { fetch() { return new Response('ok'); } }" } } },
  env: { DB: { type: "d1", id: "test-db" } },
} }] });
try {
  const db = await mf.getD1Database("DB");
  for (const name of ["0001_licenses.sql", "0002_activations.sql"]) {
    const sql = await readFile(new NodeURL(`../migrations/${name}`, import.meta.url), "utf8");
    await db.batch(sql.split(";").map((s) => s.trim()).filter(Boolean).map((s) => db.prepare(s)));
  }
  await db.prepare("INSERT INTO licenses (id,email,locale,checkout_session,license_key,created_at) VALUES ('l','test@example.com','en','cs','key',0)").run();
  const store = d1Activations(db);
  const record = (device: string, at: number) => ({ license_id: "l", device_id: device, activation_id: `token-${device}-${at}`, activated_at: at, last_seen: at });
  await store.activate(record("a", 1));
  await store.activate(record("b", 2));
  await store.activate(record("c", 3));
  await store.check("l", "a", "token-a-1", 4);
  await store.activate(record("d", 5));
  assert.equal(await store.check("l", "b", "token-b-2", 6), null);
  assert.ok(await store.check("l", "a", "token-a-1", 6));
  await Promise.all(Array.from({ length: 12 }, (_, i) => store.activate(record(`parallel-${i}`, 10+i))));
  assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM activations").first<{ n: number }>())?.n, 3);
  const active = await db.prepare("SELECT * FROM activations LIMIT 1").first<{ device_id: string; activation_id: string }>();
  assert.ok(active);
  await store.activate(record(active.device_id, 30));
  assert.equal(await store.check("l", active.device_id, active.activation_id, 31), null);
  await db.prepare("UPDATE licenses SET revoked_at = 32 WHERE id = 'l'").run();
  assert.equal(await store.activate(record("revoked", 33)), null);
  assert.equal(await store.check("l", active.device_id, `token-${active.device_id}-30`, 33), null);
  console.log("D1 activation integration: passed (eviction, concurrency, stale tokens, revocation)");
} finally { await mf.dispose(); }

}, 15000);
