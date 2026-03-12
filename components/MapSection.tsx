"use client"

import Image from "next/image"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { travelYears, type TravelYear } from "@/utils/travel"

const YEAR_FLIP_THRESHOLD = 90
const MAP_COOLDOWN_MS = 700
const WHEEL_GESTURE_IDLE_MS = 160

export default function MapSection() {
  const [currentMapYear, setCurrentMapYear] = useState(0)
  const [isMapScrolling, setIsMapScrolling] = useState(false)

  const currentMapYearRef = useRef(0)
  const isMapScrollingRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const wheelStateRef = useRef({
    accum: 0,
    inhibitUntil: 0,
    lastWheelAt: 0,
    gestureId: 0,
    boundaryArmed: false,
    boundaryDirection: 0 as 1 | -1 | 0,
    boundaryGestureId: null as number | null,
  })

  useEffect(() => {
    currentMapYearRef.current = currentMapYear
  }, [currentMapYear])

  useLayoutEffect(() => {
    const activePanel = panelRefs.current[currentMapYear]
    if (!activePanel) return

    // Re-entering a year should always start from the top of that panel.
    activePanel.scrollTo({
      top: 0,
      behavior: "auto",
    })
  }, [currentMapYear])

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const flipYear = useCallback(
    (step: 1 | -1, now = performance.now()) => {
      if (isMapScrollingRef.current) return

      const nextYear = (currentMapYearRef.current + step + travelYears.length) % travelYears.length
      isMapScrollingRef.current = true
      setIsMapScrolling(true)
      setCurrentMapYear(nextYear)
      wheelStateRef.current.inhibitUntil = now + MAP_COOLDOWN_MS

      clearTimeoutRef()
      timeoutRef.current = window.setTimeout(() => {
        isMapScrollingRef.current = false
        setIsMapScrolling(false)
        timeoutRef.current = null
      }, MAP_COOLDOWN_MS + 100)
    },
    [clearTimeoutRef],
  )

  const goToYear = useCallback(
    (index: number) => {
      if (isMapScrollingRef.current) return

      const normalizedIndex = (index + travelYears.length) % travelYears.length
      isMapScrollingRef.current = true
      setIsMapScrolling(true)
      setCurrentMapYear(normalizedIndex)

      clearTimeoutRef()
      timeoutRef.current = window.setTimeout(() => {
        isMapScrollingRef.current = false
        setIsMapScrolling(false)
        timeoutRef.current = null
      }, MAP_COOLDOWN_MS + 100)
    },
    [clearTimeoutRef],
  )

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement
      const contentArea = target.closest(".journey-content-area")
      if (!(contentArea instanceof HTMLElement)) return

      const wheelState = wheelStateRef.current

      const absX = Math.abs(event.deltaX)
      const absY = Math.abs(event.deltaY)
      const verticalIntent = absY >= absX
      const now = performance.now()

      if (now - wheelState.lastWheelAt > WHEEL_GESTURE_IDLE_MS) {
        wheelState.gestureId += 1
        wheelState.accum = 0
      }
      wheelState.lastWheelAt = now

      if (verticalIntent && now < wheelState.inhibitUntil) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (!verticalIntent) return

      const atTop = contentArea.scrollTop <= 0
      const atBottom = contentArea.scrollTop + contentArea.clientHeight >= contentArea.scrollHeight - 1
      const goingDown = event.deltaY > 0
      const goingUp = event.deltaY < 0

      if ((goingDown && atBottom) || (goingUp && atTop)) {
        event.preventDefault()
        event.stopPropagation()

        const direction: 1 | -1 = goingDown ? 1 : -1

        if (!wheelState.boundaryArmed || wheelState.boundaryDirection !== direction) {
          // First boundary hit arms the panel. A fresh follow-up gesture is required to turn the page.
          wheelState.boundaryArmed = true
          wheelState.boundaryDirection = direction
          wheelState.boundaryGestureId = wheelState.gestureId
          wheelState.accum = 0
          return
        }

        if (wheelState.boundaryGestureId === wheelState.gestureId) {
          return
        }

        wheelState.accum += event.deltaY

        if (Math.abs(wheelState.accum) >= YEAR_FLIP_THRESHOLD) {
          wheelState.accum = 0
          wheelState.boundaryArmed = false
          wheelState.boundaryDirection = 0
          wheelState.boundaryGestureId = null
          flipYear(direction, now)
        }

        return
      }

      wheelState.accum = 0
      wheelState.boundaryArmed = false
      wheelState.boundaryDirection = 0
      wheelState.boundaryGestureId = null
    }

    document.addEventListener("wheel", onWheel, { passive: false, capture: true })
    return () => {
      document.removeEventListener("wheel", onWheel, true)
    }
  }, [flipYear])

  useEffect(() => {
    return () => {
      clearTimeoutRef()
    }
  }, [clearTimeoutRef])

  const handleJourneyClick = useCallback((journey: TravelYear) => {
    console.log(`Navigate to full story for ${journey.year} - ${journey.location}`)
  }, [])

  return (
    <section
      className="map-section section-safe-area relative flex h-full min-w-full flex-col overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8">
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Wanderer&apos;s Map</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Paths walked, stories gathered, memories kindled across distant lands
          </p>
        </div>

        <div className="mb-4 min-h-0 flex-1">
          <div className="parchment relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-full bg-amber-100/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              <button
                type="button"
                onClick={() => flipYear(-1)}
                className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous journey"
                disabled={isMapScrolling}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                {travelYears.map((journey, index) => (
                  <button
                    key={journey.year}
                    type="button"
                    onClick={() => goToYear(index)}
                    className={`h-3 w-3 rounded-full transition-all duration-500 ${
                      currentMapYear === index
                        ? "scale-125 bg-orange-400 ember-glow"
                        : "bg-orange-200 hover:scale-110 hover:bg-orange-300"
                    }`}
                    aria-label={`Go to year ${journey.year}`}
                    disabled={isMapScrolling && currentMapYear !== index}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => flipYear(1)}
                className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next journey"
                disabled={isMapScrolling}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-800 ease-in-out"
                style={{ transform: `translateX(-${currentMapYear * 100}%)` }}
              >
                {travelYears.map((journey, index) => (
                  <div
                    key={journey.year}
                    ref={(element) => {
                      panelRefs.current[index] = element
                    }}
                    className="journey-content-area scrollable-content h-full min-w-full overflow-y-auto p-8"
                  >
                    <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center">
                      <div className="space-y-6 text-center">
                        <div>
                          <div className="mb-4 flex items-center justify-center gap-4">
                            <span className="font-cinzel text-4xl font-bold text-amber-900">{journey.year}</span>
                            <span className="rounded-full bg-amber-200 px-4 py-2 font-garamond text-sm italic text-amber-800">
                              {journey.mood}
                            </span>
                          </div>
                          <h4 className="mb-3 font-cinzel text-3xl font-bold text-amber-900">{journey.title}</h4>
                          <p className="mb-6 font-garamond text-xl text-amber-700">{journey.location}</p>
                        </div>

                        <p className="mb-8 font-garamond text-xl italic leading-relaxed text-amber-800">
                          {journey.memory}
                        </p>

                        <div className="mb-8 grid grid-cols-3 gap-6">
                          {[1, 2, 3].map((memoryIndex) => (
                            <div key={memoryIndex} className="wooden-frame aspect-square overflow-hidden rounded-lg">
                              <Image
                                src="/placeholder.svg"
                                alt={`Memory from ${journey.location} ${memoryIndex}`}
                                width={160}
                                height={160}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="mb-8 rounded-lg border-l-4 border-amber-600 bg-amber-50 p-6">
                          <h5 className="mb-3 font-cinzel text-lg font-bold text-amber-900">Journey Reflections</h5>
                          <p className="font-garamond leading-relaxed text-amber-800">
                            Each destination brought new perspectives and deeper understanding of the interconnected
                            world we inhabit. The memories forged in {journey.location} continue to influence the path
                            forward, weaving stories that connect past experiences with future adventures.
                          </p>
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => handleJourneyClick(journey)}
                            className="inline-flex items-center gap-3 rounded-lg px-8 py-4 font-garamond text-lg text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
                          >
                            <BookOpen className="h-5 w-5" />
                            Read Full Story
                          </button>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-amber-300 pt-6 text-center">
                        <p className="font-garamond italic text-amber-700">
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
