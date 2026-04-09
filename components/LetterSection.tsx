"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useAudioContext } from "@/context/AudioContext"
import type { SectionSurface } from "@/utils/worldSections"
import LetterComposer from "./ui/LetterComposer"
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
          <h2 className="mb-3 font-cinzel text-[2.55rem] font-bold leading-tight tracking-[-0.015em] text-orange-100 sm:text-5xl md:mb-4 md:text-6xl md:tracking-normal">
            Write Him a Letter
          </h2>
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
            variant={isWorldPanel ? "compact" : "full"}
            helperText={isWorldPanel ? "Open the messenger desk without leaving the world." : undefined}
          />
        </div>

        {isWorldPanel ? (
          <div className="mt-5 min-h-0 flex-1 overflow-hidden">
            {isComposerOpen ? (
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-amber-200/15 bg-black/20 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="medieval-button absolute right-4 top-4 z-20 rounded-full p-2.5 text-orange-100 transition hover:ember-glow"
                  aria-label="Close world letter composer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
                <div className="scrollable-content scrollbar-fade h-full overflow-y-auto px-2 py-2 md:px-3">
                  <LetterComposer />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-amber-400/20 bg-black/10 px-6 text-center">
                <p className="max-w-xl font-garamond text-lg italic text-orange-300/78">
                  The messenger desk stays inside the world route. Open the scroll when you are ready to send word.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mt-7 text-center md:mt-16">
              <p className="font-garamond text-[1rem] italic leading-snug text-orange-300/70 md:text-xl md:leading-relaxed">
                The fire is patient. The night is long.
              </p>
              <p className="font-garamond text-[1rem] italic leading-snug text-orange-300/50 md:text-xl md:leading-relaxed">
                Write whatever the pages stirred in you.
              </p>
            </div>

            <LetterOverlay isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
          </>
        )}
      </div>
    </section>
  )
}
