# PriceRadar TH

[ภาษาไทย](./README.th.md)

[![Release](https://img.shields.io/github/v/release/stoprider/priceradar)](https://github.com/stoprider/priceradar/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Web-0B5A72)](https://github.com/stoprider/priceradar/releases)
[![License](https://img.shields.io/github/license/stoprider/priceradar)](./LICENSE)

PriceRadar TH is a Thai-first price tracking app for Thailand e-commerce, with both web and Windows desktop distribution.

## Download
Latest desktop builds are available on the [Releases page](https://github.com/stoprider/priceradar/releases).

Current recommended version:
- Windows installer: `v0.1.8`
- Release page: `https://github.com/stoprider/priceradar/releases/tag/v0.1.8`

## Highlights
- Product tracking, dashboard, watchlists, and product detail pages
- Telegram alerts for target price and real price drops
- In-app Telegram settings with bot token, chat ID, status, and test send
- Windows installer with GitHub Release-based update flow
- Marketplace detection for Shopee, Lazada, and Temu, while keeping unsupported sources blocked in production

## Stack
- Next.js 16 + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Electron + electron-builder
- Playwright

## Local Development
1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
copy .env.example .env
```

3. Prepare database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Demo account:

```text
email: demo@priceradar.th
password: demo12345
```

4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`

## Useful Commands
```bash
npm run lint
npm run build
npm run prices:check
npm run desktop:dev
npm run build:desktop
npm run build:desktop:beta
```

## Windows Desktop Build
Build a Windows installer:

```bash
npm run build:desktop
```

Artifacts are written to `dist-desktop/`.

If your environment has `ELECTRON_RUN_AS_NODE=1`, the installed Windows shortcuts launch through a bundled launcher that clears it automatically.

## Release Environment
Real distribution settings are documented in `.env.release.example`.

Common release variables:
- `GH_TOKEN`
- `PR_UPDATE_CHANNEL=latest` or `beta`
- `CSC_LINK`
- `CSC_KEY_PASSWORD`

## Notes
- Production deployment still needs a strong `SESSION_SECRET`.
- Telegram alerts require valid Telegram credentials.
- Live scraping selectors may need maintenance when retailer markup changes.
- Shopee, Lazada, and Temu are recognized in the app, but remain blocked for production tracking until reliable upstream data paths are available.
