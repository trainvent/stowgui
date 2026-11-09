import { describe, expect, it } from "vitest";
import { createApp, RESEND_COOLDOWN_SECONDS } from "../src/app";
import { verifyLicense } from "../src/license";
import { checkoutCompleted, testDeps, webhookRequest } from "./helpers";

const resendRequest = (body: object) =>
  new Request("https://license.stowgui.com/license/resend", {
    method: "POST",
    headers: { Origin: "https://stowgui.com", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("Stripe webhook", () => {
  it("issues, stores and emails a valid key once per checkout", async () => {
    const { deps, store, mails, keys } = await testDeps();
    const app = createApp(deps);

    expect((await app(await webhookRequest(checkoutCompleted()))).status).toBe(200);
    expect(await (await app(await webhookRequest(checkoutCompleted()))).text()).toBe("already issued");

    expect(store.records).toHaveLength(1);
    expect(store.records[0]).toMatchObject({ email: "buyer@example.com", locale: "de", payment_intent: "pi_1" });
    expect(mails).toEqual([{ to: "buyer@example.com", locale: "de", keys: [store.records[0].license_key] }]);
    expect(await verifyLicense(store.records[0].license_key, keys.publicKey)).toMatchObject({ id: "lic_1", major: 1 });
  });

  it("retries the email when it failed before", async () => {
    let fail = true;
    const { deps, store, mails } = await testDeps();
    const mail = deps.mail;
    const app = createApp({ ...deps, mail: async (...args) => (fail ? Promise.reject(new Error("down")) : mail(...args)) });

    await expect(app(await webhookRequest(checkoutCompleted()))).rejects.toThrow("down");
    fail = false;
    await app(await webhookRequest(checkoutCompleted()));
    expect(store.records).toHaveLength(1);
    expect(mails).toHaveLength(1);
  });

  it("ignores unpaid sessions and other payment links", async () => {
    const { deps, store } = await testDeps({ paymentLinkId: "plink_1" });
    const app = createApp(deps);
    await app(await webhookRequest(checkoutCompleted({ payment_status: "unpaid" })));
    await app(await webhookRequest(checkoutCompleted({ payment_link: "plink_other" })));
    expect(store.records).toHaveLength(0);
  });

  it("rejects a bad signature", async () => {
    const { deps } = await testDeps();
    const response = await createApp(deps)(await webhookRequest(checkoutCompleted(), undefined, "wrong"));
    expect(response.status).toBe(400);
  });

  it("revokes the key on a full refund and on a dispute", async () => {
    const { deps, store } = await testDeps();
    const app = createApp(deps);
    await app(await webhookRequest(checkoutCompleted()));
    await app(await webhookRequest(checkoutCompleted({ id: "cs_test_2", payment_intent: "pi_2" })));

    await app(await webhookRequest({ id: "evt_2", type: "charge.refunded", data: { object: { refunded: false, payment_intent: "pi_1" } } }));
    expect(store.records[0].revoked_at).toBeNull();

    await app(await webhookRequest({ id: "evt_3", type: "charge.refunded", data: { object: { refunded: true, payment_intent: "pi_1" } } }));
    await app(await webhookRequest({ id: "evt_4", type: "charge.dispute.created", data: { object: { payment_intent: "pi_2" } } }));
    expect(store.records.map((r) => r.revoked_at !== null)).toEqual([true, true]);

    const status = await app(new Request("https://license.stowgui.com/license/status?id=lic_1"));
    expect(await status.json()).toEqual({ active: false });
  });
});

describe("resend key", () => {
  it("emails active keys, waits for the cooldown and answers the same for unknown addresses", async () => {
    const { deps, mails, advance } = await testDeps();
    const app = createApp(deps);
    await app(await webhookRequest(checkoutCompleted()));
    mails.length = 0;

    const first = await app(resendRequest({ email: "BUYER@example.com", locale: "en" }));
    expect(first.status).toBe(202);
    expect(first.headers.get("Access-Control-Allow-Origin")).toBe("https://stowgui.com");
    expect(mails).toHaveLength(0); // purchase email was just sent

    advance(RESEND_COOLDOWN_SECONDS);
    await app(resendRequest({ email: "buyer@example.com", locale: "en" }));
    expect(mails).toHaveLength(1);
    expect(mails[0].locale).toBe("en");

    expect((await app(resendRequest({ email: "nobody@example.com" }))).status).toBe(202);
    expect((await app(resendRequest({ email: "not-an-email" }))).status).toBe(400);
  });
});
