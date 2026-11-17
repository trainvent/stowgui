export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type BodyResult = { text: string } | { error: "missing" | "too_large" };

/** Reads at most `maxBytes`, including requests without a Content-Length header. */
export async function readBody(request: Request, maxBytes: number): Promise<BodyResult> {
  const reader = request.body?.getReader();
  if (!reader) return { error: "missing" };
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return { text: text + decoder.decode() };
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      return { error: "too_large" };
    }
    text += decoder.decode(value, { stream: true });
  }
}
