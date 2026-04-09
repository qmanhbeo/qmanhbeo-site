# World Mode — 2D Pixel RPG Village

> **Implementation tracker.**
> Any World Mode / Game view change is incomplete until this file is updated in the same change.
> See [README.md](./README.md) for the broader site context.

---

## Hard Rule

For this repo, `PLANGAME.md` is the source of truth for the dedicated world route.

Every meaningful World Mode step must update all relevant parts of this file:
- `Handoff / Session State`
- `Progress Log`
- `Checklist`
- Any architecture notes invalidated by the change

Do not keep coding against a stale plan. If the architecture changes, update this file first.

---

## Handoff / Session State

**Last updated:** 2026-04-09

**Status:** `/world` is live as the canonical route. The old `/game` route and `FunMode` scaffolding have been removed. Route-local UI now lives under `app/world/_components`, Phaser/domain code now lives under `game/`, shared sections support `surface="world-panel"`, and the first playable procedural world builds successfully. The world layout now constrains the map card responsively on phone viewports instead of allowing the fixed 640px Phaser surface to force horizontal overflow, and section panels now render as route-level overlays rather than being trapped inside the square map card on mobile. Mobile panel chrome now accounts for safe-area insets and uses a 44px close touch target. Mobile controls now dock below the game viewport instead of overlaying the canvas, and the old route/coordinate/active-panel debug sidebar has been removed from the user-facing UI on all viewports. The procedural fallback art pass now includes richer generated player/NPC sprites, character shadows, textured ground/path tiles, building facades, door/window lighting, building-specific signs, interaction halos, NPC idle bob, player walk bob, campfire sparks, and a readable React prompt plaque driven by Phaser prompt events. Playwright smoke coverage now includes desktop dialogue plus input lock, home CTA entry into `/world`, full home-to-Library-to-item-return restoration, mobile joystick drag plus interact dialogue, an iPhone 14 Pro Max viewport-fit assertion for the map canvas, iPhone 14 Pro Max docked-control placement, and an iPhone 14 Pro Max publications-panel fit/touch-target assertion. Repo-wide lint is still blocked by pre-existing unrelated issues outside the world work.

**Start here next session:**
1. Do a manual touch-device pass for mobile docked controls, panel behavior, and overall feel
2. Add real raster art/audio assets on top of the improved procedural fallback world
3. Decide whether to polish BGM, NPC idle animation, and richer building prompts before deeper world content
4. Keep `/world` as the only route identity; do not reintroduce `/game`
5. Update this file before and after each meaningful World Mode step

**Assets not sourced yet** — Phaser scenes and the world route must fall back gracefully to procedural graphics and silent-safe audio behavior when tiles, sprites, or game audio are missing.

---

## Progress Log

- [x] 2026-04-09: Rejected overlay architecture in favor of a dedicated route.
- [x] 2026-04-09: Built initial route-scaffolding around `/game`, ambient pause/resume hooks, and a basic event bridge.
- [x] 2026-04-09: Validated the route-shell build; lint remains blocked by pre-existing non-world issues in `components/PublicationsSection.tsx`, `components/WandererTrail.tsx`, and `components/ui/InfiniteCarousel.tsx`.
- [x] 2026-04-09: Locked the forward architecture: canonical route `/world`, route UI under `app/world/_components`, Phaser/domain code under `game/`, existing sections reused through thin wrappers plus a minimal `surface="world-panel"` adaptation layer.
- [x] 2026-04-09: Migrated the route from `/game` to `/world`, renamed the state layer from `FunMode` to `World`, and persisted world UI/player state in `sessionStorage`.
- [x] 2026-04-09: Moved world-only React UI into `app/world/_components` and Phaser/domain code into `game/`.
- [x] 2026-04-09: Added `surface="world-panel"` support to Projects, Blog, Publications, and Letter sections, including `/world` item-origin return behavior.
- [x] 2026-04-09: Replaced the world route's letter flow with a world-scoped inline composer instead of the route-global `LetterOverlay`.
- [x] 2026-04-09: Shipped the first playable procedural world with movement, NPC dialogue, building entry, mobile joystick controls, world panels, and persisted player position.
- [x] 2026-04-09: Verified targeted ESLint passes for the world files and `npm run build` passes with `/world`.
- [x] 2026-04-09: Confirmed repo-wide `npm run lint` still fails only on pre-existing unrelated files: `components/WandererTrail.tsx`, `components/ui/InfiniteCarousel.tsx`, `components/ui/MobileSnapCarousel.tsx`, and `hooks/useAudio.ts`.
- [x] 2026-04-09: Anonymized temporary NPC placeholders to generic names: Alex, Adam, and Avery.
- [x] 2026-04-09: Added `tests/playwright/world.smoke.mjs` and passed Playwright smoke coverage for desktop dialogue plus input lock, home CTA entry into `/world`, home-to-Library-to-item-return restore, and mobile joystick drag plus interact dialogue against the live `/world` route.
- [x] 2026-04-09: Confirmed and fixed the mobile world viewport regression where the 640px Phaser surface forced horizontal overflow and clipped the map on iPhone-class screens; added an automated iPhone 14 Pro Max viewport-fit assertion.
- [x] 2026-04-09: Moved world section panels to a route-level overlay so phone layouts are no longer constrained by the square map card; added an automated iPhone 14 Pro Max publications-panel fit assertion.
- [x] 2026-04-09: Added safe-area-aware world panel padding and enforced a 44px mobile close-button touch target in the Playwright panel check.
- [x] 2026-04-09: Added the first procedural art polish pass: generated pixel character textures, player/NPC shadows, textured ground/path, richer building facades, warm windows/doors, and animated campfire sparks.
- [x] 2026-04-09: Moved prompt rendering out of scaled Phaser canvas text into a React prompt plaque fed by `prompt-changed` bridge events, so interaction prompts stay readable on mobile.
- [x] 2026-04-09: Added code-drawn interaction polish: building-specific signs, active target halos, NPC idle bob, and player walk bob while moving.
- [x] 2026-04-09: Restructured mobile `/world` layout so joystick/E controls dock below the game viewport, removed user-facing debug/status panels on all viewports, and exposed non-visual `render_game_to_text` state for Playwright instead of relying on visible coordinates.

---

## The Vibe

Stardew Valley cozy RPG, but night mode. Dark canvas (`#0a0604`), warm amber campfire glow at center, dirt paths to four buildings. 16×16 tiles, free WASD walk, camera follows the player, and the world route owns the whole viewport. Existing React content appears inside in-world panels. NPC friends have pre-written dialogue. Mobile gets a virtual joystick in the first playable milestone. A medieval loop should pause the existing ambient system while the player is in `/world`.

---

## Architecture Flow

```text
Hero "Enter the World" button
  → navigate to /world
  → World route mounts its dedicated screen
      → route UI lives in app/world/_components
      → Phaser/domain code lives in game/
      → world session state restores from sessionStorage
      → ambient audio fades out (without mutating saved prefs)
      → WorldCanvas mounts → dynamic import("phaser") → Phaser.Game
          → BootScene loads assets → WorldScene starts
          → BGM plays (Phaser audio, not Howler)

Player walks to building → press E
  → bridge emits "open-section"
  → a world panel mounts inside /world
  → gameplay input fully locks
  → world panel owns wheel / keyboard / Escape

Opening an item from a world panel
  → save world route + section context as the origin
  → navigate to /item/[slug]
  → closing item detail returns to /world
  → restore player position and world UI from sessionStorage

Exit world
  → close panel/dialogue first if active
  → otherwise navigate back home
  → destroy Phaser game
  → restore ambient audio
```

---

## Route And Ownership

```text
/          → existing horizontal-scroll site
/world     → dedicated world screen
```

Ownership rules:
- `app/world/page.tsx` — route entry only
- `app/world/_components/*` — world-only React UI
- `game/*` — Phaser scenes, objects, config, bridge, state helpers
- `components/*` — shared site content only
- `context/*` — genuinely app-level state such as audio and world navigation/persistence helpers

---

## Shared Section Strategy

Shared sections stay in `components/*`, but gain a minimal explicit surface prop:

```ts
surface?: "home" | "world-panel"
```

`world-panel` must:
- remove home-only viewport sizing assumptions
- avoid mobile `w-screen` breakout behavior inside narrow panels
- use `/world` as the source route for item-detail return state
- avoid route-global overlays or input handlers that conflict with the world route

Canonical world section ids:
- `projects`
- `publications`
- `blog`
- `letter`

Legacy names such as `notes` and `scrolls` should be normalized through a mapping layer, not kept as primary ids.

---

## Map Layout

```text
  [Library NW]         [Workshop NE]
      (8,8)               (26,8)
        \                   /
         \                 /
          \               /
           [🔥 campfire] (20,20)
          /               \
         /                 \
        /                   \
   [Tavern SW]        [Post Office SE]
     (8,26)               (26,26)

NPCs:  Avery (20,22) · Alex near Library (10,10) · Adam near Workshop (24,10)
World: 40×40 tiles × 16px = 640×640px
```

Building → Section mapping:
| Building | Section opened |
|---|---|
| Workshop (NE) | ProjectsSection |
| Library (NW) | PublicationsSection |
| Tavern (SW) | BlogSection |
| Post Office (SE) | LetterSection |

---

## Assets Needed (can be added after wiring)

- [ ] **Tileset** — `public/game/tilesets/tiny-town.png`
- [ ] **Player sprite** — `public/game/characters/player.png`
- [ ] **NPC sprites** — `npc-sydney.png`, `npc-ross.png`, `npc-myanh.png`
- [ ] **Campfire sprite** — `public/game/characters/campfire.png`
- [ ] **BGM** — `public/game/sounds/medieval-bgm.mp3`
- [ ] **SFX footstep** — `public/game/sounds/footstep.wav`
- [ ] **SFX door** — `public/game/sounds/door-enter.wav`
- [ ] **SFX dialogue blip** — `public/game/sounds/dialogue-bleep.wav`
- [ ] **Tiled map** — `public/game/maps/world.json`

---

## Checklist

### Phase 0 — Package
- [x] `npm install phaser` (Phaser 3.90.0)

### Phase 1 — Route Architecture
- [x] Rename the public route from `/game` to `/world`
- [x] Remove the old `/game` route and move route UI into `app/world/_components`
- [x] Rename `FunMode` state to `World` state and persist world UI/session state in `sessionStorage`
- [x] Move bridge/domain concerns out of `components/game/*` into `game/*`
- [x] Update hero entry CTA and global chrome logic to use `/world`

### Phase 2 — Shared Section Adaptation
- [x] Add a minimal `surface="home" | "world-panel"` prop to `ProjectsSection`
- [x] Add the same `surface` prop to `BlogSection`
- [x] Add the same `surface` prop to `PublicationsSection`
- [x] Add the same `surface` prop to `LetterSection`
- [x] Normalize world/home section ids through a shared mapping layer
- [x] Ensure item detail opened from world returns to `/world`
- [x] Replace route-global letter overlay behavior with a world-scoped letter panel/composer path

### Phase 3 — First Playable World
- [x] `game/config/npcData.ts` — pre-written dialogue for Alex, Adam, Avery
- [x] `game/config/buildingData.ts` — building → section mapping and spawn metadata
- [x] `game/objects/*` — player, NPC, and building-zone primitives
- [x] `game/scenes/BootScene.ts` — preload and load-progress bridge events
- [x] `game/scenes/UIScene.ts` — in-world prompts
- [x] `game/scenes/WorldScene.ts` — procedural fallback world, player movement, camera, building entry, ambient glow
- [x] `game/PhaserGame.ts` — Phaser factory with joystick and persistence wiring
- [x] `app/world/_components/WorldCanvas.tsx` — Phaser mount point
- [x] `app/world/_components/WorldSectionPanel.tsx` — panel wrapper for shared sections
- [x] `app/world/_components/WorldDialogueBox.tsx` — dialogue UI
- [x] `app/world/_components/VirtualJoystick.tsx` — docked mobile controls below the game viewport
- [x] `app/world/_components/WorldScreen.tsx` — top-level route shell that coordinates input lock, audio, and persistence
- [x] Procedural fallback art polish — generated sprites, building facades/signs, ground/path texture, shadows, target halos, walk/idle bob, campfire sparks, and readable React prompt plaque

### Phase 4 — Verification
- [x] Playwright smoke: desktop dialogue plus input lock, home CTA → `/world`, Library → item → `/world` return restore, mobile joystick drag plus interact dialogue, iPhone 14 Pro Max viewport-fit, docked mobile controls below the game, and iPhone 14 Pro Max publications-panel fit/touch-target
- [x] Test full cycle: home → `/world` → move → enter building → open section panel → open item → return to `/world` → restore state
- [x] Test dialogue and input lock behavior
- [x] Test mobile joystick movement
- [x] Test mobile viewport fit on an iPhone-class viewport
- [x] Test mobile panel fit on an iPhone-class viewport
- [ ] Test mobile panel behavior on a real touch device
- [x] `npm run build`
- [ ] `npm run lint` if/when unrelated pre-existing issues are addressed

---

## Key Technical Notes

**No Phaser SSR issues** — always dynamic import inside `useEffect`, never top-level.

**World is not a modal** — do not reintroduce a route-wide overlay mounted over the home page.

**Panel input lock is required** — while a world panel or world-scoped composer is open, gameplay input must be paused and `Escape` should close the active world UI first.

**Ambient audio** — pause/resume must use window events so saved ambient prefs remain intact.

**Full persistence uses sessionStorage first** — persist player position, active panel, and dialogue/world context there rather than `localStorage`.

**Procedural fallback first** — the first playable slice must work without real tilesets or sprites.

**Cross-device fit is mandatory** — world UI must size from the viewport down, not from the fixed 640×640 Phaser surface up. Mobile clipping or horizontal overflow is a blocking regression and should be covered by automated viewport checks where practical.

**World panels are route-level overlays** — they should be sized against the `/world` viewport, not against the map card. On mobile, trapping a panel inside the square map container is a layout bug.

**No user-facing debug chrome** — route, coordinate, active-panel, and implementation-status metadata should stay out of the visible `/world` UX. Automated tests should use non-visual state hooks such as `window.render_game_to_text`.

**Mobile controls are docked** — joystick and action controls live below the game viewport in their own touch area. They must not overlay or obscure the canvas.

---

## Codebase Quick Reference

| File / Area | Role |
|---|---|
| `context/AudioContext.tsx` | Ambient audio pause/resume hooks |
| `app/layout.tsx` | Root providers and global chrome |
| `components/HeroSection.tsx` | Home CTA entry into the world route |
| `components/*Section.tsx` | Shared content sections to be adapted for `world-panel` |
| `utils/entryNavigation.ts` | Item-detail origin and return-state persistence |
