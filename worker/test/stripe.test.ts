import { describe, expect, it } from "vitest";
import { stripeSignature, verifyStripeEvent } from "../src/stripe";

const SECRET = "whsec_test";
const NOW = 1_800_000_000;
const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });

describe("verifyStripeEvent", () => {
  it("accepts a valid signature", async () => {
    const header = `t=${NOW},v1=${await stripeSignature(payload, NOW, SECRET)}`;
    expect(await verifyStripeEvent(payload, header, SECRET, NOW)).toMatchObject({ id: "evt_1" });
  });

  it("rejects a wrong secret, old timestamp or missing header", async () => {
    const wrong = `t=${NOW},v1=${await stripeSignature(payload, NOW, "other")}`;
    const old = `t=${NOW - 600},v1=${await stripeSignature(payload, NOW - 600, SECRET)}`;
    expect(await verifyStripeEvent(payload, wrong, SECRET, NOW)).toBeNull();
    expect(await verifyStripeEvent(payload, old, SECRET, NOW)).toBeNull();
    expect(await verifyStripeEvent(payload, null, SECRET, NOW)).toBeNull();
  });
});
