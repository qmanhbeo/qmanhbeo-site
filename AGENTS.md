# AGENTS.md

## Project Overview

Manh's personal Next.js site — a horizontally scrolling medieval/campfire-themed portfolio with a 2D pixel RPG world mode, narrative game, archive of projects/publications/notes, and a resume page.

## Build & Test Commands

- `npm install` — install dependencies (do NOT run `npm audit fix --force`)
- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run start` — serve production build
- `npm run test:world` — Playwright smoke tests for world mode

## Project Structure

- Next.js 16 App Router with horizontal-scroll site
- Entry: `app/page.tsx` → horizontal scroll container with 8 sections
- Routes: `/`, `/item/[id]`, `/map`, `/world` (Game view), `/paths-untold`, `/resume`
- Shared UI: `components/*`, `components/ui/*`, `hooks/*`, `utils/*`
- World Mode: `app/world/_components/*` (React) + `game/*` (Phaser)
- Paths Untold: `app/paths-untold/_game/*` (narrative RPG game)

## World Mode (Game View)

- Route: `/world` (not `/game`)
- Source of truth: `docs/world.md` — update on every meaningful change
- Ownership: `app/world/_components/*` (React), `game/*` (Phaser)
- Must verify desktop + mobile viewport on changes
- Playwright tests: `tests/playwright/world.smoke.mjs`

## Architecture Notes

### The horizontal scroll system

The entire site is a single page of 8 full-viewport sections laid out horizontally. `ScrollContainer.tsx` owns scroll state: it tracks `currentSection` (index 0–7), reads/writes `sessionStorage('returnSection')` so the browser restores position on back-navigation, and fires scroll via `container.scrollLeft`. Section components are defined in `utils/sections.ts` as a `SiteSection[]` array — adding a section means adding an entry there plus a corresponding `Component`.

Each section receives a `revealClassName` prop from `ScrollContainer` that applies a CSS reveal animation when the section first comes into view.

### Paginated carousels within sections

`MapSection`, `PublicationsSection`, and `BlogSection` use their own inner carousels. The reusable hook is `hooks/useBoundaryPagedScroll.ts`: it manages `currentIndex`, `isTransitioning`, and wheel-event logic with boundary detection (user must hit the top/bottom of a scroll area before the gesture propagates to change the carousel item). `ProjectsSection` and `BlogSection` use `InfiniteCarousel` instead (CSS snap-scroll, no hook needed).

### Content data

Structured content lives in `content/`:
- `content/arcs/` — travel/arc entries for the Map section
- `content/notes/` — personal campfire notes
- `content/projects/` — project entries
- `content/publications/` — publication entries
- `content/entries.ts` — index that compiles all content types into `archiveEntries[]`

`content/entries.ts` powers the Archive Codex search overlay and the `/item/[id]` detail pages. Every archive entry has an `id` that maps to a dynamic route.

### Overlays

Two full-screen overlays exist alongside the main scroll:
- `ArchiveCodexOverlay` — searchable book-style overlay for all archive entries, opened from HeroSection
- `LetterOverlay` — contact form overlay wrapping `LetterComposer`, opened from HeroSection and LetterSection

Both overlay patterns: `fixed inset-0 z-[70]`, body `overflow: hidden` while open, Escape key closes, animate-in/out via `tailwindcss-animate` classes.

### Styling conventions

- **Fonts**: `font-cinzel` for headings, `font-garamond` for body/italic. Both are CSS variables set in `layout.tsx`.
- **Custom CSS classes** in `globals.css`: `.firelight` (warm overlay), `.medieval-button` (wooden button base), `.ember-glow` (hover glow), `.map-ghost-panel` (parchment panel), `.scrollable-content` / `.scrollbar-fade` (scroll area theming).
- **Navigation safe area**: CSS custom property `--nav-safe-area` keeps section content above the `WandererTrail` bottom nav. Sections use `section-safe-area` class.
- The `WandererTrail` bottom nav reads from `utils/sections.ts` — icon, label, and description come from there.

### API

- `app/api/send-letter/route.ts` — sends email via Resend using env vars `RESEND_API_KEY` and `LETTER_TO_EMAIL`
- `app/api/paths-untold/chat/route.ts` — LLM-powered narrative generation for Paths Untold, supporting Cohere and OpenAI

## Paths Untold

- Route: `/paths-untold`
- An AI-driven narrative RPG game
- Game logic: `app/paths-untold/_game/`
- API: `app/api/paths-untold/chat/route.ts` — uses Cohere (primary) or OpenAI (fallback) for story generation
- Env vars documented in `README.md`

## Coding Conventions

- TypeScript + TSX, 2-space indent, Tailwind
- Components: PascalCase (`HeroSection.tsx`)
- Hooks: `use*` prefix (`useBoundaryPagedScroll.ts`)
- Sections: `*Section.tsx` pattern

## Cross-Device Rule (Hard)

Desktop + mobile verification required. No desktop-first layouts. Mobile clipping/overflow = blocking regression.

## UI/UX Work

For browser-based UI/UX tasks (visual verification, screenshots, interaction testing):
- Preflight first: `node /home/manh/manh-skills/skills/playwright/preflight/playwright_preflight.js`
- Start dev server: `npm run dev` (port 3000)
- Run reusable smoke: `npm run test:world`
- Reusable screenshots: `screenshots/playwright/world/`
- Use `/tmp` only for disposable scratch/debug captures
- Shut down temporary dev servers after verification

## Secrets

- `RESEND_API_KEY`, `LETTER_TO_EMAIL` → `.env.local` only
- All API keys and tokens must be configured via `.env.local` or Vercel environment variables; never commit secrets.
