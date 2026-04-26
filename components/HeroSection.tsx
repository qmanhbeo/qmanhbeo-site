"use client"

import { useState } from "react"
import { readPendingReturnState } from "@/utils/entryNavigation"
import { useAudioContext } from "@/context/AudioContext"
import { useWorld } from "@/context/WorldContext"
import ArchiveCodexButton from "./ui/ArchiveCodexButton"
import ArchiveCodexOverlay from "./ui/ArchiveCodexOverlay"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

interface HeroSectionProps {
  revealClassName?: string
}

export default function HeroSection({ revealClassName = "" }: HeroSectionProps) {
  const [isArchiveOverlayOpen, setIsArchiveOverlayOpen] = useState(() => {
    const pendingReturnState = readPendingReturnState("/")
    return pendingReturnState?.sourceSection === "archive" && pendingReturnState.codexWasOpen === true
  })
  const [isLetterOverlayOpen, setIsLetterOverlayOpen] = useState(false)
  const { playSfx } = useAudioContext()
  const { openWorld } = useWorld()

  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="hero-firelight absolute inset-0" />
      <div className={`${revealClassName} hero-content-container relative z-10 w-full max-w-6xl text-center px-4 sm:px-8 content-container`}>
        <div className="flickering mb-2 sm:mb-8">
          <div className="w-12 h-16 sm:w-16 sm:h-20 mx-auto bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-t-full relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-10 sm:w-8 sm:h-12 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-t-full opacity-80"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-6 sm:w-4 sm:h-8 bg-gradient-to-t from-orange-400 to-yellow-100 rounded-t-full opacity-60"></div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 text-orange-100 font-cinzel">Leonardo Manh Nguyen</h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-8 text-orange-200 max-w-2xl mx-auto leading-relaxed font-garamond italic">
          By this fire are passing thoughts and experiments, on AI, people, and the systems that decide who
          gets what.
        </p>

        <div className="relative isolate flex flex-col items-center justify-center gap-6">
          {/* Top row - Archive Codex + Letter side by side on md+ */}
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <ArchiveCodexButton
              isOpen={isArchiveOverlayOpen}
              onOpen={() => { playSfx("open"); setIsArchiveOverlayOpen(true) }}
            />

            <LetterScrollTrigger
              isOpen={isLetterOverlayOpen}
              onOpen={() => { playSfx("open"); setIsLetterOverlayOpen(true) }}
              label="Send a Letter"
              helperText="Open the scroll and write by firelight."
              variant="compact"
            />
          </div>

          {/* Bottom row - Enter the World centered */}
          <button
            type="button"
            onClick={() => {
              playSfx("open")
              openWorld()
            }}
            className="group relative overflow-hidden rounded-full border border-amber-500/40 bg-[linear-gradient(155deg,#2b150d_0%,#6d3516_58%,#c06b1f_100%)] px-8 py-4 text-center shadow-[0_22px_55px_rgba(40,17,6,0.32)] transition duration-300 hover:scale-[1.02] hover:border-amber-300/65 hover:shadow-[0_28px_70px_rgba(40,17,6,0.45)]"
            aria-label="Enter the World"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,214,145,0.28),_transparent_38%)] opacity-80 transition duration-300 group-hover:opacity-100" />
            <span className="relative font-cinzel text-xl font-semibold text-amber-50 sm:text-2xl">
              Enter the World
            </span>
          </button>
        </div>
      </div>

      <ArchiveCodexOverlay isOpen={isArchiveOverlayOpen} onClose={() => setIsArchiveOverlayOpen(false)} />
      <LetterOverlay isOpen={isLetterOverlayOpen} onClose={() => setIsLetterOverlayOpen(false)} />
    </section>
  )
}
