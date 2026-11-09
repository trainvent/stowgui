import { describe, expect, it } from "vitest";
import { importSigningKey, importVerifyKey, newLicensePayload, signLicense, verifyLicense } from "../src/license";
import { keyPair } from "./helpers";

describe("license keys", () => {
  it("round-trips a signed key with the exported key pair", async () => {
    const keys = await keyPair();
    const payload = newLicensePayload("lic_1", 1_800_000_000);
    const licenseKey = await signLicense(payload, await importSigningKey(keys.pkcs8));
    expect(licenseKey).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(await verifyLicense(licenseKey, await importVerifyKey(keys.raw))).toEqual(payload);
  });

  it("rejects a tampered key", async () => {
    const keys = await keyPair();
    const licenseKey = await signLicense(newLicensePayload("lic_1", 1), keys.privateKey);
    const [, signature] = licenseKey.split(".");
    const forged = `${btoa(JSON.stringify(newLicensePayload("lic_2", 1))).replace(/=+$/, "")}.${signature}`;
    expect(await verifyLicense(forged, keys.publicKey)).toBeNull();
    expect(await verifyLicense("garbage", keys.publicKey)).toBeNull();
  });

  it("rejects a key signed by another key pair", async () => {
    const [a, b] = await Promise.all([keyPair(), keyPair()]);
    const licenseKey = await signLicense(newLicensePayload("lic_1", 1), a.privateKey);
    expect(await verifyLicense(licenseKey, b.publicKey)).toBeNull();
  });
});
