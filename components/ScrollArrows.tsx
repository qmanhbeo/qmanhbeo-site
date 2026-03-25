"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface ScrollArrowsProps {
  onNavigateForward: () => void
  onNavigateBackward: () => void
}

export default function ScrollArrows({ onNavigateForward, onNavigateBackward }: ScrollArrowsProps) {
  return (
    <>
      <button
        onClick={onNavigateBackward}
        className="page-load-unblur-fixed hidden md:block fixed left-8 top-1/2 transform -translate-y-1/2 z-50 medieval-button rounded-full p-3 text-orange-100"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNavigateForward}
        className="page-load-unblur-fixed hidden md:block fixed right-20 top-1/2 transform -translate-y-1/2 z-50 medieval-button rounded-full p-3 text-orange-100"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </>
  )
}
