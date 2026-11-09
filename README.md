# StowGUI website

Source of [stowgui.com](https://stowgui.com): the product page, downloads and purchase flow for StowGUI, a desktop app for GNU Stow. The app itself is developed in a separate private repository.

- `app/`, `dictionaries/`, `lib/` – the Next.js site (static export, English and German), styled with [Arcubic](https://github.com/trainvent/arcubic)
- `worker/` – Cloudflare Worker that turns Stripe payments into license keys and emails them

## Develop

Requires Node 24.

```sh
npm ci
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

Copy `.env.example` to `.env.local` to try the Buy button and key form locally.

Worker:

```sh
cd worker
npm ci
npm test
```

See [docs/dev/deploy.md](docs/dev/deploy.md) for hosting and [docs/dev/selling.md](docs/dev/selling.md) for the payment and license setup.

## License

Website code: MIT. StowGUI itself is commercial software.
