# PriceRadar TH

Thai-first price tracking, comparison, deal scoring, watchlists, and Telegram alert scaffold for Thailand e-commerce.

## Stack
- Next.js 16 + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Recharts
- Playwright
- node-cron
- NextAuth-ready foundation

## Included In This Scaffold
- Premium landing page and dashboard
- `/login`, `/register`, `/dashboard`
- `/products`, `/products/new`, `/products/[id]`
- `/watchlists`, `/watchlists/[id]`
- `/share/watchlist/[publicId]`
- `/settings`, `/admin/logs`
- Reusable UI primitives and product-specific components
- Mock scraper, deal score logic, confidence logic
- Telegram notification service scaffold
- Prisma schema, seed file, and `.env.example`
- Real credential auth with signed cookie sessions
- Database-backed dashboard, products, watchlists, settings, and scrape logs

## Run In VS Code
1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Push the schema:

```bash
npm run db:push
```

5. Seed demo data:

```bash
npm run db:seed
```

Demo login after seed:

```text
email: demo@priceradar.th
password: demo12345
```

6. Run the app:

```bash
npm run dev
```

7. Open `http://localhost:3000`

## Useful Commands
```bash
npm run lint
npm run prices:check
npm run desktop:dev
npm run build:desktop
```

## Windows Installer
Build a Windows installer with the bundled desktop runtime:

```bash
npm run build:desktop
```

The installer output is written to `dist-desktop/`.
Desktop release builds now include:
- custom app and installer icon
- GitHub Release-based update checks from inside the app
- `latest.yml` metadata for desktop update flows

If your shell has `ELECTRON_RUN_AS_NODE=1`, launch the desktop app through:

```bash
npm run desktop:dev
```

That helper clears the conflicting environment flag before starting Electron.

## Docker
Run the full app stack with SQLite-backed app container:

```bash
docker compose up --build
```

The containerized app exposes:
- app: `http://localhost:3000`
- health: `http://localhost:3000/api/health`

For non-demo environments, replace the default secrets in `docker-compose.yml` or pass them from a real secret store.

## Notes
- The app now uses live server-side persistence and signed cookie auth. Production deployment still requires a strong `SESSION_SECRET` and valid Telegram bot credentials if you enable alerts.
- Scraping is implemented with a live HTML fetch + parsing pipeline for supported stores. Retailer markup can change over time, so selector maintenance is part of ongoing operations.
- Run `npm run prices:check` from cron or your job runner to refresh tracked products outside the web request path.
