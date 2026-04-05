# Atmosphere Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ambient audio (fire/rain/music), subtle site-wide SFX, and a dark/light parchment theme toggle to the medieval personal site.

**Architecture:** A React `AudioContext` wraps the app and manages Howler.js instances for both ambient loops and one-shot SFX. A `useTheme` hook toggles `data-theme="light"` on `<html>` and persists to `localStorage`. WandererTrail gains a moon/sun and a speaker icon. A floating `AmbientPlayer` pill mounts only on item pages.

**Tech Stack:** Next.js App Router, Howler.js, Tailwind CSS, CSS custom properties

---

## Task 1: Install Howler.js

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install Howler.js**

```bash
cd /home/manh/qmanhbeo-site
npm install howler
npm install --save-dev @types/howler
```

- [ ] **Step 2: Verify install**

```bash
node -e "require('howler'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add howler.js for audio playback"
```

---

## Task 2: Source CC0 audio files

**Files:**
- Create: `public/sounds/` directory with 5 audio files

The sounds must be CC0-licensed OGG files. Download them from freesound.org. Search with license filter set to "Creative Commons 0."

| File | Search term on freesound.org | Characteristics |
|------|------------------------------|-----------------|
| `fire.ogg` | "fireplace crackling loop" | Seamless loop, 30–120s, no pops |
| `rain.ogg` | "rain ambience loop" | Steady rain, seamless loop |
| `music.ogg` | "medieval lute ambient loop" or "medieval music loop" | Soft, no vocals, 60–180s loop |
| `click.ogg` | "wood tap" or "soft click" | Very short (<0.5s), subtle |
| `transition.ogg` | "paper whoosh" or "soft whoosh" | Short (<1s), gentle |

- [ ] **Step 1: Download sounds and convert to OGG**

For each file downloaded as MP3 or WAV, convert and compress:

```bash
mkdir -p /home/manh/qmanhbeo-site/public/sounds

# Convert (adjust input filename as downloaded):
ffmpeg -i ~/Downloads/fire-crackling.wav -c:a libvorbis -q:a 3 /home/manh/qmanhbeo-site/public/sounds/fire.ogg
ffmpeg -i ~/Downloads/rain-ambience.wav  -c:a libvorbis -q:a 3 /home/manh/qmanhbeo-site/public/sounds/rain.ogg
ffmpeg -i ~/Downloads/medieval-music.mp3 -c:a libvorbis -q:a 3 /home/manh/qmanhbeo-site/public/sounds/music.ogg
ffmpeg -i ~/Downloads/wood-tap.wav       -c:a libvorbis -q:a 2 /home/manh/qmanhbeo-site/public/sounds/click.ogg
ffmpeg -i ~/Downloads/paper-whoosh.wav   -c:a libvorbis -q:a 2 /home/manh/qmanhbeo-site/public/sounds/transition.ogg
```

Target sizes: fire/rain/music < 2 MB each, click/transition < 100 KB each.

- [ ] **Step 2: Verify files exist**

```bash
ls -lh /home/manh/qmanhbeo-site/public/sounds/
```

Expected: 5 `.ogg` files listed.

- [ ] **Step 3: Commit**

```bash
git add public/sounds/
git commit -m "chore: add CC0 ambient and SFX audio files"
```

---

## Task 3: Create `useAudio` hook

**Files:**
- Create: `hooks/useAudio.ts`

- [ ] **Step 1: Create the file**

```typescript
// hooks/useAudio.ts
"use client"

import { useCallback, useEffect, useRef } from "react"
import type { Howl } from "howler"

interface UseAudioOptions {
  src: string
  loop?: boolean
  volume?: number
}

export function useAudio({ src, loop = false, volume = 1 }: UseAudioOptions) {
  const howlRef = useRef<Howl | null>(null)

  useEffect(() => {
    // Howler is browser-only — import dynamically to avoid SSR issues
    let cancelled = false
    import("howler").then(({ Howl }) => {
      if (cancelled) return
      howlRef.current = new Howl({ src: [src], loop, volume, html5: true })
    })
    return () => {
      cancelled = true
      howlRef.current?.unload()
      howlRef.current = null
    }
  }, [src, loop, volume])

  const play = useCallback(() => {
    howlRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    howlRef.current?.pause()
  }, [])

  const fadeIn = useCallback((ms: number) => {
    const h = howlRef.current
    if (!h) return
    h.volume(0)
    h.play()
    h.fade(0, 1, ms)
  }, [])

  const fadeOut = useCallback((ms: number, onDone?: () => void) => {
    const h = howlRef.current
    if (!h) return
    h.fade(h.volume(), 0, ms)
    if (onDone) setTimeout(onDone, ms)
  }, [])

  const setVolume = useCallback((v: number) => {
    howlRef.current?.volume(v)
  }, [])

  const isPlaying = useCallback(() => {
    return howlRef.current?.playing() ?? false
  }, [])

  return { play, pause, fadeIn, fadeOut, setVolume, isPlaying }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/manh/qmanhbeo-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `hooks/useAudio.ts`

- [ ] **Step 3: Commit**

```bash
git add hooks/useAudio.ts
git commit -m "feat: add useAudio hook wrapping Howler.js"
```

---

## Task 4: Create `AudioContext`

**Files:**
- Create: `context/AudioContext.tsx`

- [ ] **Step 1: Create the file**

```typescript
// context/AudioContext.tsx
"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { Howl } from "howler"

interface AmbientVolumes {
  fire: number
  rain: number
  music: number
}

interface AudioContextValue {
  sfxEnabled: boolean
  toggleSfx: () => void
  ambientVolumes: AmbientVolumes
  setAmbientVolume: (track: keyof AmbientVolumes, value: number) => void
  playSfx: (type: "click" | "transition") => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

const STORAGE_KEY = "audio:prefs"

function loadPrefs(): { sfxEnabled: boolean; ambientVolumes: AmbientVolumes } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* noop */ }
  return { sfxEnabled: true, ambientVolumes: { fire: 0, rain: 0, music: 0 } }
}

function savePrefs(prefs: { sfxEnabled: boolean; ambientVolumes: AmbientVolumes }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)) } catch { /* noop */ }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [ambientVolumes, setAmbientVolumesState] = useState<AmbientVolumes>({ fire: 0, rain: 0, music: 0 })
  const sfxHowlsRef = useRef<Record<string, Howl>>({})
  const unlockedRef = useRef(false)

  // Load persisted prefs on mount
  useEffect(() => {
    const prefs = loadPrefs()
    setSfxEnabled(prefs.sfxEnabled)
    setAmbientVolumesState(prefs.ambientVolumes)
  }, [])

  // Preload SFX Howl instances
  useEffect(() => {
    import("howler").then(({ Howl }) => {
      sfxHowlsRef.current.click = new Howl({ src: ["/sounds/click.ogg"], volume: 0.08, html5: false })
      sfxHowlsRef.current.transition = new Howl({ src: ["/sounds/transition.ogg"], volume: 0.06, html5: false })
    })
    return () => {
      Object.values(sfxHowlsRef.current).forEach((h) => h.unload())
    }
  }, [])

  // Global click listener for .medieval-button SFX
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!sfxEnabled) return
      const target = e.target as Element | null
      if (target?.closest(".medieval-button")) {
        sfxHowlsRef.current.click?.play()
      }
    }
    document.addEventListener("click", handler, { capture: true })
    return () => document.removeEventListener("click", handler, { capture: true })
  }, [sfxEnabled])

  const toggleSfx = useCallback(() => {
    setSfxEnabled((prev) => {
      const next = !prev
      savePrefs({ sfxEnabled: next, ambientVolumes })
      return next
    })
  }, [ambientVolumes])

  const setAmbientVolume = useCallback((track: keyof AmbientVolumes, value: number) => {
    setAmbientVolumesState((prev) => {
      const next = { ...prev, [track]: value }
      savePrefs({ sfxEnabled, ambientVolumes: next })
      return next
    })
  }, [sfxEnabled])

  const playSfx = useCallback((type: "click" | "transition") => {
    if (!sfxEnabled) return
    sfxHowlsRef.current[type]?.play()
  }, [sfxEnabled])

  return (
    <AudioContext.Provider value={{ sfxEnabled, toggleSfx, ambientVolumes, setAmbientVolume, playSfx }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error("useAudioContext must be used inside AudioProvider")
  return ctx
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/manh/qmanhbeo-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add context/AudioContext.tsx
git commit -m "feat: add AudioContext with SFX and ambient volume management"
```

---

## Task 5: Wrap app in `AudioProvider`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update layout.tsx**

Replace the current `layout.tsx` content with:

```typescript
// app/layout.tsx
import type React from "react"
import type { Metadata, Viewport } from "next"
import { EB_Garamond, Cinzel } from "next/font/google"
import tabIcon from "@/img/tab-icon.png"
import { AudioProvider } from "@/context/AudioContext"
import "./globals.css"

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a0a00",
}

export const metadata: Metadata = {
  title: "Manh's Cozy Corner",
  description: "A medieval-inspired personal website",
  icons: {
    icon: tabIcon.src,
    shortcut: tabIcon.src,
  },
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme:pref');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${ebGaramond.variable} ${cinzel.variable} antialiased`}>
        <AudioProvider>
          {children}
          {modal}
        </AudioProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify dev server starts**

```bash
cd /home/manh/qmanhbeo-site && npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app in AudioProvider and add theme-init script"
```

---

## Task 6: Wire SFX to section transitions and carousel swipes

**Files:**
- Modify: `components/ScrollContainer.tsx`
- Modify: `components/ui/InfiniteCarousel.tsx`
- Modify: `components/ui/MobileSnapCarousel.tsx`

- [ ] **Step 1: Add transition SFX to ScrollContainer**

In `components/ScrollContainer.tsx`, add the import and hook call at the top of the component, then call `playSfx("transition")` inside `scrollToSection` just before `container.scrollTo(...)`:

At the top of `ScrollContainer.tsx`, after existing imports add:
```typescript
import { useAudioContext } from "@/context/AudioContext"
```

Inside the `ScrollContainer` function body, after the existing state declarations add:
```typescript
const { playSfx } = useAudioContext()
```

Inside `scrollToSection`, find this line:
```typescript
      container.scrollTo({
        left: index * container.clientWidth,
        behavior: "smooth",
      })
```
And add `playSfx("transition")` on the line immediately before it:
```typescript
      playSfx("transition")
      container.scrollTo({
        left: index * container.clientWidth,
        behavior: "smooth",
      })
```

- [ ] **Step 2: Add transition SFX to InfiniteCarousel**

In `components/ui/InfiniteCarousel.tsx`, the `onActiveIndexChange` callback fires when the snapped item changes. Wrap it to also play a SFX.

Add import at top of file:
```typescript
import { useAudioContext } from "@/context/AudioContext"
```

Inside the `InfiniteCarousel` function body, after the first `useEffect` add:
```typescript
const { playSfx } = useAudioContext()
```

Find the `onActiveIndexChangeRef.current?.(index)` call in the file (it's inside the RAF tick function) and add the SFX call immediately before it:
```typescript
playSfx("transition")
onActiveIndexChangeRef.current?.(index)
```

- [ ] **Step 3: Add transition SFX to MobileSnapCarousel**

In `components/ui/MobileSnapCarousel.tsx`, `onActiveIndexChange` is called in a scroll handler.

Add import at top of file:
```typescript
import { useAudioContext } from "@/context/AudioContext"
```

Inside the `MobileSnapCarousel` function body add:
```typescript
const { playSfx } = useAudioContext()
```

Find `onActiveIndexChangeRef.current?.(logicalIndex)` in the file and add immediately before it:
```typescript
playSfx("transition")
onActiveIndexChangeRef.current?.(logicalIndex)
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/manh/qmanhbeo-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/ScrollContainer.tsx components/ui/InfiniteCarousel.tsx components/ui/MobileSnapCarousel.tsx
git commit -m "feat: add subtle SFX on section transitions and carousel swipes"
```

---

## Task 7: Build `AmbientPlayer` component

**Files:**
- Create: `components/ui/AmbientPlayer.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/ui/AmbientPlayer.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Howl } from "howler"
import { useAudioContext } from "@/context/AudioContext"

type Track = "fire" | "rain" | "music"

const TRACK_META: { key: Track; emoji: string; label: string; src: string }[] = [
  { key: "fire",  emoji: "🔥", label: "Fire",  src: "/sounds/fire.ogg"  },
  { key: "rain",  emoji: "🌧", label: "Rain",  src: "/sounds/rain.ogg"  },
  { key: "music", emoji: "🎵", label: "Music", src: "/sounds/music.ogg" },
]

export default function AmbientPlayer() {
  const { ambientVolumes, setAmbientVolume } = useAudioContext()
  const [expanded, setExpanded] = useState(false)
  const howlsRef = useRef<Partial<Record<Track, Howl>>>({})

  // Load Howl instances on mount
  useEffect(() => {
    let cancelled = false
    import("howler").then(({ Howl }) => {
      if (cancelled) return
      for (const t of TRACK_META) {
        howlsRef.current[t.key] = new Howl({
          src: [t.src],
          loop: true,
          volume: ambientVolumes[t.key],
          html5: true,
        })
      }
    })
    return () => {
      cancelled = true
      Object.values(howlsRef.current).forEach((h) => { h?.stop(); h?.unload() })
      howlsRef.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync volume changes to Howl instances and play/pause accordingly
  useEffect(() => {
    for (const t of TRACK_META) {
      const h = howlsRef.current[t.key]
      if (!h) continue
      const v = ambientVolumes[t.key]
      if (v > 0) {
        h.volume(v)
        if (!h.playing()) h.play()
      } else {
        if (h.playing()) h.fade(h.volume(), 0, 400)
        setTimeout(() => { if (!howlsRef.current[t.key]?.playing()) howlsRef.current[t.key]?.stop() }, 420)
      }
    }
  }, [ambientVolumes])

  const isAnyPlaying = Object.values(ambientVolumes).some((v) => v > 0)

  const handlePillClick = useCallback(() => {
    if (!expanded && !isAnyPlaying) {
      // First click: start fire at 70% and expand
      setAmbientVolume("fire", 0.7)
    }
    setExpanded((e) => !e)
  }, [expanded, isAnyPlaying, setAmbientVolume])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {expanded && (
        <div
          className="rounded-xl border border-amber-800/50 bg-[#1a0e05]/95 p-3 shadow-xl backdrop-blur-sm"
          style={{ minWidth: 160 }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-cinzel text-[10px] uppercase tracking-widest text-amber-400">Ambience</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-amber-700 hover:text-amber-400"
              aria-label="Close ambient player"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {TRACK_META.map(({ key, emoji, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm">{emoji}</span>
                <span className="flex-1 font-garamond text-[11px] text-amber-200/80">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={ambientVolumes[key]}
                  onChange={(e) => setAmbientVolume(key, parseFloat(e.target.value))}
                  className="w-16 accent-amber-600"
                  aria-label={`${label} volume`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handlePillClick}
        className={`flex items-center gap-2 rounded-full border border-amber-800/60 bg-[#1a0e05]/90 px-3 py-2 shadow-lg backdrop-blur-sm transition-all hover:border-amber-600/80 ${isAnyPlaying ? "ambient-pill-active" : ""}`}
        aria-label="Toggle ambient sounds"
      >
        <span className="text-base">🔥</span>
        <span className="font-garamond text-xs text-amber-300/90">Ambience</span>
        <span className="text-[10px] text-amber-600">{isAnyPlaying ? "▮▮" : "▶"}</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add ambient-pill-active pulse animation to globals.css**

In `app/globals.css`, at the end of the ANIMATIONS section (around line 540, after the `.suppress-home-entry-fixed-reveal` block), add:

```css
@keyframes ambient-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0); }
  50%       { box-shadow: 0 0 8px 2px rgba(255, 140, 0, 0.18); }
}
.ambient-pill-active {
  animation: ambient-pulse 2.4s ease-in-out infinite;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/manh/qmanhbeo-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/AmbientPlayer.tsx app/globals.css
git commit -m "feat: build AmbientPlayer floating pill component"
```

---

## Task 8: Mount `AmbientPlayer` on item pages

**Files:**
- Modify: `app/item/[slug]/ItemPageContent.tsx`

- [ ] **Step 1: Add import and mount**

At the top of `app/item/[slug]/ItemPageContent.tsx`, after the existing imports add:
```typescript
import AmbientPlayer from "@/components/ui/AmbientPlayer"
```

Find the outermost returned JSX element in `ItemPageContent` (the root `<div>` or fragment). Add `<AmbientPlayer />` as the last child inside it, just before the closing tag.

Look for the return statement — it will have a structure like:
```tsx
return (
  <div ...>
    ...existing content...
  </div>
)
```

Add `<AmbientPlayer />` as the last element inside that root div:
```tsx
return (
  <div ...>
    ...existing content...
    <AmbientPlayer />
  </div>
)
```

- [ ] **Step 2: Verify in browser**

```bash
cd /home/manh/qmanhbeo-site && npm run dev
```

Open `http://localhost:3000`, navigate to any item page (e.g., `/item/project-gaia`). Confirm the `🔥 Ambience ▶` pill appears at bottom-right. Click it — it should expand showing sliders and start fire audio. Click ✕ to collapse.

- [ ] **Step 3: Commit**

```bash
git add app/item/[slug]/ItemPageContent.tsx
git commit -m "feat: mount AmbientPlayer on item detail pages"
```

---

## Task 9: Create `useTheme` hook

**Files:**
- Create: `hooks/useTheme.ts`

- [ ] **Step 1: Create the file**

```typescript
// hooks/useTheme.ts
"use client"

import { useCallback, useEffect, useState } from "react"

type Theme = "dark" | "light"

const STORAGE_KEY = "theme:pref"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch { /* noop */ }
  return "dark"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") {
      root.setAttribute("data-theme", "light")
    } else {
      root.removeAttribute("data-theme")
    }
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* noop */ }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  return { theme, toggleTheme }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/manh/qmanhbeo-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useTheme.ts
git commit -m "feat: add useTheme hook for dark/light toggle with localStorage persistence"
```

---

## Task 10: Add light mode CSS

**Files:**
- Modify: `app/globals.css`

The item pages already use parchment-colored card surfaces (`.item-manuscript-surface`). Light mode primarily affects the dark body background, the main section backgrounds, and the WandererTrail nav. The strategy is: target the key structural elements without touching every component.

- [ ] **Step 1: Add light mode block to globals.css**

At the very end of `app/globals.css`, add:

```css
/* =============================================================================
   LIGHT MODE — PARCHMENT THEME
   Applied when <html data-theme="light">
   ============================================================================= */

[data-theme="light"] body {
  background-color: #f5ead8;
}

/* Page body background (behind manuscript card on item pages) */
[data-theme="light"] .min-h-screen,
[data-theme="light"] [class*="bg-\\[\\#0"] {
  background-color: #f5ead8 !important;
}

/* Darken the forest campfire sections to a daytime version */
[data-theme="light"] .forest-campfire {
  background: #e8d5b7 !important;
  background-image: none !important;
}
[data-theme="light"] .forest-campfire::before,
[data-theme="light"] .forest-campfire::after {
  display: none;
}

/* Reduce firelight overlays to near-invisible in light mode */
[data-theme="light"] .firelight,
[data-theme="light"] .hero-firelight {
  opacity: 0.08 !important;
}

/* WandererTrail nav: invert to parchment */
[data-theme="light"] .wanderer-trail-container {
  filter: invert(1) hue-rotate(175deg) saturate(0.7) brightness(0.9);
}

/* Item page outer wrapper background */
[data-theme="light"] .item-page-outer {
  background-color: #ede0c8;
}

/* Main section text: keep orange tones readable on light background */
[data-theme="light"] .text-orange-100 { color: #7a3d0f !important; }
[data-theme="light"] .text-orange-200 { color: #8a4d1f !important; }
[data-theme="light"] .text-amber-100  { color: #7a5020 !important; }
[data-theme="light"] .text-amber-200  { color: #8a6030 !important; }
```

- [ ] **Step 2: Identify the item page outer wrapper**

Open `app/item/[slug]/ItemPageContent.tsx` and find the outermost `<div>`. Add `item-page-outer` to its `className`:

```tsx
// Find the outermost div in ItemPageContent — it will look something like:
<div className="... item-page-outer">
```

The exact class list doesn't matter — just append `item-page-outer` to whatever is already there.

- [ ] **Step 3: Test light mode manually**

```bash
cd /home/manh/qmanhbeo-site && npm run dev
```

Open browser console and run:
```js
document.documentElement.setAttribute('data-theme', 'light')
```

Visually verify: background becomes warm cream, text is readable, item pages look like parchment, WandererTrail inverts to a light style.

Run to restore dark:
```js
document.documentElement.removeAttribute('data-theme')
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/item/[slug]/ItemPageContent.tsx
git commit -m "feat: add light mode parchment CSS under [data-theme='light']"
```

---

## Task 11: Add theme and SFX toggles to WandererTrail

**Files:**
- Modify: `components/WandererTrail.tsx`

- [ ] **Step 1: Add imports**

At the top of `components/WandererTrail.tsx`, add:
```typescript
import { useTheme } from "@/hooks/useTheme"
import { useAudioContext } from "@/context/AudioContext"
```

- [ ] **Step 2: Add hook calls inside the component**

Inside `WandererTrail`, after the existing state declarations, add:
```typescript
const { theme, toggleTheme } = useTheme()
const { sfxEnabled, toggleSfx } = useAudioContext()
```

- [ ] **Step 3: Add toggle buttons to the JSX**

In `WandererTrail.tsx`, find the `.trail-transparent` div (which contains `.trail-path` and `.trail-markers`). After the closing tag of `.trail-markers`, add the toggle buttons inside `.trail-transparent`:

```tsx
{/* Atmosphere controls */}
<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
  <button
    onClick={toggleTheme}
    className="flex h-7 w-7 items-center justify-center rounded-full text-base opacity-60 transition-opacity hover:opacity-100"
    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    title={theme === "dark" ? "Light mode" : "Dark mode"}
  >
    {theme === "dark" ? "🌙" : "☀️"}
  </button>
  <button
    onClick={toggleSfx}
    className="flex h-7 w-7 items-center justify-center rounded-full text-base opacity-60 transition-opacity hover:opacity-100"
    aria-label={sfxEnabled ? "Mute sounds" : "Unmute sounds"}
    title={sfxEnabled ? "Mute SFX" : "Unmute SFX"}
  >
    {sfxEnabled ? "🔊" : "🔇"}
  </button>
</div>
```

- [ ] **Step 4: Verify in browser**

```bash
cd /home/manh/qmanhbeo-site && npm run dev
```

Confirm two small icons appear on the right side of the WandererTrail bar. Clicking the moon/sun toggles the theme. Clicking the speaker icon toggles SFX on/off.

- [ ] **Step 5: Commit**

```bash
git add components/WandererTrail.tsx
git commit -m "feat: add moon/sun theme and SFX toggles to WandererTrail nav"
```

---

## Task 12: Add .superpowers to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Check if .gitignore exists and add entry**

```bash
cd /home/manh/qmanhbeo-site
echo "" >> .gitignore
echo "# Brainstorm mockups" >> .gitignore
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm directory"
```

---

## Self-Review Checklist

- [x] **Ambient audio on item pages**: Task 7 (AmbientPlayer), Task 8 (mount on item pages)
- [x] **Fire/rain/music tracks with individual volume sliders**: Task 7
- [x] **Collapsed pill default state**: Task 7 (pill shows 🔥 Ambience ▶)
- [x] **State persisted to localStorage**: Task 4 (AudioContext saves `audio:prefs`)
- [x] **Fade in/out on toggle**: Task 7 (AmbientPlayer syncs volumes with fade)
- [x] **No autoplay**: Task 7 (first click on pill starts audio, `useEffect` only syncs after user changes volume)
- [x] **SFX on medieval-button clicks**: Task 4 (global click listener in AudioProvider)
- [x] **SFX on section transitions**: Task 6 (ScrollContainer)
- [x] **SFX on carousel swipes**: Task 6 (InfiniteCarousel + MobileSnapCarousel)
- [x] **SFX volume very low**: Task 4 (click: 0.08, transition: 0.06)
- [x] **Dark/light theme toggle**: Task 9 (useTheme), Task 10 (CSS), Task 11 (WandererTrail)
- [x] **Parchment light mode palette**: Task 10 (`[data-theme="light"]` block)
- [x] **No flash of wrong theme**: Task 5 (inline script in layout.tsx head)
- [x] **Moon/sun + speaker icons in WandererTrail**: Task 11
- [x] **CC0 audio files sourced and committed**: Task 2
- [x] **Howler.js installed**: Task 1
- [x] **.superpowers in .gitignore**: Task 12
