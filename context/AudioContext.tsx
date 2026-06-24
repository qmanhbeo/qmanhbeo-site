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
  playSfx: (type: "click" | "transition" | "open" | "flip") => void
  stopSfx: (type: string) => void
  playBardMusic: () => void
  stopBardMusic: () => void
  stopBardMusicImmediate: () => void
  pauseAllAmbient: () => void
  resumeAllAmbient: () => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

const STORAGE_KEY = "audio:prefs"

function loadPrefs(): { sfxEnabled: boolean; ambientVolumes: AmbientVolumes } {
  const defaults = { sfxEnabled: true, ambientVolumes: { fire: 0, rain: 0, music: 0 } }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    return {
      sfxEnabled: typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : defaults.sfxEnabled,
      ambientVolumes: {
        fire:  typeof parsed.ambientVolumes?.fire  === "number" ? parsed.ambientVolumes.fire  : 0,
        rain:  typeof parsed.ambientVolumes?.rain  === "number" ? parsed.ambientVolumes.rain  : 0,
        music: typeof parsed.ambientVolumes?.music === "number" ? parsed.ambientVolumes.music : 0,
      },
    }
  } catch { return defaults }
}

function savePrefs(prefs: { sfxEnabled: boolean; ambientVolumes: AmbientVolumes }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)) } catch { /* noop */ }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [ambientVolumes, setAmbientVolumesState] = useState<AmbientVolumes>({ fire: 0, rain: 0, music: 0 })
  const sfxHowlsRef = useRef<Record<string, Howl>>({})
  const luteHowlRef = useRef<Howl | null>(null)
  const ambientVolumesRef = useRef(ambientVolumes)

  useEffect(() => {
    ambientVolumesRef.current = ambientVolumes
  }, [ambientVolumes])

  // Load persisted prefs on mount
  useEffect(() => {
    const prefs = loadPrefs()
    setSfxEnabled(prefs.sfxEnabled)
    setAmbientVolumesState(prefs.ambientVolumes)
  }, [])

  // Preload SFX Howl instances
  useEffect(() => {
    let cancelled = false
    import("howler").then(({ Howl }) => {
      if (cancelled) return
      sfxHowlsRef.current.click = new Howl({ src: ["/sounds/wood-knock-click.wav"], volume: 0.08, html5: false })
      sfxHowlsRef.current.transition = new Howl({ src: ["/sounds/page-turn.wav"], volume: 0.06, html5: false })
      sfxHowlsRef.current.open = new Howl({ src: ["/sounds/book-open.wav"], volume: 0.15, html5: false })
      sfxHowlsRef.current.flip = new Howl({ src: ["/sounds/page-turn-heavy.mp3"], volume: 0.12, html5: false })
      sfxHowlsRef.current["tung-tung-sahur"] = new Howl({ src: ["/game/characters/tungtung/tung-tung-sahur.mp3"], volume: 0.5, html5: true })
      sfxHowlsRef.current.hachimi = new Howl({ src: ["/game/characters/hachimi-sheet/hachimi.mp3"], volume: 0.5, html5: true })
      luteHowlRef.current = new Howl({ src: ["/sounds/lute-loop.wav"], volume: 0.3, loop: true, html5: true })
    })
    return () => {
      cancelled = true
      Object.values(sfxHowlsRef.current).forEach((h) => h.unload())
      sfxHowlsRef.current = {}
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

  const playSfx = useCallback((type: "click" | "transition" | "open" | "flip") => {
    if (!sfxEnabled) return
    sfxHowlsRef.current[type]?.play()
  }, [sfxEnabled])

  const stopSfx = useCallback((type: string) => {
    sfxHowlsRef.current[type]?.stop()
  }, [])

  const playBardMusic = useCallback(() => {
    const howl = luteHowlRef.current
    if (!howl) return
    howl.volume(0)
    howl.play()
    howl.once("play", () => {
      howl.fade(0, 0.3, 1500)
    })
  }, [])

  const stopBardMusic = useCallback(() => {
    const howl = luteHowlRef.current
    if (!howl) return
    howl.fade(0.3, 0, 1000)
    howl.once("fade", () => howl.stop())
  }, [])

  const stopBardMusicImmediate = useCallback(() => {
    luteHowlRef.current?.stop()
  }, [])

  const pauseAllAmbient = useCallback(() => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("ambient:pause"))
  }, [])

  const resumeAllAmbient = useCallback(() => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("ambient:resume", {
      detail: { ambientVolumes: ambientVolumesRef.current },
    }))
  }, [])

  return (
    <AudioContext.Provider
      value={{
        sfxEnabled,
        toggleSfx,
        ambientVolumes,
        setAmbientVolume,
        playSfx,
        stopSfx,
        playBardMusic,
        stopBardMusic,
        stopBardMusicImmediate,
        pauseAllAmbient,
        resumeAllAmbient,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error("useAudioContext must be used inside AudioProvider")
  return ctx
}
