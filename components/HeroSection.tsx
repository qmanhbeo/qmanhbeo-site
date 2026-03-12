"use client"

import Link from "next/link"
import { useState } from "react"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

export default function HeroSection() {
  const [isLetterOverlayOpen, setIsLetterOverlayOpen] = useState(false)

  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0" />
      <div className="relative z-10 text-center px-8 max-w-4xl content-container">
        <div className="flickering mb-8">
          <div className="w-16 h-20 mx-auto bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-t-full relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-t-full opacity-80"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-400 to-yellow-100 rounded-t-full opacity-60"></div>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-orange-100 font-cinzel">Nguyen Quang Manh</h1>
        <p className="text-xl md:text-2xl mb-8 text-orange-200 max-w-2xl mx-auto leading-relaxed font-garamond italic">
          By this fire I keep notes on reinforcement learning, agent-based worlds, sustainability, and the quiet craft
          of building systems that help people make fairer decisions under real constraints.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/library" className="medieval-button text-orange-100 font-semibold px-8 py-3 rounded-lg font-garamond">
            Enter the Archive
          </Link>
          <LetterScrollTrigger
            isOpen={isLetterOverlayOpen}
            onOpen={() => setIsLetterOverlayOpen(true)}
            label="Send a Letter"
            helperText="Open the scroll and write by firelight."
            variant="compact"
          />
        </div>
      </div>

      <LetterOverlay isOpen={isLetterOverlayOpen} onClose={() => setIsLetterOverlayOpen(false)} />
    </section>
  )
}
