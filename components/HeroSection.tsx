"use client"

import { useState } from "react"
import ArchiveCodexButton from "./ui/ArchiveCodexButton"
import ArchiveCodexOverlay from "./ui/ArchiveCodexOverlay"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

interface HeroSectionProps {
  revealClassName?: string
}

export default function HeroSection({ revealClassName = "" }: HeroSectionProps) {
  const [isArchiveOverlayOpen, setIsArchiveOverlayOpen] = useState(false)
  const [isLetterOverlayOpen, setIsLetterOverlayOpen] = useState(false)

  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0" />
      <div className={`${revealClassName} relative z-10 w-full max-w-6xl text-center px-8 content-container`}>
        <div className="flickering mb-8">
          <div className="w-16 h-20 mx-auto bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-t-full relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-t-full opacity-80"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-400 to-yellow-100 rounded-t-full opacity-60"></div>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-orange-100 font-cinzel">Leonardo Manh Nguyen</h1>
        <p className="text-xl md:text-2xl mb-8 text-orange-200 max-w-2xl mx-auto leading-relaxed font-garamond italic">
          By this fire are notes on reinforcement learning, agent-based worlds, sustainability, and the quiet craft
          of building systems that help people make fairer decisions under real constraints.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="w-full max-w-[27rem] shrink-0">
            <ArchiveCodexButton
              isOpen={isArchiveOverlayOpen}
              onOpen={() => setIsArchiveOverlayOpen(true)}
              className="max-w-none"
            />
          </div>

          <div className="w-full max-w-md shrink-0">
            <LetterScrollTrigger
              isOpen={isLetterOverlayOpen}
              onOpen={() => setIsLetterOverlayOpen(true)}
              label="Send a Letter"
              helperText="Open the scroll and write by firelight."
              variant="compact"
            />
          </div>
        </div>
      </div>

      <ArchiveCodexOverlay isOpen={isArchiveOverlayOpen} onClose={() => setIsArchiveOverlayOpen(false)} />
      <LetterOverlay isOpen={isLetterOverlayOpen} onClose={() => setIsLetterOverlayOpen(false)} />
    </section>
  )
}
