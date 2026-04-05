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
  }, [src, loop]) // volume intentionally omitted — see separate effect below

  // Sync volume changes without recreating the Howl instance
  useEffect(() => {
    howlRef.current?.volume(volume)
  }, [volume])

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
    setTimeout(() => {
      h.stop()
      onDone?.()
    }, ms)
  }, [])

  const setVolume = useCallback((v: number) => {
    howlRef.current?.volume(v)
  }, [])

  const isPlaying = useCallback(() => {
    return howlRef.current?.playing() ?? false
  }, [])

  return { play, pause, fadeIn, fadeOut, setVolume, isPlaying }
}
