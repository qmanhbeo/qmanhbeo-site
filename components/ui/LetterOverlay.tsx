"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import LetterComposer from "./LetterComposer"

interface LetterOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function LetterOverlay({ isOpen, onClose }: LetterOverlayProps) {
  const [isVisible, setIsVisible] = useState(isOpen)
  const [isExiting, setIsExiting] = useState(false)
  const exitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)

    if (isOpen) {
      setIsVisible(true)
      setIsExiting(false)
    } else {
      setIsExiting(true)
      exitTimerRef.current = window.setTimeout(() => {
        setIsVisible(false)
        setIsExiting(false)
      }, 320)
    }

    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isVisible) return

    const originalOverflow = document.body.style.overflow
    const originalOverscrollBehavior = document.body.style.overscrollBehavior
    const originalOverlayLock = document.body.dataset.overlayLock

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.body.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "contain"
    document.body.dataset.overlayLock = "true"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscrollBehavior
      if (originalOverlayLock) {
        document.body.dataset.overlayLock = originalOverlayLock
      } else {
        delete document.body.dataset.overlayLock
      }
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <div
        className={`absolute inset-0 bg-slate-950/75 backdrop-blur-md ${
          isExiting ? "animate-out fade-out duration-300 fill-mode-both" : "animate-in fade-in duration-300"
        }`}
      />

      <div
        className={`relative z-10 flex w-full max-w-5xl flex-col overflow-hidden h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] ${
          isExiting
            ? "animate-out fade-out zoom-out-95 duration-300 fill-mode-both"
            : "animate-in fade-in zoom-in-95 duration-300"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-overlay-title"
        onClick={(event) => event.stopPropagation()}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="medieval-button absolute right-4 top-4 z-20 rounded-full p-3 text-orange-100 transition-all duration-300 hover:ember-glow"
          aria-label="Close letter overlay"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex-shrink-0 px-4 text-center">
          <h3 id="letter-overlay-title" className="map-sky-ink-strong font-cinzel text-4xl font-bold md:text-5xl">
            Write Him a Letter
          </h3>
          <p className="map-sky-ink mx-auto mt-3 max-w-2xl font-garamond text-lg italic">
            Unfurl the scroll and send word across the night.
          </p>
        </div>

        <div className="scrollable-content scrollbar-fade min-h-0 flex-1 overflow-y-auto">
          <LetterComposer />
        </div>
      </div>
    </div>
  )
}
