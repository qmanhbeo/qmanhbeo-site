"use client"

import { useEffect, useRef, useState } from "react"
import {
  clearCodexOriginSection,
  readCodexOriginSection,
  readLastExploredSection,
  readPendingReturnState,
  saveCodexOriginSection,
  saveReturnSection,
} from "@/utils/entryNavigation"
import ArchiveCodexButton from "./ui/ArchiveCodexButton"
import ArchiveCodexOverlay from "./ui/ArchiveCodexOverlay"
import LetterOverlay from "./ui/LetterOverlay"
import LetterScrollTrigger from "./ui/LetterScrollTrigger"

interface HeroSectionProps {
  revealClassName?: string
}

const ARCHIVE_CLOSE_RESTORE_MS = 620

export default function HeroSection({ revealClassName = "" }: HeroSectionProps) {
  const [isArchiveOverlayOpen, setIsArchiveOverlayOpen] = useState(() => {
    const pendingReturnState = readPendingReturnState("/")
    return pendingReturnState?.sourceSection === "archive" && pendingReturnState.codexWasOpen === true
  })
  const [isLetterOverlayOpen, setIsLetterOverlayOpen] = useState(false)
  const restoreTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current)
      }
    }
  }, [])

  const handleArchiveOpen = () => {
    const originSection = readLastExploredSection()
    saveCodexOriginSection(originSection)
    setIsArchiveOverlayOpen(true)
  }

  const handleArchiveClose = () => {
    setIsArchiveOverlayOpen(false)

    if (restoreTimerRef.current !== null) {
      window.clearTimeout(restoreTimerRef.current)
      restoreTimerRef.current = null
    }

    const originSection = readCodexOriginSection()
    if (originSection <= 0) {
      clearCodexOriginSection()
      return
    }

    restoreTimerRef.current = window.setTimeout(() => {
      saveReturnSection(originSection)
      window.dispatchEvent(new CustomEvent("site:navigate-to-section", { detail: { sectionIndex: originSection } }))
      clearCodexOriginSection()
      restoreTimerRef.current = null
    }, ARCHIVE_CLOSE_RESTORE_MS)
  }

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
          By this fire are notes on reinforcement learning, agent-based worlds, sustainability, and the quiet craft
          of building systems that help people make fairer decisions under real constraints.
        </p>

        <div className="relative isolate flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="w-full max-w-[27rem] shrink-0">
            <ArchiveCodexButton
              isOpen={isArchiveOverlayOpen}
              onOpen={handleArchiveOpen}
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

      <ArchiveCodexOverlay isOpen={isArchiveOverlayOpen} onClose={handleArchiveClose} />
      <LetterOverlay isOpen={isLetterOverlayOpen} onClose={() => setIsLetterOverlayOpen(false)} />
    </section>
  )
}
