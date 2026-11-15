import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.argv.slice(2).find(arg => arg !== '--check') ?? `${process.env.HOME}/Dokumente/Agents/stowgui/legal`);
const python = process.env.PDF_PYTHON ?? 'python3';
const modules = new Map();
function load(path) {
  if (modules.has(path)) return modules.get(path);
  const loaded = { exports: {} };
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
  }).outputText;
  runInNewContext(source, {
    module: loaded, exports: loaded.exports, process: { env: {} },
    require: (name) => load(name === '@/lib/config' ? resolve(root, 'lib/config.ts') : resolve(dirname(path), `${name}.ts`)),
  }, { filename: path });
  modules.set(path, loaded.exports);
  return loaded.exports;
}
const documents = Object.fromEntries(['de', 'en'].map(locale => {
  const dict = load(resolve(root, `dictionaries/${locale}.ts`)).default;
  return [locale, { terms: dict.terms, privacy: dict.privacy }];
}));
const bundle = resolve(root, 'worker/src/legal/attachments.json');
const manifestPath = resolve(root, 'worker/src/legal/manifest.json');
const hash = value => createHash('sha256').update(value).digest('hex');
const sourceHash = hash(JSON.stringify(documents));
const generatorHash = hash(readFileSync(resolve(root, 'scripts/legal-documents.py')));
if (process.argv.includes('--check')) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.source !== sourceHash || manifest.generator !== generatorHash) throw new Error('Legal texts changed; regenerate and visually review the PDFs.');
  const attachments = JSON.parse(readFileSync(bundle, 'utf8'));
  for (const locale of ['de', 'en']) for (const attachment of attachments[locale]) {
    if (manifest.pdfs[attachment.name] !== hash(Buffer.from(attachment.content, 'base64'))) throw new Error(`PDF checksum mismatch: ${attachment.name}`);
  }
  console.log('Legal attachments match the website texts and recorded PDF checksums.');
  process.exit(0);
}
mkdirSync(output, { recursive: true });
const result = spawnSync(python, [resolve(root, 'scripts/legal-documents.py'), output], {
  input: JSON.stringify(documents), encoding: 'utf8', stdio: ['pipe', 'inherit', 'inherit'],
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
const attachments = Object.fromEntries(Object.entries(documents).map(([locale, docs]) => [locale,
  Object.keys(docs).map(kind => {
    const name = `StowGUI-${kind}-${locale}.pdf`;
    return { name, content: readFileSync(resolve(output, name)).toString('base64') };
  }),
]));
writeFileSync(bundle, `${JSON.stringify(attachments, null, 2)}\n`);
writeFileSync(manifestPath, `${JSON.stringify({ source: sourceHash, generator: generatorHash, pdfs: Object.fromEntries(Object.values(attachments).flat().map(a => [a.name, hash(Buffer.from(a.content, 'base64'))])) }, null, 2)}\n`);
console.log(`Legal PDFs: ${output}`);
