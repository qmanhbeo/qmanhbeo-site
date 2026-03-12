"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import LetterComposer from "./LetterComposer"

interface LetterOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function LetterOverlay({ isOpen, onClose }: LetterOverlayProps) {
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalOverscrollBehavior = document.body.style.overscrollBehavior
    const originalOverlayLock = document.body.dataset.overlayLock

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300"
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

        <div className="mb-4 px-4 text-center">
          <h3 id="letter-overlay-title" className="map-sky-ink-strong font-cinzel text-4xl font-bold md:text-5xl">
            Write Me a Letter
          </h3>
          <p className="map-sky-ink mx-auto mt-3 max-w-2xl font-garamond text-lg italic">
            Unfurl the scroll and send word across the night.
          </p>
        </div>

        <div className="scrollable-content max-h-[calc(100vh-8rem)] overflow-y-auto">
          <LetterComposer />
        </div>
      </div>
    </div>
  )
}
