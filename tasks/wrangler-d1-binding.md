# Remove D1 upload workaround when Wrangler uses database_id

Standard `wrangler deploy` fails with Cloudflare error 10021 (`binding DB of type d1 failed to generate`) for the existing StowGUI database. This reproduced on Wrangler 4.159.0 and 4.160.0 on 2026-11-11. The CLI serializes D1 bindings as `{name, type: "d1", id}`. The database is readable and its UUID matches the deployed binding, so replacing or recreating the database is unnecessary.

A diagnostic upload changed that binding to `{name, type: "d1", database_id}` using Wrangler's metadata escape hatch and succeeded without changing the database. The normal deploy command now uses `worker/scripts/deploy.mjs` to make that same transformation from the canonical TOML configuration. No dependency files or upstream package code are patched.

Way back: when an upstream Wrangler release sends `database_id` or the remote API accepts standard uploads again, verify a standard upload against this existing database, restore the `deploy` npm script to `wrangler deploy`, remove the wrapper and its developer-doc instructions, and archive this task. Keep the UUID and migration history unchanged.

Evidence: failed original uploads; successful alternate-field version upload; successful `npm run deploy`; live activation/renewal, fourth-device eviction/reclaim and three-seat database count; received corrected email with both plain-text and wrapping HTML parts. Local unit tests alone cannot reproduce this remote upload validation failure.

Reference: [Cloudflare Workers API D1 binding schema](https://developers.cloudflare.com/api/resources/workers/) documents `database_id` and marks `id` deprecated. This diagnosis establishes the accepted workaround for this deployment, not why Cloudflare's deprecated-field handling differs.
