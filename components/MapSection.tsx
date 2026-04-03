"use client"

import Image from "next/image"
import { useCallback, useRef } from "react"
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

  const swipeTouchStartXRef = useRef<number | null>(null)
  const swipeTouchStartYRef = useRef<number | null>(null)

  const handleSwipeTouchStart = useCallback((e: React.TouchEvent) => {
    swipeTouchStartXRef.current = e.touches[0].clientX
    swipeTouchStartYRef.current = e.touches[0].clientY
  }, [])

  const handleSwipeTouchEnd = useCallback((e: React.TouchEvent) => {
    if (swipeTouchStartXRef.current === null || swipeTouchStartYRef.current === null) return
    const deltaX = swipeTouchStartXRef.current - e.changedTouches[0].clientX
    const deltaY = swipeTouchStartYRef.current - e.changedTouches[0].clientY
    swipeTouchStartXRef.current = null
    swipeTouchStartYRef.current = null
    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 48) return
    if (deltaX > 0) goToNextYear()
    else goToPreviousYear()
  }, [goToNextYear, goToPreviousYear])

  const handleSwipeTouchCancel = useCallback(() => {
    swipeTouchStartXRef.current = null
    swipeTouchStartYRef.current = null
  }, [])

  const navPillContent = (
    <>
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
    </>
  )

  return (
    <section
      className="map-section section-safe-area relative flex h-full min-w-full flex-col justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className={`${revealClassName} relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-8`}>
        {/* Header */}
        <div className="flex-shrink-0 py-4 md:py-6 text-center">
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-orange-100 md:text-5xl">Wanderer&apos;s Map</h2>
          <p className="mx-auto max-w-2xl font-garamond text-sm sm:text-lg italic text-orange-200">
            Paths walked, stories gathered, memories kindled across distant lands
          </p>
        </div>

        {/* Swipe zone: nav pill + ghost panel (everything below the title) */}
        <div
          className="flex flex-col h-[55dvh] min-h-[300px]"
          data-swipe-zone
          onTouchStart={handleSwipeTouchStart}
          onTouchEnd={handleSwipeTouchEnd}
          onTouchCancel={handleSwipeTouchCancel}
        >
        {/* Mobile-only nav pill — in-flow, centered above the panel */}
        <div className="md:hidden flex-shrink-0 flex items-center justify-center gap-4 rounded-full bg-amber-100/90 px-4 py-2 shadow-lg backdrop-blur-sm mb-3 mx-auto">
          {navPillContent}
        </div>

        {/* Ghost panel */}
        <div className="mb-4 min-h-0 flex-1">
          <div
            className="map-ghost-panel relative flex h-full flex-col overflow-hidden rounded-lg"
          >

            {/* Desktop-only nav pill — absolute top-right inside panel */}
            <div className="hidden md:flex absolute right-6 top-6 z-20 items-center gap-4 rounded-full bg-amber-100/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              {navPillContent}
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
                    className="journey-content-area paged-scroll-area scrollable-content scrollbar-fade h-full min-w-full overflow-y-auto p-4 md:p-8"
                  >
                    <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center">
                      <div className="space-y-3 md:space-y-6 text-center">
                        <div>
                          <div className="mb-2 md:mb-4 flex items-center justify-center gap-3 md:gap-4">
                            <span className="map-sky-ink-strong font-cinzel text-2xl md:text-4xl font-bold">{journey.year}</span>
                            <span className="map-mood-pill rounded-full px-3 py-1 md:px-4 md:py-2 font-garamond text-xs md:text-sm italic">
                              {journey.mood}
                            </span>
                          </div>
                          <h4 className="map-sky-ink-strong mb-2 md:mb-3 font-cinzel text-xl sm:text-2xl md:text-3xl font-bold">{journey.title}</h4>
                          <p className="map-sky-ink mb-2 md:mb-6 font-garamond text-base md:text-xl">{journey.location}</p>
                        </div>

                        <p className="map-sky-ink mb-3 md:mb-8 font-garamond text-sm sm:text-base md:text-xl italic leading-relaxed">
                          {journey.memory}
                        </p>

                        {journey.photos && journey.photos.length > 0 && (
                          <div className="mb-6 hidden md:flex flex-wrap justify-center gap-4">
                            {journey.photos.map((src, i) => (
                              <div key={i} className="wooden-frame w-[200px] h-[200px] flex-shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={src}
                                  alt={`Memory from ${journey.location} ${i + 1}`}
                                  width={200}
                                  height={200}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => handleJourneyClick(index)}
                            className="inline-flex items-center gap-2 md:gap-3 rounded-lg px-5 py-2.5 md:px-8 md:py-4 font-garamond text-base md:text-lg text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
                          >
                            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                            Read Full Story
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-8 border-t border-amber-300 pt-3 md:pt-6 text-center">
                        <p className="map-sky-ink font-garamond italic text-sm md:text-base">
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
        </div> {/* end swipe zone */}
      </div>
    </section>
  )
}
