"use client"

import { useState } from "react"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

interface LetterSectionProps {
  revealClassName?: string
}

export default function LetterSection({ revealClassName = "" }: LetterSectionProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-35" />
      <div className={`${revealClassName} relative z-10 px-8 max-w-4xl w-full content-container`}>
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-orange-100 font-cinzel">Write Him a Letter</h2>
          <p className="text-xl text-orange-200 max-w-2xl mx-auto font-garamond italic">
            If something in these pages speaks to your own work, send word across the night and He shall write back
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <LetterScrollTrigger isOpen={isOverlayOpen} onOpen={() => setIsOverlayOpen(true)} />
        </div>
      </div>

      <LetterOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
    </section>
  )
}
