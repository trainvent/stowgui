import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { experimental_readRawConfig } from "wrangler";

const workerDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { rawConfig } = experimental_readRawConfig({ config: join(workerDir, "wrangler.toml") });
const config = structuredClone(rawConfig);
const databases = config.d1_databases ?? [];
if (!databases.length || databases.some((db) => !db.database_id || !db.binding)) {
  throw new Error("Deployment requires explicit existing D1 database IDs.");
}

// Wrangler 4.159/4.160 upload D1's deprecated `id`; Cloudflare rejects it with 10021.
// Use the current API field without duplicating the canonical migration/development config.
config.unsafe ??= {};
config.unsafe.bindings = [
  ...(config.unsafe.bindings ?? []),
  ...databases.map((db) => ({ name: db.binding, type: "d1", database_id: db.database_id })),
];
delete config.d1_databases;
config.main = resolve(workerDir, config.main);
const temporary = mkdtempSync(join(tmpdir(), "stowgui-deploy-"));
let result;
try {
  const configPath = join(temporary, "wrangler.json");
  writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
  result = spawnSync(process.execPath, [
    join(dirname(fileURLToPath(import.meta.resolve("wrangler/package.json"))), "bin/wrangler.js"),
    "deploy", "--config", configPath, ...process.argv.slice(2),
  ], { cwd: workerDir, stdio: "inherit" });
  if (result.error) throw result.error;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
process.exitCode = result.status ?? 1;
