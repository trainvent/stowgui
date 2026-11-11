import { generateKeyPairSync, createPrivateKey, sign, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const worker = fileURLToPath(new URL("../", import.meta.url));
const stateDir = path.join(worker, ".wrangler/sandbox");
const app = process.env.STOWGUI_APP_DIR ?? path.resolve(worker, "../../stowgui_source");
const api = "https://stowgui-license-sandbox.trainvent.workers.dev";
const sqlText = value => `'${value.replaceAll("'", "''")}'`;
await mkdir(stateDir, { recursive: true, mode: 0o700 });
const stateFile = path.join(stateDir, "credentials.json");
let state;
try {
  state = JSON.parse(await readFile(stateFile, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  const pair = generateKeyPairSync("ed25519");
  const issued = Math.floor(Date.now() / 1000);
  const purchase = () => {
    const id = randomUUID();
    const body = Buffer.from(JSON.stringify({ v: 1, id, major: 1, issued })).toString("base64url");
    return { id, issued, key: `${body}.${sign(null, Buffer.from(body), pair.privateKey).toString("base64url")}` };
  };
  state = {
    signingKey: pair.privateKey.export({ type: "pkcs8", format: "der" }).toString("base64url"),
    publicKey: pair.publicKey.export({ format: "jwk" }).x,
    interactive: purchase(), smoke: purchase(),
  };
  await writeFile(stateFile, JSON.stringify(state), { mode: 0o600, flag: "wx" });
}
// Refuse damaged or mismatched credentials rather than replacing a deployed key.
const signingKey = createPrivateKey({ key: Buffer.from(state.signingKey, "base64url"), format: "der", type: "pkcs8" });
for (const purchase of [state.interactive, state.smoke]) {
  const [body, signature] = purchase.key.split(".");
  if (sign(null, Buffer.from(body), signingKey).toString("base64url") !== signature) throw new Error("Sandbox credentials do not match");
}
await writeFile(path.join(stateDir, "secrets.json"), JSON.stringify({ LICENSE_SIGNING_KEY: state.signingKey }), { mode: 0o600 });
const sql = [state.interactive, state.smoke].map(p =>
  `INSERT INTO licenses (id,email,locale,checkout_session,license_key,created_at) VALUES (${sqlText(p.id)},'sandbox@example.invalid','en',${sqlText(`sandbox-${p.id}`)},${sqlText(p.key)},${p.issued}) ON CONFLICT(id) DO NOTHING;`
).join("\n");
await writeFile(path.join(stateDir, "seed.sql"), sql, { mode: 0o600 });
const client = path.join(app, "target/cloud-license-sandbox");
for (const [profile, purchase] of [[client, state.interactive], [path.join(client, "check"), state.smoke]]) {
  await mkdir(profile, { recursive: true, mode: 0o700 });
  await writeFile(path.join(profile, "connection.json"), JSON.stringify({ public_key: state.publicKey, api }), { mode: 0o600 });
  await writeFile(path.join(profile, "test-key.txt"), `${purchase.key}\n`, { mode: 0o600 });
}
for (const device of ["1", "2", "3", "4"]) await mkdir(path.join(client, "devices", device, "home"), { recursive: true });
console.log(`Sandbox credentials and seed SQL prepared privately in ${stateDir}.\nDesktop test profiles configured in ${client}.`);
