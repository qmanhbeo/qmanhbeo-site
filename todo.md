  UI/UX Audit — qmanhbeo-site

  Critical Issues

  1. ✅ Publications — Mobile: Drop cap breaks title layout
  DONE — Drop cap hidden on mobile via `hidden md:inline`; first letter re-emitted as
  plain text on mobile only.

  2. ✅ Socials — Mobile: Heading text truncated
  DONE — Added `text-4xl` mobile base, scales to `sm:text-5xl md:text-6xl`.

  3. ✅ Map — Desktop/All: Photos render as blank white squares
  DONE — Converted 10 photos to WebP, wired to 3 arcs (2021–23 UEH, 2024 EEPSEA,
  2025–26 Birmingham). Grid auto-sizes by photo count.

  ---
  Major Issues

  4. ✅ Letter Section — Desktop: Extremely sparse
  DONE — firelight bumped to opacity-60; ambient verse added below CTA.

  5. ✅ About — Desktop: Timeline cuts off
  DONE — max-h bumped to 78vh; bottom fade affordance added.

  6. ✅ Hero — Mobile: "Send a Letter" button missing
  DONE — h1 scaled from text-5xl to text-4xl on mobile; flame margin tightened.
  Both CTAs now visible above the fold on 390px.

  7. ✅ About — Tablet: Layout breaks at 768px
  DONE — ScrollArrows changed to `hidden lg:block`; arrows no longer appear below 1024px.

  ---
  Minor Issues

  8. Spell Scrolls — Desktop: Card text is very dense
  desktop_section_03 — Project cards have 3 columns of small, dense italic text on
  parchment. Low readability at a glance, especially for card subtitles/tags.

  9. ✅ Blog — Desktop: First card partially cut
  DONE — Shell div changed from overflow-visible to overflow-hidden; peeking card clipped.

  10. Map year toggle pill — Desktop
  desktop_section_02 — The year pill 2021 appears against the section title but feels
  visually disconnected from the photo zone below. No visual cue linking the pill to
  the content it controls.

  11. ✅ Hero — Nav arrow contrast
  DONE — Persistent ember halo added via shadow-[0_0_14px_rgba(255,140,0,0.22)].

  ---
  Playwright Audit — 2026-04-02

  HIGH

  - [ ] Carousel dot/pip buttons too small (Journey & Manuscripts sections)
        Year dots: 12–15px wide — nearly impossible to click, fails touch targets
        Manuscript selector dots: same issue
        Prev/Next chevron buttons: 27×27px (below 28px threshold, far from WCAG 44px)

  - [ ] Birmingham-20261.webp is 1.5MB — too large
        Consistently fails to render within viewport on slow connections
        Fix: compress/resize to ≤300KB, or add a low-res placeholder while loading

  MEDIUM

  - [ ] Mobile: Letter section title wraps awkwardly
        "Write Him a Letter" breaks as "Write Him a" / "Letter" at 390px
        Fix: text-nowrap or shorter mobile copy

  - [ ] Mobile: Projects/Forge card text clips at top of scroll card

  - [ ] Archive Codex: right panel doesn't auto-focus first search result
        Searching filters the left list but detail panel keeps previously selected item

  LOW

  - [ ] "↳ Alpha-learning momentum model (public)" link is 27px tall (About & Publications)
        Fix: add py-1 to the link element

  - [ ] Chronicle scroll quote slightly clipped on right edge at 1440px

  - [ ] Blog/Notes mobile: no affordance for more cards
        Only 1 card visible, no swipe indicator or dot pagination shown

  ---
  What's Working Well

  - The overall dark night-sky aesthetic is cohesive and atmospheric across all
  sections
  - Font pairing (Cinzel + Garamond) reads beautifully on desktop
  - WandererTrail bottom nav dot indicators are clean and informative
  - Mobile Hero adapts well — name reflows gracefully to 3 lines
  - Map section's single-card mobile layout is a smart adaptation
  - The parchment scroll styling on project cards is distinctive and on-brand
  - Zero console errors or warnings across all three viewport sizes

  ---
  Priority Order

  ┌──────────┬────────────────────────────────────────────┐
  │ Priority │                   Issue                    │
  ├──────────┼────────────────────────────────────────────┤
  │ P0       │ Map photos blank (looks broken)            │
  ├──────────┼────────────────────────────────────────────┤
  │ P0       │ Publications drop cap breaks mobile title  │
  ├──────────┼────────────────────────────────────────────┤
  │ P1       │ Socials heading truncated on mobile        │
  ├──────────┼────────────────────────────────────────────┤
  │ P1       │ Hero missing "Send a Letter" CTA on mobile │
  ├──────────┼────────────────────────────────────────────┤
  │ P2       │ Letter section needs visual substance      │
  ├──────────┼────────────────────────────────────────────┤
  │ P2       │ About timeline overflow                    │
  ├──────────┼────────────────────────────────────────────┤
  │ P3       │ Tablet About layout                        │
  ├──────────┼────────────────────────────────────────────┤
  │ P3       │ Blog first card clipped                    │
  ├──────────┼────────────────────────────────────────────┤
  │ P4       │ Nav arrow contrast                         │
  └──────────┴────────────────────────────────────────────┘