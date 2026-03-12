"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Compass, X } from "lucide-react"
import { getTravelYearKey, travelYears } from "@/utils/travel"

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
}

const MAP_TRANSITION_MS = 800

export default function MapModal({ isOpen, onClose }: MapModalProps) {
  const router = useRouter()
  const [currentMapYear, setCurrentMapYear] = useState(0)
  const [isMapScrolling, setIsMapScrolling] = useState(false)

  const currentMapYearRef = useRef(0)
  const isMapScrollingRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    currentMapYearRef.current = currentMapYear
  }, [currentMapYear])

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
  }, [])

  const navigateToYear = useCallback(
    (yearIndex: number) => {
      if (isMapScrollingRef.current) return

      const normalizedYear = (yearIndex + travelYears.length) % travelYears.length
      isMapScrollingRef.current = true
      setIsMapScrolling(true)
      setCurrentMapYear(normalizedYear)

      clearTransitionTimeout()
      transitionTimeoutRef.current = window.setTimeout(() => {
        isMapScrollingRef.current = false
        setIsMapScrolling(false)
        transitionTimeoutRef.current = null
      }, MAP_TRANSITION_MS)
    },
    [clearTransitionTimeout],
  )

  const navigateToPreviousYear = useCallback(() => {
    navigateToYear(currentMapYearRef.current - 1)
  }, [navigateToYear])

  const navigateToNextYear = useCallback(() => {
    navigateToYear(currentMapYearRef.current + 1)
  }, [navigateToYear])

  const handleClose = useCallback(() => {
    clearTransitionTimeout()
    setIsMapScrolling(false)
    isMapScrollingRef.current = false
    router.back()
    onClose()
  }, [clearTransitionTimeout, onClose, router])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          handleClose()
          break
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault()
          navigateToPreviousYear()
          break
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault()
          navigateToNextYear()
          break
        default:
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleClose, isOpen, navigateToNextYear, navigateToPreviousYear])

  useEffect(() => {
    if (!isOpen) return

    const handleWheel = (event: WheelEvent) => {
      if (isMapScrollingRef.current) return

      event.preventDefault()
      event.stopPropagation()

      if (event.deltaY > 0 || event.deltaX > 0) {
        navigateToNextYear()
      } else if (event.deltaY < 0 || event.deltaX < 0) {
        navigateToPreviousYear()
      }
    }

    document.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [isOpen, navigateToNextYear, navigateToPreviousYear])

  useEffect(() => {
    return () => {
      clearTransitionTimeout()
    }
  }, [clearTransitionTimeout])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500"
        onClick={handleClose}
      />

      <div className={`map-modal-scroll ${isOpen ? "unfurling" : ""}`}>
        <div className="map-modal-parchment" />
        <div className="absolute top-8 right-8 h-12 w-12 wax-seal-small opacity-60" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute left-6 top-6 z-20 rounded-full p-3 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
          aria-label="Close map"
        >
          <X className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={navigateToPreviousYear}
          className="absolute left-8 top-1/2 z-20 -translate-y-1/2 rounded-full p-3 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous journey"
          disabled={isMapScrolling}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={navigateToNextYear}
          className="absolute right-8 top-1/2 z-20 -translate-y-1/2 rounded-full p-3 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next journey"
          disabled={isMapScrolling}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute left-1/2 top-8 z-20 flex -translate-x-1/2 gap-3">
          {travelYears.map((journey, index) => (
            <button
              key={getTravelYearKey(journey)}
              type="button"
              onClick={() => navigateToYear(index)}
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

        <div className="relative z-10 h-full w-full overflow-hidden p-12">
          <div className="mb-8 text-center">
            <h2 className="font-cinzel text-4xl font-bold text-amber-900 md:text-5xl">Wanderer&apos;s Journey</h2>
            <p className="font-garamond text-lg italic text-amber-700">
              Navigate through the chapters of adventure with arrow keys or scroll
            </p>
          </div>

          <div
            className="flex h-full transition-transform duration-800 ease-in-out"
            style={{ transform: `translateX(-${currentMapYear * 100}%)` }}
          >
            {travelYears.map((journey, index) => (
              <div key={getTravelYearKey(journey)} className="flex h-full min-w-full items-center justify-center px-8">
                <div className="grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
                  <div className="relative">
                    <div className="world-map relative h-96 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 p-8">
                      <div className="relative h-full w-full">
                        <div
                          className="absolute h-8 w-8 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-red-500 ember-glow"
                          style={{
                            top: journey.coordinates.top,
                            left: journey.coordinates.left,
                            transform: "translate(-50%, -50%)",
                          }}
                        />

                        {index > 0 && (
                          <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 200">
                            <path
                              d={`M${Number.parseFloat(travelYears[index - 1].coordinates.left) * 4},${Number.parseFloat(travelYears[index - 1].coordinates.top) * 2} Q${Number.parseFloat(journey.coordinates.left) * 4 - 50},${Number.parseFloat(journey.coordinates.top) * 2 - 30} ${Number.parseFloat(journey.coordinates.left) * 4},${Number.parseFloat(journey.coordinates.top) * 2}`}
                              stroke="#ff6b35"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="4,4"
                              className="animate-pulse"
                            />
                          </svg>
                        )}

                        <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 200">
                          <path
                            d="M50,100 Q100,80 150,100 T250,100 T350,100"
                            stroke="#8b4513"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="5,5"
                          />
                          <path
                            d="M100,50 Q150,70 200,50 T300,50"
                            stroke="#8b4513"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="3,3"
                          />
                          <path
                            d="M80,150 Q130,130 180,150 T280,150"
                            stroke="#8b4513"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="3,3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="parchment rounded-lg p-8">
                    <div className="mb-6">
                      <div className="mb-4 flex items-center gap-4">
                        <span className="font-cinzel text-4xl font-bold text-amber-900">{journey.year}</span>
                        <span className="rounded-full bg-amber-200 px-4 py-2 font-garamond text-sm italic text-amber-800">
                          {journey.mood}
                        </span>
                      </div>
                      <h3 className="mb-2 font-cinzel text-3xl font-bold text-amber-900">{journey.title}</h3>
                      <p className="font-garamond text-lg text-amber-700">{journey.location}</p>
                    </div>

                    <p className="mb-8 font-garamond text-xl italic leading-relaxed text-amber-800">
                      {journey.memory}
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((memoryIndex) => (
                        <div key={memoryIndex} className="wooden-frame aspect-square overflow-hidden rounded-lg">
                          <Image
                            src="/placeholder.svg"
                            alt={`Memory from ${journey.location} ${memoryIndex}`}
                            width={120}
                            height={120}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-garamond text-sm text-amber-700">
            <p className="mb-2">
              Chapter {currentMapYear + 1} of {travelYears.length}
            </p>
            <p className="italic opacity-75">Use arrow keys, scroll, or click dots to navigate</p>
          </div>
        </div>

        <Compass className="absolute left-4 top-4 h-5 w-5 text-amber-600 opacity-40" />
        <Compass className="absolute bottom-4 right-4 h-5 w-5 text-amber-600 opacity-40" />
      </div>
    </div>
  )
}
