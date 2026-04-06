"use client"

import { useState } from "react"
import { useAudioContext } from "@/context/AudioContext"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

interface LetterSectionProps {
  revealClassName?: string
}

export default function LetterSection({ revealClassName = "" }: LetterSectionProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const { playSfx } = useAudioContext()

  return (
    <section
      className="section-safe-area relative flex h-full min-w-full items-center justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-60" />
      <div className={`${revealClassName} relative z-10 px-4 sm:px-8 max-w-6xl w-full mx-auto content-container`}>
        <div className="mb-6 text-center md:mb-16">
          <h2 className="mb-3 font-cinzel text-[2.55rem] font-bold leading-tight tracking-[-0.015em] text-orange-100 sm:text-5xl md:mb-4 md:text-6xl md:tracking-normal">
            Write Him a Letter
          </h2>
          <p className="mx-auto max-w-xl font-garamond text-[1rem] italic leading-snug text-orange-200 sm:text-lg md:max-w-2xl md:text-xl md:leading-normal">
            If something in these pages speaks to your own work, send word across the night and He shall write back
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <LetterScrollTrigger isOpen={isOverlayOpen} onOpen={() => { playSfx("open"); setIsOverlayOpen(true) }} />
        </div>

        <div className="mt-7 text-center md:mt-16">
          <p className="font-garamond text-[1rem] italic leading-snug text-orange-300/70 md:text-xl md:leading-relaxed">
            The fire is patient. The night is long.
          </p>
          <p className="font-garamond text-[1rem] italic leading-snug text-orange-300/50 md:text-xl md:leading-relaxed">
            Write whatever the pages stirred in you.
          </p>
        </div>
      </div>

      <LetterOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
    </section>
  )
}
