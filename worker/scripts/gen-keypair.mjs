// Prints a new Ed25519 key pair for signing StowGUI licenses.
// The private key goes into `wrangler secret put LICENSE_SIGNING_KEY`; the public key is embedded in the app.
const toBase64Url = (bytes) => Buffer.from(bytes).toString("base64url");
const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
console.log("LICENSE_SIGNING_KEY (secret, PKCS#8):", toBase64Url(await crypto.subtle.exportKey("pkcs8", privateKey)));
console.log("Public key (raw, for the app):        ", toBase64Url(await crypto.subtle.exportKey("raw", publicKey)));
