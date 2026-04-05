# Atmosphere Upgrade — Design Spec
**Date:** 2026-04-05  
**Status:** Approved

## Overview

Add ambient audio, subtle site-wide sound effects, and a dark/light theme toggle to deepen the medieval atmosphere of the site. Built for personal enjoyment, not for any external audience. Nothing autoplays; all features are user-toggled and remembered across visits.

---

## 1. Audio System

### Stack
- **Howler.js** (`npm install howler`) for playback, looping, fading, and iOS audio unlock
- **CC0-licensed audio files** sourced from freesound.org, served from `/public/sounds/`

### Sound files
| File | Use | Notes |
|------|-----|-------|
| `fire.ogg` | Ambient — fire crackling loop | For item pages |
| `rain.ogg` | Ambient — rain loop | For item pages |
| `music.ogg` | Ambient — soft medieval music loop | For item pages |
| `click.ogg` | SFX — button clicks | Very low volume |
| `transition.ogg` | SFX — section/carousel changes | Barely noticeable |

### AudioContext
- `context/AudioContext.tsx` — React context wrapping the entire app
- Provides: `sfxEnabled`, `ambientVolumes` (fire/rain/music 0–1), `toggleSfx()`, `setAmbientVolume(track, value)`
- `hooks/useAudio.ts` — thin Howler.js wrapper handling load, play, pause, loop, fadeIn/fadeOut
- State persisted to `localStorage` under key `audio:prefs`

### iOS / Autoplay policy
Howler.js requires a user gesture before any audio plays. The AmbientPlayer's first tap on the pill serves as the unlock event. No audio plays on page load under any circumstance.

---

## 2. Ambient Player (item pages only)

Mounted inside `app/item/[slug]/ItemPageContent.tsx`.

### Default state — collapsed pill
```
🔥 Ambience ▶
```
Positioned: `fixed bottom-4 right-4`, subtle border, very low z-index (below overlays).

### Expanded state — on pill click
A small panel slides up from the pill showing three track rows:
- 🔥 Fire — slider (0–100%)
- 🌧 Rain — slider (0–100%)
- 🎵 Music — slider (0–100%)

Clicking the pill again (or an ✕ button) collapses back to pill. Playing state and volumes persisted to localStorage.

### Behavior
- Fade in over 1s when a track starts; fade out over 1s when stopped
- Tracks are independent — user can mix fire + rain with no music, etc.
- `🔥` icon in pill pulses subtly when any track is playing (CSS animation, no JS)

---

## 3. Subtle SFX (site-wide)

Volume kept extremely low — felt not heard. All SFX use `click.ogg` or `transition.ogg`.

| Trigger | Sound | Component |
|---------|-------|-----------|
| `medieval-button` click | `click.ogg` | Any button with `.medieval-button` class |
| Section transition | `transition.ogg` | `ScrollContainer.tsx` |
| Carousel swipe/nav | `transition.ogg` at 30% volume | `InfiniteCarousel.tsx`, `MobileSnapCarousel.tsx` |

SFX fire only when `sfxEnabled` is true in AudioContext. Default: enabled. Toggle: a `🔊/🔇` icon in WandererTrail, placed next to the moon/sun theme toggle (same thin divider separating them from nav icons).

---

## 4. Dark/Light Theme Toggle

### Toggle placement
Moon/sun icon added to `WandererTrail.tsx`, separated from the nav icons by a thin divider. Tapping cycles dark → light → dark.

### Implementation
- `hooks/useTheme.ts` — reads/writes `data-theme` attribute on `<html>`, persists to `localStorage` under key `theme:pref`
- Default: `dark`
- Inline `<script>` injected in `app/layout.tsx` before any React hydration to set `data-theme` from localStorage — prevents flash of wrong theme

### Light mode palette (parchment)
Defined as CSS variable overrides in `globals.css` under `[data-theme="light"]`:

| Variable | Dark | Light |
|----------|------|-------|
| `--bg-primary` | `#0d0705` | `#f5ead8` |
| `--text-primary` | `#f5e6c8` | `#3d2b1a` |
| `--text-secondary` | `#c8a97e` | `#9a6a3a` |
| `--border-accent` | `#7c4a1e` | `#c8a97e` |
| Firelight overlays | full opacity | reduced to 15% |

The warm parchment palette maintains the medieval character in daylight — amber tones, brown text, subtle accents.

---

## 5. Files Changed

### New
- `context/AudioContext.tsx`
- `hooks/useAudio.ts`
- `hooks/useTheme.ts`
- `components/ui/AmbientPlayer.tsx`
- `public/sounds/fire.ogg`
- `public/sounds/rain.ogg`
- `public/sounds/music.ogg`
- `public/sounds/click.ogg`
- `public/sounds/transition.ogg`

### Modified
- `app/layout.tsx` — add `AudioProvider`, theme-init script, Howler.js script tag
- `components/WandererTrail.tsx` — add moon/sun theme toggle icon
- `components/ScrollContainer.tsx` — fire `transition.ogg` SFX on section change
- `components/ui/InfiniteCarousel.tsx` — fire `transition.ogg` SFX on item change
- `components/ui/MobileSnapCarousel.tsx` — fire `transition.ogg` SFX on snap
- `app/item/[slug]/ItemPageContent.tsx` — mount `<AmbientPlayer />`
- `globals.css` — add `[data-theme="light"]` CSS variable block

---

## Out of Scope

- Content updates (filling in placeholder entries) — user's own writing task, not a code task
- Any visual changes to item page layout — user confirmed it is visually perfect
- Autoplay or non-user-initiated audio of any kind
