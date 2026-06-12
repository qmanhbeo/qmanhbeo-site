# 🏰 Manh's Cozy Corner - Medieval Personal Website

A horizontally scrolling personal website with a cozy medieval campfire aesthetic, built with Next.js and featuring immersive storytelling elements.

## 🌟 Overview

This project is a unique personal portfolio website that breaks away from traditional vertical scrolling. Instead, it presents content as a horizontal journey through different "sections" of a medieval story, complete with atmospheric lighting, interactive elements, and a bottom navigation trail that resembles a wanderer's path.

## Quick start
```bash
git clone https://github.com/qmanhbeo/qmanhbeo-site
cd qmanhbeo-site

npm install
# dont run "npm audit fix --force" yet
npm run dev

```

Deployed at https://qmanhbeo-site-ecru.vercel.app/

## Environment Variables

This project expects secrets and runtime configuration to be provided locally through `.env.local` or through Vercel environment variables.

Required or optional variables include:

- `RESEND_API_KEY`
- `LETTER_TO_EMAIL`
- `LLM_PROVIDER`
- `COHERE_API` or `COHERE_API_KEY`
- `COHERE_MODEL`
- `COHERE_MODEL_FALLBACKS`
- `COHERE_MODEL_LAST_RESORTS`
- `COHERE_MAX_TOKENS`
- `COHERE_TIMEOUT`
- `ENABLE_PROVIDER_FALLBACK`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_LLM_MODEL`

## World Mode / Game View
- Current route: `/world`. It is a dedicated screen, not an overlay on the home page and not the removed `/game` route.
- Source of truth: [README_World.md](./README_World.md). Any Game view / World Mode change must update that file in the same change.
- Ownership: route UI lives in `app/world/_components`, Phaser/domain logic lives in `game/`, shared content sections stay in `components/*` with `surface="world-panel"` adaptations.
- Current map: a 40x40, 16px-tile night village with Library, Workshop, Tavern, Post Office, central campfire, docked mobile controls, transient prompts, contextual interaction CTAs, route-level panels, and no user-facing debug chrome.
- Current assets: generated repo-owned player/NPC/campfire sprites, `public/game/tilesets/tiny-town.png`, and `public/game/maps/world.json`. See `public/game/ASSET_SOURCES.md` before adding or replacing game assets.
- Cross-device rule: `/world` changes must be checked on desktop and mobile viewports. iPhone-class viewport clipping, overflow, or inaccessible controls are blocking regressions.
- Current verification: the `/world` Playwright smoke suite covers desktop prompt/dialogue/return flows, mobile joystick/interact behavior, iPhone 14 Pro Max viewport fit, docked controls, and mobile panel fit.
- Next Game view work: dedicated world audio assets and behavior: BGM, footsteps, door-enter, and dialogue blip with mobile-safe gesture gating and silent fallback.
- Future idea: AI/NPC free chat can come later, behind server-side env keys and only after the pre-written dialogue flow stays solid.
- Future idea: seasonal weather/background decorations can come later, still keeping night mode as the base visual identity.

---

*"In the quiet hours of night, by firelight and thought, stories come alive in the digital realm."*
