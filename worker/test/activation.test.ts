import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { OFFLINE_SECONDS } from "../src/activation";
import { verifyLicense } from "../src/license";
import { checkoutCompleted, testDeps, webhookRequest, NOW } from "./helpers";

const devices = [1, 2, 3, 4].map((n) => `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`);
function req(route: string, key: string, device: string, activation?: string) {
  return new Request(`https://license.test/license/${route}`, {
    method: "POST", body: JSON.stringify({ key, device_id: device, activation_id: activation }),
  });
}
async function setup() {
  const t = await testDeps();
  const app = createApp(t.deps);
  await app(await webhookRequest(checkoutCompleted()));
  return { ...t, app, key: t.mails[0].keys[0] };
}
async function payload(response: Response, key: CryptoKey) {
  expect(response.status).toBe(200);
  const { token } = await response.json() as { token: string };
  return await verifyLicense(token, key) as unknown as { activation_id: string; issued: number; expires: number; device_id: string; kind: string };
}

describe("online activation", () => {
  it("signs a device-bound 30 day activation and renews it", async () => {
    const t = await setup();
    const a = await payload(await t.app(req("activate", t.key, devices[0])), t.keys.publicKey);
    expect(a).toMatchObject({ issued: NOW, expires: NOW + OFFLINE_SECONDS, device_id: devices[0], kind: "activation" });
    t.advance(86400);
    const b = await payload(await t.app(req("check-in", t.key, devices[0], a.activation_id)), t.keys.publicKey);
    expect(b.activation_id).toBe(a.activation_id);
    expect(b.expires).toBe(NOW + 86400 + OFFLINE_SECONDS);
  });

  it("releases the least recently seen device, and check-in cannot reclaim it", async () => {
    const t = await setup();
    const tokens = [];
    for (const device of devices.slice(0, 3)) {
      tokens.push(await payload(await t.app(req("activate", t.key, device)), t.keys.publicKey));
      t.advance(1);
    }
    await t.app(req("check-in", t.key, devices[0], tokens[0].activation_id));
    t.advance(1);
    await t.app(req("activate", t.key, devices[3]));
    expect((await t.app(req("check-in", t.key, devices[1], tokens[1].activation_id))).status).toBe(403);
    expect((await t.app(req("check-in", t.key, devices[0], tokens[0].activation_id))).status).toBe(200);
    await t.app(req("activate", t.key, devices[1]));
    expect((await t.app(req("check-in", t.key, devices[1], tokens[1].activation_id))).status).toBe(403);
  });

  it("rejects forged purchase keys, wrong device credentials and revoked licenses", async () => {
    const t = await setup();
    expect((await t.app(req("activate", `${t.key}x`, devices[0]))).status).toBe(403);
    const a = await payload(await t.app(req("activate", t.key, devices[0])), t.keys.publicKey);
    expect((await t.app(req("check-in", t.key, devices[1], a.activation_id))).status).toBe(403);
    t.store.records[0].revoked_at = NOW;
    for (const route of ["activate", "check-in"]) {
      const result = await t.app(req(route, t.key, devices[0], a.activation_id));
      expect(await result.json()).toEqual({ error: "revoked" });
    }
  });

  it("bounds request bodies and rate limits explicit activations", async () => {
    const t = await setup();
    t.deps.allowActivation = async () => false;
    expect((await t.app(req("activate", t.key, devices[0]))).status).toBe(429);
    expect((await t.app(new Request("https://license.test/license/activate", { method: "POST", body: "x".repeat(4097) }))).status).toBe(413);
    expect((await t.app(req("activate", t.key, "invalid"))).status).toBe(400);
  });
});

it("verifies the same signed wire fixture as the Rust client", async () => {
  const { default: fixture } = await import("./fixtures/activation.json");
  const { importVerifyKey } = await import("../src/license");
  const verifyKey = await importVerifyKey(fixture.public_key);
  expect(await verifyLicense(fixture.key, verifyKey)).toMatchObject({ id: "license-1", major: 1 });
  expect(await verifyLicense(fixture.token, verifyKey)).toMatchObject({ kind: "activation", device_id: fixture.device_id });
});

describe("device management", () => {
  const request = (route: string, key: string, device: string, name?: string) => new Request(`https://license.test/license/${route}`, {
    method: "POST", body: JSON.stringify({ key, device_id: device, ...(name === undefined ? {} : { device_name: name }) }),
  });
  it("lists names, preserves renames on renewal and repeated activation, and deactivates", async () => {
    const t = await setup();
    const a = await payload(await t.app(request("activate", t.key, devices[0], "EliteBook")), t.keys.publicKey);
    const list = async () => (await (await t.app(request("devices", t.key, devices[0]))).json());
    expect(await list()).toEqual({ devices: [{ device_id: devices[0], name: "EliteBook" }] });
    await t.app(request("rename-device", t.key, devices[0], "  Leon’s EliteBook  "));
    await t.app(req("check-in", t.key, devices[0], a.activation_id));
    await t.app(request("activate", t.key, devices[0], "System hostname"));
    expect(await list()).toEqual({ devices: [{ device_id: devices[0], name: "Leon’s EliteBook" }] });
    await t.app(request("deactivate-device", t.key, devices[0]));
    expect(await list()).toEqual({ devices: [] });
    expect((await t.app(req("check-in", t.key, devices[0], a.activation_id))).status).toBe(403);
  });
  it("rejects invalid names, forged credentials and revoked licenses", async () => {
    const t = await setup();
    for (const name of ["", "   ", "x".repeat(129), "bad\nname"]) {
      expect((await t.app(request("rename-device", t.key, devices[0], name))).status).toBe(400);
    }
    for (const route of ["devices", "rename-device", "deactivate-device"]) {
      expect((await t.app(request(route, `${t.key}x`, devices[0], "Name"))).status).toBe(403);
    }
    t.store.records[0].revoked_at = NOW;
    expect((await t.app(request("devices", t.key, devices[0]))).status).toBe(403);
  });
  it("never lists or changes another license’s devices", async () => {
    const t = await setup();
    await t.app(request("activate", t.key, devices[0], "Original"));
    await t.app(await webhookRequest(checkoutCompleted({ id: "cs_second", payment_intent: "pi_second" })));
    const otherKey = t.mails[1].keys[0];
    await t.app(request("rename-device", otherKey, devices[0], "Wrong"));
    const result = await t.app(request("deactivate-device", otherKey, devices[0]));
    expect(await result.json()).toEqual({ devices: [] });
    const original = await t.app(request("devices", t.key, devices[0]));
    expect(await original.json()).toEqual({ devices: [{ device_id: devices[0], name: "Original" }] });
  });
});
