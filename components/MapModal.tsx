"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { travelYears } from "@/utils/travel"

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MapModal({ isOpen, onClose }: MapModalProps) {
  const router = useRouter()
  const [currentMapYear, setCurrentMapYear] = useState(0)
  const [isMapScrolling, setIsMapScrolling] = useState(false)
  const [isUnfurling, setIsUnfurling] = useState(false)

  // Handle modal opening animation
  useEffect(() => {
    if (isOpen) {
      setIsUnfurling(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          handleClose()
          break
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault()
          navigateToYear(currentMapYear === 0 ? travelYears.length - 1 : currentMapYear - 1)
          break
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault()
          navigateToYear((currentMapYear + 1) % travelYears.length)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentMapYear])

  const handleClose = () => {
    setIsUnfurling(false)
    router.back()
    onClose()
  }

  const navigateToYear = (yearIndex: number) => {
    if (isMapScrolling) return
    setIsMapScrolling(true)
    setCurrentMapYear(yearIndex)
    setTimeout(() => setIsMapScrolling(false), 800)
  }

  // Handle wheel/scroll events within modal
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isOpen || isMapScrolling) return

      e.preventDefault()
      e.stopPropagation()

      const isForward = e.deltaY > 0 || e.deltaX > 0
      const isBackward = e.deltaY < 0 || e.deltaX < 0

      if (isForward) {
        navigateToYear((currentMapYear + 1) % travelYears.length)
      } else if (isBackward) {
        navigateToYear(currentMapYear === 0 ? travelYears.length - 1 : currentMapYear - 1)
      }
    }

    if (isOpen) {
      document.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [isOpen, currentMapYear, isMapScrolling])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500"
        onClick={handleClose}
      />

      {/* Modal Scroll */}
      <div className={`map-modal-scroll ${isUnfurling ? "unfurling" : ""}`}>
        {/* Scroll Parchment Background */}
        <div className="map-modal-parchment" />

        {/* Wax Seal (decorative) */}
        <div className="absolute top-8 right-8 w-12 h-12 wax-seal-small opacity-60" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 z-20 medieval-button rounded-full p-3 text-orange-100 hover:ember-glow transition-all duration-300"
          aria-label="Close map"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={() => navigateToYear(currentMapYear === 0 ? travelYears.length - 1 : currentMapYear - 1)}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 medieval-button rounded-full p-3 text-orange-100 hover:ember-glow transition-all duration-300"
          aria-label="Previous journey"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigateToYear((currentMapYear + 1) % travelYears.length)}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 medieval-button rounded-full p-3 text-orange-100 hover:ember-glow transition-all duration-300"
          aria-label="Next journey"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Year Navigation Dots */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {travelYears.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToYear(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                currentMapYear === index
                  ? "bg-orange-400 ember-glow scale-125"
                  : "bg-orange-200 hover:bg-orange-300 hover:scale-110"
              }`}
              aria-label={`Go to year ${index + 1}`}
            />
          ))}
        </div>

        {/* Modal Content */}
        <div className="relative z-10 w-full h-full p-12 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-amber-900 font-cinzel">Wanderer's Journey</h2>
            <p className="text-lg text-amber-700 font-garamond italic">
              Navigate through the chapters of adventure with arrow keys or scroll
            </p>
          </div>

          {/* Journey Panels */}
          <div
            className="flex h-full transition-transform duration-800 ease-in-out"
            style={{ transform: `translateX(-${currentMapYear * 100}%)` }}
          >
            {travelYears.map((journey, index) => (
              <div key={index} className="min-w-full h-full flex items-center justify-center px-8">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl w-full items-center">
                  {/* Map Side */}
                  <div className="relative">
                    <div className="world-map h-96 relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-2xl p-8">
                      <div className="relative w-full h-full">
                        {/* Current location highlighted */}
                        <div
                          className="absolute w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full ember-glow animate-pulse"
                          style={{
                            top: journey.coordinates.top,
                            left: journey.coordinates.left,
                            transform: "translate(-50%, -50%)",
                          }}
                        />

                        {/* Soft connecting lines to previous locations */}
                        {index > 0 && (
                          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200">
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

                        {/* Map background */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200">
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

                  {/* Story Side */}
                  <div className="parchment p-8 rounded-lg">
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl font-bold text-amber-900 font-cinzel">{journey.year}</span>
                        <span className="px-4 py-2 bg-amber-200 text-amber-800 rounded-full text-sm font-garamond italic">
                          {journey.mood}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-amber-900 font-cinzel mb-2">{journey.title}</h3>
                      <p className="text-amber-700 font-garamond text-lg">{journey.location}</p>
                    </div>

                    <p className="text-xl text-amber-800 font-garamond leading-relaxed italic mb-8">{journey.memory}</p>

                    {/* Image Placeholders */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="wooden-frame aspect-square rounded-lg overflow-hidden">
                        <img
                          src="/placeholder.svg?height=120&width=120"
                          alt={`Memory from ${journey.location} 1`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="wooden-frame aspect-square rounded-lg overflow-hidden">
                        <img
                          src="/placeholder.svg?height=120&width=120"
                          alt={`Memory from ${journey.location} 2`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="wooden-frame aspect-square rounded-lg overflow-hidden">
                        <img
                          src="/placeholder.svg?height=120&width=120"
                          alt={`Memory from ${journey.location} 3`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Journey Progress Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-amber-700 text-sm font-garamond text-center">
            <p className="mb-2">
              Chapter {currentMapYear + 1} of {travelYears.length}
            </p>
            <p className="italic opacity-75">Use arrow keys, scroll, or click dots to navigate</p>
          </div>
        </div>

        {/* Scroll decorative elements */}
        <div className="absolute top-4 left-4 text-amber-600 opacity-40">🌿</div>
        <div className="absolute bottom-4 right-4 text-amber-600 opacity-40">🌿</div>
      </div>
    </div>
  )
}
