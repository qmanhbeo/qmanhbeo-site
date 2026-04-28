"use client"

import { useEffect, useState } from "react"
import { useAudioContext } from "@/context/AudioContext"
import type { SectionSurface } from "@/utils/worldSections"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

interface LetterSectionProps {
  revealClassName?: string
  surface?: SectionSurface
}

export default function LetterSection({
  revealClassName = "",
  surface = "home",
}: LetterSectionProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const { playSfx } = useAudioContext()
  const isWorldPanel = surface === "world-panel"

  useEffect(() => {
    if (!isWorldPanel || !isComposerOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopPropagation()
      setIsComposerOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true })
  }, [isComposerOpen, isWorldPanel])

  return (
    <section
      className={
        isWorldPanel
          ? "relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden"
          : "section-safe-area relative flex h-full min-w-full items-center justify-center overflow-hidden"
      }
      style={isWorldPanel ? undefined : { scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-60" />
      <div
        className={`${revealClassName} relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-4 ${isWorldPanel ? "py-5 sm:px-6" : "content-container sm:px-8"}`}
      >
        <div className={`text-center ${isWorldPanel ? "mb-5" : "mb-6 md:mb-16"}`}>
          <p className="mx-auto max-w-xl font-garamond text-[1rem] italic leading-snug text-orange-200 sm:text-lg md:max-w-2xl md:text-xl md:leading-normal">
            If something in these pages speaks to your own work, send word across the night and He shall write back
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <LetterScrollTrigger
            isOpen={isComposerOpen}
            onOpen={() => {
              playSfx("open")
              setIsComposerOpen(true)
            }}
            label="Write Leo a Letter"
            variant={isWorldPanel ? "compact" : "full"}
          />
        </div>

        <div className={`text-center ${isWorldPanel ? "mt-5" : "mt-7 md:mt-16"}`}>
          <p className="font-garamond text-[1rem] italic leading-snug text-orange-300/70 md:text-xl md:leading-relaxed">
            The fire is patient. The night is long.
          </p>
          <p className="font-garamond text-[1rem] italic leading-snug text-orange-300/50 md:text-xl md:leading-relaxed">
            Write whatever the pages stirred in you.
          </p>
        </div>
      </div>

      <LetterOverlay isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
    </section>
  )
}
