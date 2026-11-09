import { decode, encode } from "./base64url";

export const LICENSE_FORMAT_VERSION = 1;
export const LICENSED_MAJOR_VERSION = 1;

export type LicensePayload = {
  v: number;
  id: string;
  major: number;
  issued: number;
};

const ED25519 = { name: "Ed25519" } as const;
const encoder = new TextEncoder();

export function importSigningKey(pkcs8Base64Url: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("pkcs8", decode(pkcs8Base64Url), ED25519, false, ["sign"]);
}

export function importVerifyKey(rawBase64Url: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", decode(rawBase64Url), ED25519, false, ["verify"]);
}

export function newLicensePayload(id: string, issued: number): LicensePayload {
  return { v: LICENSE_FORMAT_VERSION, id, major: LICENSED_MAJOR_VERSION, issued };
}

export async function signLicense(payload: LicensePayload, key: CryptoKey): Promise<string> {
  const body = encode(encoder.encode(JSON.stringify(payload)));
  const signature = new Uint8Array(await crypto.subtle.sign(ED25519, key, encoder.encode(body)));
  return `${body}.${encode(signature)}`;
}

export async function verifyLicense(licenseKey: string, key: CryptoKey): Promise<LicensePayload | null> {
  const [body, signature, ...rest] = licenseKey.trim().split(".");
  if (!body || !signature || rest.length > 0) return null;
  try {
    const valid = await crypto.subtle.verify(ED25519, key, decode(signature), encoder.encode(body));
    return valid ? (JSON.parse(new TextDecoder().decode(decode(body))) as LicensePayload) : null;
  } catch {
    return null;
  }
}
