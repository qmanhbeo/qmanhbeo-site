# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # eslint
```

No test suite exists.

## Architecture

### The horizontal scroll system

The entire site is a single page of 8 full-viewport sections laid out horizontally. `ScrollContainer.tsx` owns scroll state: it tracks `currentSection` (index 0–7), reads/writes `sessionStorage('returnSection')` so the browser restores position on back-navigation, and fires scroll via `container.scrollLeft`. Section components are defined in `utils/sections.ts` as a `SiteSection[]` array — adding a section means adding an entry there plus a corresponding `Component`.

Each section receives a `revealClassName` prop from `ScrollContainer` that applies a CSS reveal animation when the section first comes into view.

### Paginated carousels within sections

`MapSection`, `PublicationsSection`, and `BlogSection` use their own inner carousels. The reusable hook is `hooks/useBoundaryPagedScroll.ts`: it manages `currentIndex`, `isTransitioning`, and wheel-event logic with boundary detection (user must hit the top/bottom of a scroll area before the gesture propagates to change the carousel item). `ProjectsSection` and `BlogSection` use `InfiniteCarousel` instead (CSS snap-scroll, no hook needed).

### Content data

All site content lives in `utils/`:
- `utils/content.ts` — `publications[]`, `projects[]`, `blogPosts[]`, and `archiveEntries[]` (a flattened composite of all 19 entries used by the Archive Codex search)
- `utils/travel.ts` — `travelYears[]` for the Map section
- `utils/sections.ts` — section definitions and `timelineEvents[]` for the About section

`ArchiveEntry` (in `content.ts`) is the unified type that powers both the Codex overlay search and the `/item/[id]` detail pages. Every `archiveEntry` has an `id` that maps to a dynamic route.

### Overlays

Two full-screen overlays exist alongside the main scroll:
- `ArchiveCodexOverlay` — searchable book-style overlay for all 19 archive entries, opened from HeroSection
- `LetterOverlay` — contact form overlay wrapping `LetterComposer`, opened from HeroSection and LetterSection

Both overlay patterns: `fixed inset-0 z-[70]`, body `overflow: hidden` while open, Escape key closes, animate-in/out via `tailwindcss-animate` classes.

### Styling conventions

- **Fonts**: `font-cinzel` for headings, `font-garamond` for body/italic. Both are CSS variables set in `layout.tsx`.
- **Custom CSS classes** in `globals.css`: `.firelight` (warm overlay), `.medieval-button` (wooden button base), `.ember-glow` (hover glow), `.map-ghost-panel` (parchment panel), `.scrollable-content` / `.scrollbar-fade` (scroll area theming).
- **Navigation safe area**: CSS custom property `--nav-safe-area` keeps section content above the `WandererTrail` bottom nav. Sections use `section-safe-area` class.
- The `WandererTrail` bottom nav reads from `utils/sections.ts` — icon, label, and description come from there.

### API

One API route: `app/api/send-letter/route.ts` — sends email via Resend using env vars `RESEND_API_KEY` and `LETTER_TO_EMAIL`.
