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
        className="page-load-unblur-fixed hidden lg:block fixed left-8 top-1/2 transform -translate-y-1/2 z-50 medieval-button rounded-full p-3 text-orange-100 shadow-[0_0_14px_rgba(255,140,0,0.22)]"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNavigateForward}
        className="page-load-unblur-fixed hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-50 medieval-button rounded-full p-3 text-orange-100 shadow-[0_0_14px_rgba(255,140,0,0.22)]"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </>
  )
}
