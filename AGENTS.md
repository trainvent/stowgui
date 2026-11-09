# Agent notes

- The site is a static export for GitHub Pages: no API routes, server actions, middleware or `next/image` optimisation in `app/`. Anything server-side belongs in `worker/`.
- There are two root layouts (`app/[lang]/layout.tsx` and `app/(redirect)/layout.tsx`), so the 404 page is `app/global-not-found.tsx` with `experimental.globalNotFound`.
- All user-facing text lives in `dictionaries/en.ts`; `de.ts` must match its shape (type-checked).
- `worker/` is its own npm package and is excluded from the site's tsconfig and ESLint.
- The license key format is shared with the private app repo (`docs/dev/license-keys.md`). Changing it breaks issued keys — ask first.
