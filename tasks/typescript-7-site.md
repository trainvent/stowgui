# Move the website to TypeScript 7

The website pins `typescript` to 6.0.3 because `eslint-config-next` uses
typescript-eslint, which refuses TypeScript 7.0 ("typescript-eslint does not
support TS 7.0", checked 2026-11-17 with eslint-config-next 16.4.6). The Worker
has no ESLint and already uses TypeScript 7.

Way back: once typescript-eslint supports TS 7
([tracking issue](https://github.com/typescript-eslint/typescript-eslint/issues/10940)),
install the latest `typescript`, run `npm run lint` and `npm run typecheck`, and
archive this task.
