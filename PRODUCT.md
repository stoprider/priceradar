# PRODUCT

## Overview
PriceRadar TH is a Thai-first web app for tracking product prices across selected retailers, comparing current prices with recent history, and notifying users when a target price is reached.

## MVP Goal
Ship the URL tracking loop first:
1. User pastes a supported product URL.
2. System validates the store and runs a mock scraper.
3. Product data, price snapshot, and price history are stored.
4. Deal score and confidence are calculated.
5. Telegram alert is sent when current price reaches target.

## Supported Stores
- HomePro
- Power Buy
- Advice
- JIB

## Core Entities
- User
- Store
- Product
- Watchlist
- WatchlistItem
- PriceHistory
- PriceSnapshot
- AlertRule
- ScrapeLog
- NotificationLog

## Product Principles
- Thai-first UX and terminology
- Fast scan dashboard with strong hierarchy
- Confidence-aware pricing, not just raw numbers
- Modular scrapers so each store can evolve independently
- MVP uses mock scrape flow first, then real Playwright adapters per store

## Key Features In This Scaffold
- Marketing landing page and product dashboard
- Login and register entry pages
- Products list, add product flow, and product detail page
- Watchlists, private detail page, and public share page
- Settings and admin scrape logs
- Mock data and repository layer for UI development
- Deal score logic and confidence metadata helpers
- Prisma schema and seed file for PostgreSQL setup
- Telegram notification service scaffold
- Scheduler scaffold for recurring price checks
