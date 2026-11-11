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
