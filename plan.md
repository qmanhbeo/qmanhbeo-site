 Manh's Cozy Corner — Improvement Roadmap

 A prioritized backlog of everything needed to take the site from MVP to something genuinely polished and complete.
 Organized by impact tier.

 ---
 Tier 1 — Quick Wins (high impact, low effort)

 1. Favicon & tab name

 - Add a favicon (a flame emoji or small campfire PNG works) via app/favicon.ico or <link> in app/layout.tsx
 - Change <title> to something more evocative than the default (e.g. "Manh's Cozy Corner")
 - Files: app/layout.tsx

 2. Fellowship hover lights bug

 - The WoodenMedallion buttons in SocialsSection have broken hover glow effects
 - Files: components/ui/WoodenMedallion.tsx, app/globals.css

 3. Letter overlay viewport fix (still open)

 - The overlay still overflows on small screens despite multiple attempts
 - Root issue: overflow-hidden on the dialog wrapper clips the parchment shadow/border
 - Correct fix: mirror the Codex exactly — outer dialog wrapper has NO height/flex, add an inner container with
 h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] flex flex-col overflow-hidden, keep title flex-shrink-0 and scroll div
 min-h-0 flex-1 overflow-y-auto
 - Files: components/ui/LetterOverlay.tsx

 4. Publication section — replace placeholder content

 - The three ScholarScroll panels currently show "Research Context / Key Contributions / Research Methodology" with
 filler text
 - Replace with real abstracts and actual contributions drawn from the paper data already in utils/content.ts
 - Files: components/PublicationsSection.tsx, utils/content.ts

 5. Archive entry detail pages — fill in real content

 - app/item/[id]/ItemPageContent.tsx shows a "placeholder version" warning
 - Each entry (19 total: 3 publications + 6 projects + 8 blog posts + 6 journeys) needs a real fullContent field
 - Add a fullContent field to the ArchiveEntry type and populate it in utils/content.ts
 - ItemPageContent.tsx renders it instead of the placeholder message
 - Files: utils/content.ts, app/item/[id]/ItemPageContent.tsx

 6. Add project links

 - Several SpellScroll cards are missing GitHub/demo/paper links
 - Fill in actual URLs in utils/content.ts for all projects that have them
 - Files: utils/content.ts

 ---
 Tier 2 — Content & Polish (medium effort, meaningful improvement)

 7. Real blog post reflections (Campfire Notes)

 - The 8 TavernTale cards have brief placeholder excerpts
 - Write genuine 2–3 sentence reflections for each post in utils/content.ts
 - These are what visitors read first — they should feel authentic and personal
 - Files: utils/content.ts

 8. Add photos / portrait

 - The About section references a portrait image that isn't there
 - Add a real photo (or illustrated avatar) to public/ and wire it in to AboutSection.tsx
 - Optionally add landscape/travel photos to the Map section journey cards
 - Files: components/AboutSection.tsx, components/MapSection.tsx, public/

 9. More social links

 - Current Fellowship section has GitHub, LinkedIn, Archive, Letter
 - Consider adding: ResearchGate, Google Scholar, or a CV/resume download link
 - Files: components/SocialsSection.tsx, components/ui/WoodenMedallion.tsx

 10. Verify letter / email delivery end-to-end

 - The /api/send-letter route uses Resend — needs a real LETTER_TO_EMAIL env var
 - Test the full flow: submit form → email arrives → confirm success/error states work
 - Files: app/api/send-letter/route.ts, .env.local

 11. Publication paper links

 - content.ts has a link? field on Publications but some entries are missing URLs
 - Add links to actual papers (PDFs, journal pages, or preprints)
 - Files: utils/content.ts

 ---
 Tier 3 — Feature Additions (bigger effort, high delight)

 12. Seasonal / time-of-year decorations

 - Simple if/then on current month: Lunar New Year (Jan/Feb), Halloween (Oct), Christmas/Solstice (Dec)
 - Could be as simple as swapping the background gradient or adding a CSS class to <body>
 - Reusable every year with no ongoing effort
 - Files: app/layout.tsx or a new SeasonalDecorations client component

 13. Embedded mini-projects (web-usable tools)

 - Add interactive demo versions of projects directly within Spell Scroll cards
 - Good candidates: stock data fetcher UI, news fetcher, real estate search
 - Each could be a server action or API route that calls the underlying Python logic
 - Files: New app/api/ routes + expandable panel in components/ui/SpellScroll.tsx

 14. Fun Mode — 2D pixel world (stretch goal)

 - Add a toggle that replaces the horizontal scroll with a Phaser.js pixel town
 - Buildings map to sections: workshop (projects), library (publications), tavern (blog), post office (letters),
 campfire (hero)
 - NPC friends with pre-written dialogue, optional OpenAI API for extended chat
 - Full plan already documented in README.md
 - Files: New components/FunMode/ directory, app/layout.tsx toggle, Phaser.js integration

 ---
 Open Bug (from previous session)

 - Letter overlay viewport — see Tier 1 item 3 above. Previous attempts modified the dialog wrapper directly; the
 correct fix is the nested-container pattern from ArchiveCodexOverlay.tsx (line 141: inner div with
 h-[calc(100dvh-2rem)] flex flex-col overflow-hidden, outer wrapper has no height).

 ---
 Critical Files Reference

 ┌────────────────────────────────────┬───────────────────────────────────────────────────────┐
 │                File                │                     Relevant for                      │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ app/layout.tsx                     │ Favicon, title, seasonal theming                      │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ utils/content.ts                   │ All content data — publications, projects, blog posts │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ app/item/[id]/ItemPageContent.tsx  │ Archive detail pages                                  │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ components/PublicationsSection.tsx │ Placeholder publication content                       │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ components/ui/LetterOverlay.tsx    │ Letter viewport fix                                   │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ components/ui/WoodenMedallion.tsx  │ Fellowship hover lights                               │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ components/SocialsSection.tsx      │ Social links                                          │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ components/AboutSection.tsx        │ Portrait photo                                        │
 ├────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ app/api/send-letter/route.ts       │ Email delivery                                        │
 └────────────────────────────────────┴───────────────────────────────────────────────────────┘