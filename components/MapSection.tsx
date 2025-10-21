// File: components/MapSection.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { travelYears } from "@/utils/travel"

export default function MapSection() {
  const [currentMapYear, setCurrentMapYear] = useState(0)
  const [isMapScrolling, setIsMapScrolling] = useState(false)

  // Keep latest year available to the wheel handler without re-binding it
  const yearRef = useRef(0)
  useEffect(() => {
    yearRef.current = currentMapYear
  }, [currentMapYear])

  // Wheel handler state that must persist across renders
  const wheelStateRef = useRef({
    accum: 0,
    inhibitUntil: 0, // swallow vertical wheel until this timestamp
  })

  // Tunables
  const THRESH = 90         // how much vertical delta (px-ish) to flip a year
  const COOLDOWN_MS = 700   // how long to swallow vertical wheel after a flip (should ≈ animation)

  // Programmatic year navigation (looping)
  const flipYear = (step: 1 | -1, now: number) => {
    const next = (yearRef.current + step + travelYears.length) % travelYears.length
    setIsMapScrolling(true)
    setCurrentMapYear(next)
    // swallow vertical wheel during the animation so outer container doesn't grab it
    wheelStateRef.current.inhibitUntil = now + COOLDOWN_MS
    window.setTimeout(() => setIsMapScrolling(false), COOLDOWN_MS + 100)
  }

  // Wheel intent guard + threshold + cooldown swallow
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      const contentEl = target.closest(".journey-content-area") as HTMLElement | null
      if (!contentEl) return // outside the inner scroll zone → let outer handle it

      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      const verticalIntent = absY >= absX

      // If we're still in cooldown, swallow vertical wheel so it can't bubble to the outer container
      const now = performance.now()
      if (verticalIntent && now < wheelStateRef.current.inhibitUntil) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      // Horizontal-intent gestures should be handled by the outer container
      if (!verticalIntent) return

      const atTop = contentEl.scrollTop <= 0
      const atBottom =
        contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 1

      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      // Only consider flipping years when reader hits the vertical boundary of the inner scroller
      if ((goingDown && atBottom) || (goingUp && atTop)) {
        // Accumulate small ticks to avoid jitter and prevent scroll chaining while we decide
        wheelStateRef.current.accum += e.deltaY
        e.preventDefault()
        e.stopPropagation()

        if (Math.abs(wheelStateRef.current.accum) >= THRESH) {
          const step = wheelStateRef.current.accum > 0 ? 1 : -1
          wheelStateRef.current.accum = 0
          flipYear(step as 1 | -1, now)
        }
      } else {
        // Inside content and not at boundary → let it scroll normally
        wheelStateRef.current.accum = 0
      }
    }

    // Capture so we can stop propagation before outer listeners, and passive:false to allow preventDefault()
    document.addEventListener("wheel", onWheel, { passive: false, capture: true })
    return () => document.removeEventListener("wheel", onWheel as EventListener, { capture: true } as any)
  }, []) // do not re-bind; we read mutable refs instead

  const handleJourneyClick = (journey: any) => {
    console.log(`Navigate to full story for ${journey.year} - ${journey.location}`)
  }

  return (
    <section
      className="map-section min-w-full h-full flex flex-col relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className="relative z-10 px-8 max-w-7xl w-full h-full flex flex-col mx-auto">
        {/* Header */}
        <div className="text-center py-6 flex-shrink-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-2 text-orange-100 font-cinzel">Wanderer&apos;s Map</h2>
          <p className="text-lg text-orange-200 max-w-2xl mx-auto font-garamond italic">
            Paths walked, stories gathered, memories kindled across distant lands
          </p>
        </div>

        {/* Wide Journey Box */}
        <div className="flex-1 min-h-0 mb-4">
          <div className="parchment rounded-lg h-full flex flex-col overflow-hidden relative">
            {/* Sticky Navigation Dots - Top Right */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-amber-100/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <button
                onClick={() =>
                  setCurrentMapYear((yearRef.current - 1 + travelYears.length) % travelYears.length)
                }
                className="medieval-button rounded-full p-2 text-orange-100 hover:ember-glow transition-all duration-300 scale-75"
                aria-label="Previous journey"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Year Navigation Dots */}
              <div className="flex gap-2">
                {travelYears.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMapYear(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      currentMapYear === index
                        ? "bg-orange-400 ember-glow scale-125"
                        : "bg-orange-200 hover:bg-orange-300 hover:scale-110"
                    }`}
                    aria-label={`Go to year ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentMapYear((yearRef.current + 1) % travelYears.length)
                }
                className="medieval-button rounded-full p-2 text-orange-100 hover:ember-glow transition-all duration-300 scale-75"
                aria-label="Next journey"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Journey Content */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-800 ease-in-out"
                style={{ transform: `translateX(-${currentMapYear * 100}%)` }}
              >
                {travelYears.map((journey, index) => (
                  <div
                    key={index}
                    className="min-w-full h-full p-8 scrollable-content overflow-y-auto journey-content-area"
                  >
                    <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-full">
                      {/* Story Content */}
                      <div className="space-y-6 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="text-4xl font-bold text-amber-900 font-cinzel">{journey.year}</span>
                            <span className="px-4 py-2 bg-amber-200 text-amber-800 rounded-full text-sm font-garamond italic">
                              {journey.mood}
                            </span>
                          </div>
                          <h4 className="text-3xl font-bold text-amber-900 font-cinzel mb-3">{journey.title}</h4>
                          <p className="text-amber-700 font-garamond text-xl mb-6">{journey.location}</p>
                        </div>

                        <p className="text-xl text-amber-800 font-garamond leading-relaxed italic mb-8">
                          {journey.memory}
                        </p>

                        {/* Image Placeholders */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                          <div className="wooden-frame aspect-square rounded-lg overflow-hidden">
                            <img
                              src="/placeholder.svg?height=160&width=160"
                              alt={`Memory from ${journey.location} 1`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="wooden-frame aspect-square rounded-lg overflow-hidden">
                            <img
                              src="/placeholder.svg?height=160&width=160"
                              alt={`Memory from ${journey.location} 2`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="wooden-frame aspect-square rounded-lg overflow-hidden">
                            <img
                              src="/placeholder.svg?height=160&width=160"
                              alt={`Memory from ${journey.location} 3`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Journey Reflections */}
                        <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-600 mb-8">
                          <h5 className="font-bold text-amber-900 font-cinzel mb-3 text-lg">Journey Reflections</h5>
                          <p className="text-amber-800 font-garamond leading-relaxed">
                            Each destination brought new perspectives and deeper understanding of the interconnected
                            world we inhabit. The memories forged in {journey.location} continue to influence the path
                            forward, weaving stories that connect past experiences with future adventures.
                          </p>
                        </div>

                        {/* Read Full Story Button */}
                        <div className="text-center">
                          <button
                            onClick={() => handleJourneyClick(journey)}
                            className="medieval-button text-orange-100 px-8 py-4 rounded-lg font-garamond inline-flex items-center gap-3 text-lg hover:ember-glow transition-all duration-300"
                          >
                            <BookOpen className="w-5 h-5" />
                            Read Full Story
                          </button>
                        </div>
                      </div>

                      {/* Journey Progress Indicator */}
                      <div className="text-center mt-8 pt-6 border-t border-amber-300">
                        <p className="text-amber-700 font-garamond italic">
                          Chapter {currentMapYear + 1} of {travelYears.length} • {journey.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
