# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **Pescheria L'Acquario**, a fishmonger in Molinella (Bologna) since 1984. Vanilla HTML/CSS/JS site deployed on Cloudflare Pages with Workers for form handling.

## Commands

```bash
# Local development (serves public/ with Workers)
npx wrangler pages dev public/

# Deploy to Cloudflare Pages (client account: lacquario@faboto.net)
# Credentials in .env (gitignored): CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
source .env && npx wrangler pages deploy public/ --project-name=pescheria-acquario
# IMPORTANT: always pass env vars — wrangler.toml does NOT contain account_id to avoid leaking credentials

# D1 database setup (for booking storage)
npx wrangler d1 create pescheria-bookings
npx wrangler d1 execute pescheria-bookings --file=./schema.sql
```

## Architecture

**Frontend** (`public/`): Zero-build static site. Two pages:
- `index.html` — Single-page home with anchored sections: hero, about, crudo, cotto, CTA, reviews carousel, contact form + map
- `prenotazione.html` — Dedicated booking page with split layout (info + form)

**Backend** (`functions/api/`): Cloudflare Pages Functions (Workers):
- `booking.js` — POST `/api/booking` → validates, saves to D1, sends email via MailChannels
- `contact.js` — POST `/api/contact` → validates, sends email via MailChannels

**Styling** (`public/css/style.css`): Single CSS file using custom properties. Color palette: `--color-primary: #234951`, `--color-accent: #4793a3`, `--color-warm: #e1eff2`, `--color-cta: #b83b2e`. Font: Raleway via Google Fonts. Responsive breakpoints at 1024px, 768px, 480px.

**JS** (`public/js/main.js`): Single vanilla JS file. Features: mobile menu, scroll animations via IntersectionObserver, animated counters, hero image slider, reviews carousel with swipe, form validation and async submission.

**LLM/AEO files** (`public/llms.txt`, `public/llms-full.txt`): Structured text files for AI discoverability. Update these when content changes.

## Key Conventions

- All user-facing text is in Italian
- Code, comments, and documentation in English
- No frameworks, no build step — edit files directly
- Both pages share the same header, footer, and JS/CSS
- Footer contains contact info (address, phone, email, hours) — duplicated in both HTML files, keep in sync
- Schema.org JSON-LD (LocalBusiness + FAQPage) in index.html `<head>`
- Cloudflare credentials stored in `.env` (gitignored), never in `wrangler.toml`
- Business hours: Tuesday–Saturday only (closed Sunday & Monday) — enforced in date picker (JS) and booking Worker
