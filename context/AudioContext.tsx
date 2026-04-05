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
