# Licenses and device activation

The app uses the existing Cloudflare Worker and D1 database in `worker/`. It needs no Supabase project or customer accounts. The website's purchase keys remain unchanged. The user approved this policy on 2026-11-11:

- Three active installations per license; a fourth releases the least recently seen installation.
- A background check at most once every 24 hours, independent of update checks. Manual checks are also available.
- A successful activation/check grants 30 days of offline use. An outage never extends this expiry or immediately cancels a still-valid allowance.
- Refund revocation and released seats lock paid actions at the next successful check; an offline installation can keep using its current signed token until expiry.
- Reclaiming a released seat is explicit in Settings → License. Background checks cannot reclaim it.
- Unlink (including keeping copies) and access to existing files/backups remain available without a license. There is no persistent Undo feature.

## Signed formats

Both formats are `<base64url(JSON)>.<base64url(Ed25519 signature)>`, without padding. Sign the ASCII bytes of the first segment, not decoded JSON or a reserialized payload. The Worker holds the existing private signing key; the app embeds its public half in `stowgui-core/src/license.rs`. This is separate from the minisign key for application releases.

Purchase key v1 remains `{v: 1, id, major: 1, issued}`. It contains no customer email. The sold entitlement is major 1, including prelaunch 0.x builds; change `LICENSED_MAJOR` deliberately before selling a new major.

The new activation payload is:

```json
{
  "v": 1,
  "kind": "activation",
  "product": "stowgui",
  "license_id": "license UUID",
  "major": 1,
  "device_id": "random installation UUID v4",
  "activation_id": "random activation UUID",
  "issued": 1800000000,
  "expires": 1802592000
}
```

The app verifies the signature, format, kind, product, entitlement, license and device binding, and bounds the signed lifetime to 30 days. A purchase key alone never unlocks writes. Local clock rollback beyond five minutes requires correcting the clock and checking online. Local high-water timestamps improve accidental-clock handling; local state and a patched binary are not a tamper-proof DRM boundary.

`Session` stores the device ID, purchase key, activation token, blocked state and timing in `license.json` beside the app's machine-local `settings.toml`, outside managed folders. Writes use a private temporary file and atomic replacement (0600 on Unix). No hardware fingerprint is collected. Do not log request bodies or license keys.

## API extension

- `POST /license/activate`: `{key, device_id, device_name}`. Verifies the exact issued credential against the database, requires an active license, and activates/reclaims a seat.
- `POST /license/check-in`: `{key, device_id, activation_id, device_name}`. Renews an existing seat; never creates one.
- Success: `200 {token}` with a signed activation and `Cache-Control: no-store`.
- Denial: `403 {error: "invalid" | "revoked" | "moved"}`. The app persists the denial and removes its old token.
- Rate limiting: `429`; transient server, connection, malformed or unverifiable response errors preserve the existing token and its original expiry.

D1 migration `0002_activations.sql` adds installation records with a composite license/device key. Activation upsert, eviction and result retrieval run in one transactional D1 batch. Every explicit activation replaces that installation's activation ID, invalidating old check-in credentials. Equal recency is resolved deterministically by device ID. Revocation is rechecked inside the write batch. A native Cloudflare rate-limit binding limits explicit activation bursts per license; its counters are approximate and local to a Cloudflare location.

## App enforcement

Settings → License owns key entry, activation status, manual checks and reclaiming. Workspace checks entitlement immediately before writing managed settings, terminal setup or relink rules. Package handlers check before imports, link/restow, conflict resolution, moving files, and trashing package contents. Unlink is an explicit recovery exemption. Choosing a folder and changing appearance/compare preferences remain available. Automatic `.stowrc` path repair only runs with an active license.

The core library remains usable independently; enforcement is in the shipping app's command owners. UI tests use signed test activations and a test verification key through `Environment`; production startup always constructs the production authority.

## Verification and rollout

Core tests cover signatures, bindings, expiry boundaries, clock rollback, private storage, renewal, server failures and revocation. A shared fixed fixture is verified by both Rust and Worker tests. Worker tests cover four devices and stale credentials, plus real local D1 concurrency and eviction. UI tests exercise preview/apply locking and unlicensed unlink; layout and screenshot tests include the License tab.

Before shipping the app, apply the new D1 migration and deploy the Worker with the `ACTIVATION_LIMIT` binding. Existing purchase keys and the old status/recovery endpoints remain valid. Then exercise activation/renewal from the built app against the deployed Worker using a test purchase. Local tests do not establish live deployment readiness. No migration, deployment, purchase, push or release is performed by building/testing this code.


## Active computer management

The desktop License tab lists computers, marks the current installation and
allows inline renaming and deactivation of other installations. The purchase
key authorizes `POST /license/devices`, `POST /license/rename-device` and
`POST /license/deactivate-device`. All three take `{key, device_id}`; rename also
requires `device_name`. Responses contain `{devices: [{device_id, name}]}` and
never include activation credentials. The shared activation rate limiter also
limits management requests.

Migration `0003_device_names.sql` adds a display name. The system hostname fills
new or unnamed records on activation/check-in. Checks and repeated activation of an existing seat preserve its custom name;
removing or evicting the seat removes its name. On later activation the system
hostname is used again; duplicate names are allowed. Names are trimmed, cannot contain
control characters and have a 128 Unicode character limit. Removing a computer
invalidates its next check-in; issued offline tokens remain valid until expiry.

Before distributing the updated desktop app, apply migration 0003 and deploy
this Worker. This source change does not deploy or modify the live database.
