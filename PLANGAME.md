# Game View — 2D Pixel RPG Village

> **Implementation tracker.**
> Any Game view / Fun Mode change is incomplete until this file is updated in the same change.
> See [README.md](./README.md) for general project overview.

---

## Hard Rule

For this repo, `PLANGAME.md` is the source of truth for the Game view.

Every meaningful Game view step must update all relevant parts of this file:
- `Handoff / Session State`
- `Progress Log`
- `Checklist`
- Any architecture notes invalidated by the change

Do not keep coding against a stale plan. If the architecture changes, update this file first.

---

## Handoff / Session State

**Last updated:** 2026-04-09

**Status:** Overlay architecture rejected. Route-based Game screen is now the correct direction. Phase 1 route infrastructure is complete. Phaser gameplay work has not started yet. `npm run build` passes on the new route shell. `npm run lint` is still blocked by pre-existing issues outside the Game view.

**Start here next session:**
1. Start Phase 2 with `game/config/npcData.ts` and `game/config/buildingData.ts`
2. Build `components/game/GameCanvas.tsx` only after the first Phaser scene files exist
3. Keep the dedicated `/game` route model; do not reintroduce a site-wide overlay shell
4. Update this file before and after each meaningful Game view step

**Assets not sourced yet** — all Phase 2 Phaser code should fall back gracefully to procedural Graphics when tileset, sprites, or game audio are missing. Wire the React ↔ Phaser flow first, then drop in real assets later.

---

## Progress Log

- [x] 2026-04-09: Corrected architecture direction from "full-screen overlay on top of home" to "dedicated `/game` route and screen".
- [x] 2026-04-09: Added `FunModeContext` with route-aware `openFunMode`, `closeFunMode`, and Game UI state reset behavior.
- [x] 2026-04-09: Added typed `GameBridge` event bus for future Phaser ↔ React wiring.
- [x] 2026-04-09: Wired ambient pause/resume through `AudioContext` and `AmbientPlayer` without mutating saved volume prefs.
- [x] 2026-04-09: Added dedicated `/game` route shell and Hero CTA navigation; hid global atmosphere controls while Game view is active.
- [x] 2026-04-09: Verified `npm run build` passes with the dedicated `/game` route. `npm run lint` still fails on pre-existing issues in `components/PublicationsSection.tsx`, `components/WandererTrail.tsx`, and `components/ui/InfiniteCarousel.tsx`.

---

## The Vibe

Stardew Valley cozy RPG, but night mode. Dark canvas (`#0a0604`), warm amber campfire glow at center, dirt paths to four buildings. 16×16 tiles, free WASD walk, Phaser camera follows player. Scrollable 640×640 world. Existing React section components slide in inside the Game screen when you enter a building. NPC friends with pre-written dialogue. Mobile virtual joystick. New looping medieval BGM that pauses the existing ambient system while in Game view.

---

## Architecture Flow

```text
Hero "Enter the World" button
  → navigate to /game
  → Game route mounts its dedicated screen
      → Game screen owns the full viewport
      → ambient audio fades out (custom window events, prefs preserved in localStorage)
      → GameCanvas mounts → dynamic import('phaser') → Phaser.Game
          → BootScene loads assets → WorldScene starts
          → BGM plays (Phaser WebAudio, not Howler)

Player walks to building → press E
  → GameBridge.emit('open-section', { sectionId })
  → Section panel mounts inside Game screen
  → Physics paused, player controls locked, BGM ducks to 20%

Section panel closes
  → GameBridge.emit('section-closed')
  → Physics and controls resume, BGM restores to 40%

Exit button or Escape
  → navigate back home
  → Game route unmounts → game.destroy(true)
  → ambient audio restores to saved volumes
```

**Why this architecture wins**
- The Game owns the viewport and input model instead of fighting the home page scroll system
- Phaser code is route-scoped and only loaded for `/game`
- Browser history, back navigation, and direct linking work naturally
- Audio, dialogue, and section state can be isolated to the Game screen

---

## Route Shape

```text
/          → existing horizontal-scroll site
/game      → dedicated Game screen
```

Recommended ownership:
- `app/game/page.tsx` — route entry for the Game screen
- `components/game/GameScreen.tsx` — top-level screen shell for `/game`
- `components/game/GameCanvas.tsx` — Phaser mount point
- `components/game/SectionPanel.tsx` — existing React content rendered inside the Game screen
- `context/FunModeContext.tsx` — navigation helpers plus Game UI state

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

NPCs:  My Anh (20,22) · Sydney near Library (10,10) · Ross near Workshop (24,10)
World: 40×40 tiles × 16px = 640×640px
```

Building → Section mapping:
| Building | Section opened |
|---|---|
| Guild Hall / Workshop (NE) | ProjectsSection |
| Archive / Library (NW) | PublicationsSection |
| Tavern / Study Hut (SW) | BlogSection |
| Post Office (SE) | LetterSection |

---

## Assets Needed (source before Phase 2 game content)

- [ ] **Tileset** — Kenney Tiny Town (CC0, 16px) → `public/game/tilesets/tiny-town.png`
- [ ] **Player sprite** — Kenney Micro Roguelike character (CC0, 16px walk frames) → `public/game/characters/player.png`
- [ ] **NPC sprites** — 3 variants from same pack → `npc-sydney.png`, `npc-ross.png`, `npc-myanh.png`
- [ ] **Campfire sprite** — 4-frame animated strip → `public/game/characters/campfire.png`
- [ ] **BGM** — CC0 medieval loop → `public/game/sounds/medieval-bgm.mp3`
- [ ] **SFX footstep** — `public/game/sounds/footstep.wav`
- [ ] **SFX door** — `public/game/sounds/door-enter.wav`
- [ ] **SFX dialogue blip** — `public/game/sounds/dialogue-bleep.wav`
- [ ] **Tiled map** — `public/game/maps/world.json`
  - Layers: `Ground`, `Paths`, `Decorations`, `Collision`, `Buildings`, `Above`
  - Object layers: `BuildingZones`, `NPCSpawns`, `PlayerSpawn`

---

## Checklist

### Phase 0 — Package
- [x] `npm install phaser` (Phaser 3.90.0)

### Phase 1 — Route Infrastructure (no Phaser gameplay yet, just wiring)
- [x] `context/FunModeContext.tsx` — provides route-aware `isFunModeActive`, `openFunMode`, `closeFunMode`, `activeSectionId`, `setActiveSectionId`, `dialogueState`, `setDialogueState`, `resetGameUi`
- [x] `components/game/GameBridge.ts` — typed `EventTarget` singleton for Phaser ↔ React communication
- [x] Modify `context/AudioContext.tsx` — add `pauseAllAmbient()` / `resumeAllAmbient()` that dispatch window events without touching state or localStorage
- [x] Modify `components/ui/AmbientPlayer.tsx` — listen for `ambient:pause` / `ambient:resume`, fade Howl instances without mutating React audio prefs
- [x] `app/game/page.tsx` — dedicated Game route entry
- [x] `components/game/GameScreen.tsx` — full-screen route shell, owns audio pause/resume and temporary placeholder UI before Phaser lands
- [x] Modify `app/layout.tsx` — wrap app with `FunModeProvider`
- [x] Modify `components/HeroSection.tsx` — add "Enter the World" CTA that navigates to `/game`

### Phase 2 — Phaser core
- [ ] `game/config/npcData.ts` — pre-written dialogue for Sydney, Ross, My Anh
- [ ] `game/config/buildingData.ts` — building name → sectionId → Tiled object name
- [ ] `game/objects/Player.ts` — WASD + arrow keys + joystick input, walk animations, footstep SFX, `playerControlsLocked` flag
- [ ] `game/objects/NPC.ts` — idle animation, proximity detection, dialogue trigger via `GameBridge`
- [ ] `game/objects/BuildingZone.ts` — arcade physics zone, "Press E" prompt, entry emits bridge event
- [ ] `game/scenes/BootScene.ts` — preload all assets, emit load-progress via bridge, start `WorldScene`
- [ ] `game/scenes/UIScene.ts` — in-world "Press E to talk / enter" prompts
- [ ] `game/scenes/WorldScene.ts` — tilemap, Player, NPCs, BuildingZones, camera, BGM, campfire, ambient glow
- [ ] `game/PhaserGame.ts` — factory `createPhaserGame(container, getJoystickInput)`

### Phase 3 — Game screen UI
- [ ] `components/game/ExitButton.tsx` — exit back to home
- [ ] `components/game/DialogueBox.tsx` — bottom DOM panel for NPC dialogue
- [ ] `components/game/SectionPanel.tsx` — renders one of `ProjectsSection`, `PublicationsSection`, `BlogSection`, `LetterSection`
- [ ] `components/game/VirtualJoystick.tsx` — touch-only joystick overlay
- [ ] `components/game/GameCanvas.tsx` — mounts Phaser and reports loading progress

### Phase 4 — Connect React content to gameplay
- [ ] Wire `GameBridge` open-section events into `SectionPanel`
- [ ] Wire dialogue events into `DialogueBox`
- [ ] Close section panels without leaving `/game`
- [ ] Ensure exit returns to `/` cleanly and restores ambient audio

### Phase 5 — Polish and verification
- [ ] Campfire particle / animated sprite in `WorldScene`
- [ ] Night-mode radial amber glow centered on campfire
- [ ] Camera bounds + map border collision tiles
- [ ] Test full cycle: home → `/game` → walk → building entry → section opens → close → NPC dialogue → exit → ambient restores
- [ ] Test mobile: virtual joystick movement + interact button
- [ ] `npm run build` — confirm no Phaser SSR errors

---

## Key Technical Notes

**No Phaser SSR issues** — dynamic import inside `useEffect`, never top-level. Guard with `if (typeof window === "undefined") return`.

**Game is not a modal** — do not reintroduce a fixed overlay mounted on top of the home page. The Game view should be a separate route and screen.

**Ambient audio** — `pauseAllAmbient` dispatches `ambient:pause`. `AmbientPlayer` fades Howl instances to `0` without calling `setAmbientVolume`, so saved prefs stay intact. `resumeAllAmbient` uses event detail to restore current saved volumes.

**Section panels stay inside `/game`** — opening a building should not navigate away from `/game`; it should mount React content inside the Game screen.

**WorldScene can run without assets** — if tilemap or sprites are missing, fall back to procedural Graphics so the route and bridge can still be tested.

**BGM ducking** — do not pause the whole scene when a section opens. Pause world physics and controls, then lower BGM volume.

---

## Codebase Quick Reference

| File | Role |
|---|---|
| `context/AudioContext.tsx` | Audio prefs, SFX, and ambient control functions |
| `components/ui/AmbientPlayer.tsx` | Howler-based looping ambient tracks |
| `app/layout.tsx` | Root providers and global UI |
| `components/HeroSection.tsx` | Home CTA area; add Game entry here |
| `app/game/page.tsx` | Dedicated Game route entry |
| `components/game/GameScreen.tsx` | Full-screen route shell for `/game` |
| `@/*` alias | Maps to project root |
