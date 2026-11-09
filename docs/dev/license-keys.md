# License key format (v1)

```
<base64url(payload JSON)>.<base64url(Ed25519 signature over the first part)>
```

Payload:

| Field | Meaning |
| --- | --- |
| `v` | Format version, `1` |
| `id` | License id (UUID), used for `GET /license/status?id=` |
| `major` | App major version the key unlocks, `1` |
| `issued` | Unix seconds |

- base64url without padding. The signature covers the ASCII bytes of the first part exactly as written.
- The Worker signs with the PKCS#8 private key in the `LICENSE_SIGNING_KEY` secret. The app embeds the matching 32-byte raw public key (printed by `npm run keypair` in `worker/`) and verifies offline.
- Production public key: `9uNumF5g3RuMcoNIqrzns1SqX6O2DE_EHdiZ8HspLpA`. The private key is backed up in `~/Dokumente/Agents/stowgui/license-signing-key.txt`.
- Keys contain no personal data.
- Revocation is online only: the app asks `/license/status` now and then and locks Apply/Import/Undo when `active` is `false`. Device activation (3 computers) is planned in the app's Milestone 6 and will extend this API.
- Reference implementation and tests: `worker/src/license.ts`, `worker/test/license.test.ts`.
