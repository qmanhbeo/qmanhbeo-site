# AGENTS.md

## Build & Test Commands
- `npm install` — install dependencies (do NOT run `npm audit fix --force`)
- `npm run dev` — start dev server (localhost:3000)
- `npm run lint` — ESLint (fails on pre-existing issues in `components/WandererTrail.tsx`, `components/ui/InfiniteCarousel.tsx`, etc.)
- `npm run build` — production build
- `npm run start` — serve production build

## Project Structure
- Next.js 16 App Router with horizontal-scroll site
- Entry: `app/page.tsx` → horizontal scroll container with 8 sections
- Routes: `/`, `/item/[id]`, `/map`, `/world` (Game view)
- Shared UI: `components/*`, `components/ui/*`, `hooks/*`, `utils/*`
- World Mode: `app/world/_components/*` + `game/*`

## World Mode (Game View)
- Route: `/world` (not `/game`)
- Source of truth: `PLANGAME.md` — update on every meaningful change
- Ownership: `app/world/_components/*` (React), `game/*` (Phaser)
- Must verify desktop + mobile viewport on changes
- Playwright tests: `tests/playwright/world.smoke.mjs`

## Coding Conventions
- TypeScript + TSX, 2-space indent, Tailwind
- Components: PascalCase (`HeroSection.tsx`)
- Hooks: `use*` prefix (`useBoundaryPagedScroll.ts`)
- Sections: `*Section.tsx` pattern

## Cross-Device Rule (Hard)
Desktop + mobile verification required. No desktop-first layouts. Mobile clipping/overflow = blocking regression.

## UI/UX Work
For browser-based UI/UX tasks (visual verification, screenshots, interaction testing):
- Canonical doctrine: `/home/manh/manh-skills/skills/playwright/SKILL.md`
- Preflight first: `node /home/manh/manh-skills/skills/playwright/preflight/playwright_preflight.js`
- Start dev server: `npm run dev` (port 3000)
- Run reusable smoke: `npm run test:world`
- Reusable screenshots: `screenshots/playwright/world/`
- Use `/tmp` only for disposable scratch/debug captures
- Shut down temporary dev servers after verification

## Secrets
- `RESEND_API_KEY`, `LETTER_TO_EMAIL` → `.env.local` only
