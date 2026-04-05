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

const FADE_MS = 400

export default function AmbientPlayer() {
  const { ambientVolumes, setAmbientVolume } = useAudioContext()
  const [expanded, setExpanded] = useState(false)
  const howlsRef = useRef<Partial<Record<Track, Howl>>>({})
  // Mirror of ambientVolumes for access inside async callbacks
  const ambientVolumesRef = useRef(ambientVolumes)
  useEffect(() => { ambientVolumesRef.current = ambientVolumes }, [ambientVolumes])

  // Load Howl instances on mount, apply any persisted volumes immediately
  useEffect(() => {
    let cancelled = false
    import("howler").then(({ Howl }) => {
      if (cancelled) return
      const vols = ambientVolumesRef.current
      for (const t of TRACK_META) {
        const h = new Howl({ src: [t.src], loop: true, volume: 0, html5: true })
        howlsRef.current[t.key] = h
        if (vols[t.key] > 0) {
          h.play()
          h.fade(0, vols[t.key], FADE_MS)
        }
      }
    })
    return () => {
      cancelled = true
      Object.values(howlsRef.current).forEach((h) => { h?.stop(); h?.unload() })
      howlsRef.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync volume changes to Howl instances
  useEffect(() => {
    const timerIds: ReturnType<typeof setTimeout>[] = []
    for (const t of TRACK_META) {
      const h = howlsRef.current[t.key]
      if (!h) continue
      const v = ambientVolumes[t.key]
      if (v > 0) {
        if (!h.playing()) {
          h.volume(0)
          h.play()
          h.fade(0, v, FADE_MS)
        } else {
          h.volume(v)
        }
      } else {
        if (h.playing()) h.fade(h.volume(), 0, FADE_MS)
        const key = t.key
        const id = setTimeout(() => { howlsRef.current[key]?.stop() }, FADE_MS + 20)
        timerIds.push(id)
      }
    }
    return () => { timerIds.forEach(clearTimeout) }
  }, [ambientVolumes])

  const isAnyPlaying = Object.values(ambientVolumes).some((v) => v > 0)

  const handlePillClick = useCallback(() => {
    if (!expanded && !isAnyPlaying) {
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
              type="button"
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
        type="button"
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
