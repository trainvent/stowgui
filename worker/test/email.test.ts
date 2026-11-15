import { afterEach, expect, it, vi } from "vitest";
import { brevoMailer } from "../src/email";

afterEach(() => vi.unstubAllGlobals());

it("sends selectable wrapping HTML and a plain-text fallback without changing key bytes", async () => {
  const key = `${"a".repeat(240)}.${"b".repeat(86)}`;
  let payload: Record<string, string> = {};
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    payload = JSON.parse(init.body as string);
    return new Response("{}", { status: 201 });
  });
  await brevoMailer("test-key", { name: "StowGUI", email: "license@stowgui.com" }, "https://stowgui.com/en/download/")("test@example.com", "de", [key]);
  expect(payload.textContent).toContain(key);
  expect(payload.htmlContent).toContain(key);
  expect(payload.htmlContent).toContain("overflow-wrap:anywhere");
  expect(payload.htmlContent).toContain("word-break:break-all");
  expect(payload.htmlContent).not.toMatch(/<(img|iframe|script)\b|(?:^|[;\s])(?:height|max-height)\s*:/i);
  expect(payload.htmlContent).toContain("Fragen?");
  expect(payload.htmlContent).toContain("https://stowgui.com/de/download/");
});

it("escapes dynamic HTML and keeps multiple keys in separate wrapping blocks", async () => {
  let payload: Record<string, string> = {};
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    payload = JSON.parse(init.body as string);
    return new Response("{}", { status: 201 });
  });
  await brevoMailer("test-key", { name: "StowGUI", email: "license@stowgui.com" }, "https://stowgui.com/en/download/?a=1&b=2")("test@example.com", "en", ["KEY<ONE>.SIG", "KEY&TWO.SIG"]);
  expect(payload.htmlContent).toContain("KEY&lt;ONE&gt;.SIG");
  expect(payload.htmlContent).toContain("KEY&amp;TWO.SIG");
  expect(payload.htmlContent).toContain("?a=1&amp;b=2");
  expect(payload.htmlContent.match(/word-break:break-all/g)).toHaveLength(2);
  expect(payload.textContent).toContain("KEY<ONE>.SIG\n\nKEY&TWO.SIG");
});

it.each(["de", "en"] as const)("attaches readable PDF documents in %s", async (locale) => {
  let payload: { attachment: { name: string; content: string }[] } | undefined;
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    payload = JSON.parse(init.body as string);
    return new Response("{}", { status: 201 });
  });
  await brevoMailer("test-key", { name: "StowGUI", email: "license@stowgui.com" }, "https://stowgui.com/en/download/")("test@example.com", locale, ["KEY.SIG"]);
  expect(payload?.attachment.map(a => a.name)).toEqual([`StowGUI-terms-${locale}.pdf`, `StowGUI-privacy-${locale}.pdf`]);
  for (const attachment of payload!.attachment) {
    const pdf = Buffer.from(attachment.content, "base64");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.toString()).toContain("%%EOF");
    expect(pdf.length).toBeLessThan(1_000_000);
  }
});

it("records purchase details and only the consent actually supplied by checkout", async () => {
  let payload: { textContent: string } | undefined;
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    payload = JSON.parse(init.body as string);
    return new Response("{}", { status: 201 });
  });
  const mail = brevoMailer("test-key", { name: "StowGUI", email: "license@stowgui.com" }, "https://stowgui.com/en/download/");
  await mail("test@example.com", "en", ["KEY.SIG"], { reference: "cs_test", amount: 500, currency: "eur", acceptedText: "I agree to immediate delivery." });
  expect(payload?.textContent).toContain("Purchase reference: cs_test");
  expect(payload?.textContent).toContain("€5.00");
  expect(payload?.textContent).toContain("Agreement accepted at checkout: I agree to immediate delivery.");
  await mail("test@example.com", "en", ["KEY.SIG"], { reference: "cs_test", amount: 500, currency: "eur" });
  expect(payload?.textContent).not.toContain("Agreement accepted at checkout:");
});
