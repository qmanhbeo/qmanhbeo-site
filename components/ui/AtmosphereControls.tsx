"use client"

import { useTheme } from "@/hooks/useTheme"
import { useAudioContext } from "@/context/AudioContext"

export default function AtmosphereControls() {
  const { theme, toggleTheme } = useTheme()
  const { sfxEnabled, toggleSfx } = useAudioContext()

  return (
    <div className="fixed top-3 right-3 z-[80] flex items-center gap-1">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-8 w-8 items-center justify-center rounded-full text-base opacity-50 transition-opacity hover:opacity-90"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Light mode" : "Dark mode"}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>
      <button
        type="button"
        onClick={toggleSfx}
        className="flex h-8 w-8 items-center justify-center rounded-full text-base opacity-50 transition-opacity hover:opacity-90"
        aria-label={sfxEnabled ? "Mute sounds" : "Unmute sounds"}
        title={sfxEnabled ? "Mute SFX" : "Unmute SFX"}
      >
        {sfxEnabled ? "🔊" : "🔇"}
      </button>
    </div>
  )
}
