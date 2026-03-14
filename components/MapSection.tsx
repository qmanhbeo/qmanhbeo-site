"use client"

import Image from "next/image"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { useBoundaryPagedScroll } from "@/hooks/useBoundaryPagedScroll"
import { getTravelYearKey, travelYears, type TravelYear } from "@/utils/travel"

const MAP_COOLDOWN_MS = 700

interface MapSectionProps {
  revealClassName?: string
}

export default function MapSection({ revealClassName = "" }: MapSectionProps) {
  const router = useRouter()
  const {
    currentIndex: currentMapYear,
    isTransitioning: isMapScrolling,
    panelRefs,
    goToIndex: goToYear,
    goPrevious: goToPreviousYear,
    goNext: goToNextYear,
  } = useBoundaryPagedScroll({
    itemCount: travelYears.length,
    panelSelector: ".journey-content-area",
    transitionMs: MAP_COOLDOWN_MS,
    settleMs: 100,
  })

  const handleJourneyClick = useCallback(
    (index: number) => {
      const archiveId = `journey-${index}`
      router.push(`/item/${archiveId}`)
    },
    [router],
  )

  return (
    <section
      className="map-section section-safe-area relative flex h-full min-w-full flex-col overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className={`${revealClassName} relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8`}>
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Wanderer&apos;s Map</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Paths walked, stories gathered, memories kindled across distant lands
          </p>
        </div>

        <div className="mb-4 min-h-0 flex-1">
          <div className="map-ghost-panel relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-full bg-amber-100/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              <button
                type="button"
                onClick={goToPreviousYear}
                className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous journey"
                disabled={isMapScrolling}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                {travelYears.map((journey, index) => (
                  <button
                    key={getTravelYearKey(journey)}
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
                onClick={goToNextYear}
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
                    key={getTravelYearKey(journey)}
                    ref={(element) => {
                      panelRefs.current[index] = element
                    }}
                    className="journey-content-area paged-scroll-area scrollable-content scrollbar-fade h-full min-w-full overflow-y-auto p-8"
                  >
                    <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center">
                      <div className="space-y-6 text-center">
                        <div>
                          <div className="mb-4 flex items-center justify-center gap-4">
                            <span className="map-sky-ink-strong font-cinzel text-4xl font-bold">{journey.year}</span>
                            <span className="map-mood-pill rounded-full px-4 py-2 font-garamond text-sm italic">
                              {journey.mood}
                            </span>
                          </div>
                          <h4 className="map-sky-ink-strong mb-3 font-cinzel text-3xl font-bold">{journey.title}</h4>
                          <p className="map-sky-ink mb-6 font-garamond text-xl">{journey.location}</p>
                        </div>

                        <p className="map-sky-ink mb-8 font-garamond text-xl italic leading-relaxed">
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
                            onClick={() => handleJourneyClick(index)}
                            className="inline-flex items-center gap-3 rounded-lg px-8 py-4 font-garamond text-lg text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
                          >
                            <BookOpen className="h-5 w-5" />
                            Read Full Story
                          </button>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-amber-300 pt-6 text-center">
                        <p className="map-sky-ink font-garamond italic">
                          Chapter {currentMapYear + 1} of {travelYears.length} &bull; {journey.location}
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
