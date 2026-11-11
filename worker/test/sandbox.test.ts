import { describe, expect, it, vi } from "vitest";
import sandbox from "../src/sandbox";
import worker from "../src/index";
import type { Env } from "../src/env";

const env = {} as Env;
describe("hosted license sandbox", () => {
  it("identifies itself without exposing credentials", async () => {
    const result = await sandbox.fetch(new Request("https://sandbox.test/health"), env);
    expect(await result.json()).toEqual({ environment: "sandbox", product: "stowgui" });
    expect(result.headers.get("Cache-Control")).toBe("no-store");
  });
  it("does not expose payment, email or unlisted routes", async () => {
    const original = vi.spyOn(worker, "fetch");
    try {
      for (const path of ["/stripe/webhook", "/license/resend", "/license/status", "/unknown"]) {
        expect((await sandbox.fetch(new Request(`https://sandbox.test${path}`, { method: "POST" }), env)).status).toBe(404);
      }
      expect(original).not.toHaveBeenCalled();
    } finally { original.mockRestore(); }
  });
  it("uses the production handler for license operations", async () => {
    const original = vi.spyOn(worker, "fetch").mockImplementation(async () => new Response("handled"));
    try {
      for (const path of ["activate", "check-in", "devices", "rename-device", "deactivate-device"]) {
        const request = new Request(`https://sandbox.test/license/${path}`, { method: "POST" });
        expect(await (await sandbox.fetch(request, env)).text()).toBe("handled");
        expect(original).toHaveBeenLastCalledWith(request, env);
      }
    } finally { original.mockRestore(); }
  });
});
