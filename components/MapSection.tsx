"use client"

import Image from "next/image"
import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { arcEntries, type ArcEntry } from "@/content/entries"
import { useBoundaryPagedScroll } from "@/hooks/useBoundaryPagedScroll"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"
import { useAudioContext } from "@/context/AudioContext"

const MAP_COOLDOWN_MS = 700

interface MapSectionProps {
  revealClassName?: string
}

function ArcDetailCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50/90 p-2.5 md:p-4">
      <h5 className="mb-1.5 font-cinzel text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-600 md:mb-2 md:text-xs md:tracking-widest">
        {label}
      </h5>
      <ul className="space-y-1">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 font-garamond text-[0.92rem] leading-snug text-amber-950 md:text-sm">
            <span className="mt-0.5 flex-shrink-0 text-amber-500">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function WhomIMetCard({ items }: { items: string[] }) {
  return (
    <div
      className="rounded-md p-2.5 md:p-4"
      style={{
        border: "1px solid rgba(255, 200, 120, 0.65)",
        background: "rgba(255, 240, 210, 0.95)",
      }}
    >
      <h5 className="mb-1.5 font-cinzel text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-700 md:mb-2 md:text-xs md:tracking-widest">
        Whom I Met
      </h5>
      <ul className="space-y-1">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 font-garamond text-[0.92rem] leading-snug text-amber-950 md:text-sm">
            <span className="mt-0.5 flex-shrink-0 text-amber-600">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ArcImageRow({ images }: { images: ArcEntry["images"] }) {
  if (images.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-[42rem] rounded-lg border border-amber-300/60 bg-amber-50/75 px-3 py-2.5 shadow-[0_8px_24px_rgba(80,42,18,0.08)] md:rounded-xl md:px-4 md:py-3">
      <div className="mb-2.5 flex items-center gap-2.5 md:mb-3 md:gap-3">
        <span className="h-px flex-1 bg-amber-300/70" />
        <span className="font-cinzel text-[0.58rem] font-bold uppercase tracking-[0.24em] text-amber-700/90 md:text-[0.65rem] md:tracking-[0.28em]">
          Moments from the Road
        </span>
        <span className="h-px flex-1 bg-amber-300/70" />
      </div>

      <div className="flex flex-wrap justify-center gap-2.5 md:gap-4">
        {images.map((image, index) => (
          <div
            key={image.src}
            className="wooden-frame h-[5rem] w-[5rem] flex-shrink-0 overflow-hidden rounded-lg sm:h-[6rem] sm:w-[6rem] md:h-[8rem] md:w-[8rem]"
          >
            <Image
              src={image.src}
              alt={image.alt ?? `Journey memory ${index + 1}`}
              width={192}
              height={192}
              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function NavPill({
  current,
  isTransitioning,
  onPrev,
  onNext,
  onGoTo,
}: {
  current: number
  isTransitioning: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-amber-100/88 px-3 py-1.5 shadow-md backdrop-blur-sm md:gap-4 md:px-4 md:py-2 md:shadow-lg">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-full p-1.5 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50 md:p-2"
        aria-label="Previous journey"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>
      <div className="flex gap-1.5 md:gap-2">
        {arcEntries.map((journey, index) => (
          <button
            key={journey.slug}
            type="button"
            onClick={() => onGoTo(index)}
            className={`h-2 w-2 rounded-full transition-all duration-500 md:h-3 md:w-3 ${
              current === index
                ? "scale-125 bg-orange-400 ember-glow"
                : "bg-orange-200 hover:scale-110 hover:bg-orange-300"
            }`}
            aria-label={`Go to year ${journey.yearLabel}`}
            disabled={isTransitioning && current !== index}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="rounded-full p-1.5 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50 md:p-2"
        aria-label="Next journey"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>
    </div>
  )
}

export default function MapSection({ revealClassName = "" }: MapSectionProps) {
  const router = useRouter()
  const { playSfx } = useAudioContext()
  const [initialMapRestoreState] = useState(() => {
    const pendingReturnState = readPendingReturnState("/")
    return pendingReturnState?.sourceSection === "map"
      ? {
          initialIndex: pendingReturnState.sourceChapterIndex ?? 0,
          initialScrollTop: pendingReturnState.sourceInternalScroll ?? 0,
        }
      : {
          initialIndex: 0,
          initialScrollTop: 0,
        }
  })
  const {
    currentIndex: currentMapYear,
    isTransitioning: isMapScrolling,
    panelRefs,
    goToIndex: goToYear,
    goPrevious: goToPreviousYear,
    goNext: goToNextYear,
  } = useBoundaryPagedScroll({
    itemCount: arcEntries.length,
    panelSelector: ".journey-content-area",
    transitionMs: MAP_COOLDOWN_MS,
    settleMs: 100,
    initialIndex: initialMapRestoreState.initialIndex,
    initialPanelScrollTop: initialMapRestoreState.initialScrollTop,
    onNavigate: () => playSfx("flip"),
  })

  const handleJourneyClick = useCallback(
    (slug: string) => {
      const activePanel = panelRefs.current[currentMapYear]

      saveEntryOriginState({
        sourceRoute: "/",
        sourceSection: "map",
        homeSectionIndex: getHomeSectionIndexForOrigin("map"),
        sourceScrollY: typeof window === "undefined" ? 0 : window.scrollY,
        sourceInternalScroll: activePanel?.scrollTop ?? 0,
        sourceChapterIndex: currentMapYear,
        itemSlug: slug,
      })

      router.push(`/item/${slug}`)
    },
    [currentMapYear, panelRefs, router],
  )

  const swipeTouchStartXRef = useRef<number | null>(null)
  const swipeTouchStartYRef = useRef<number | null>(null)

  const handleSwipeTouchStart = useCallback((e: React.TouchEvent) => {
    swipeTouchStartXRef.current = e.touches[0].clientX
    swipeTouchStartYRef.current = e.touches[0].clientY
  }, [])

  const handleSwipeTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (swipeTouchStartXRef.current === null || swipeTouchStartYRef.current === null) return
      const deltaX = swipeTouchStartXRef.current - e.changedTouches[0].clientX
      const deltaY = swipeTouchStartYRef.current - e.changedTouches[0].clientY
      swipeTouchStartXRef.current = null
      swipeTouchStartYRef.current = null
      if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 48) return
      if (deltaX > 0) goToNextYear()
      else goToPreviousYear()
    },
    [goToNextYear, goToPreviousYear],
  )

  const handleSwipeTouchCancel = useCallback(() => {
    swipeTouchStartXRef.current = null
    swipeTouchStartYRef.current = null
  }, [])

  return (
    <section
      className="map-section section-safe-area relative flex h-full min-w-full flex-col justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className={`${revealClassName} relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-8`}>
        {/* Header */}
        <div className="flex-shrink-0 py-2.5 text-center md:py-6">
          <h2 className="font-cinzel text-[2.15rem] font-bold leading-tight text-orange-100 sm:text-4xl md:text-5xl">
            Wanderer&apos;s Map
          </h2>
          <p className="mx-auto mt-1 max-w-xl font-garamond text-[0.95rem] italic leading-snug text-orange-200 sm:text-lg md:mt-0 md:max-w-2xl md:leading-normal">
            Paths walked, stories gathered, memories kindled across distant lands
          </p>
        </div>

        {/* Swipe zone */}
        <div
          className="flex h-[58dvh] min-h-[290px] flex-col md:h-[55dvh] md:min-h-[300px]"
          data-swipe-zone
          onTouchStart={handleSwipeTouchStart}
          onTouchEnd={handleSwipeTouchEnd}
          onTouchCancel={handleSwipeTouchCancel}
        >
          {/* Mobile nav pill — in-flow, centered */}
          <div className="mb-2 flex flex-shrink-0 justify-center md:hidden">
            <NavPill
              current={currentMapYear}
              isTransitioning={isMapScrolling}
              onPrev={goToPreviousYear}
              onNext={goToNextYear}
              onGoTo={goToYear}
            />
          </div>

          {/* Ghost panel */}
          <div className="mb-2 min-h-0 flex-1 md:mb-4">
            <div className="map-ghost-panel flex h-full flex-col overflow-hidden rounded-[1rem] md:rounded-lg">

              {/* Desktop nav pill — in-flow, right-aligned top bar */}
              <div className="hidden md:flex flex-shrink-0 justify-end px-6 pt-4 pb-1">
                <NavPill
                  current={currentMapYear}
                  isTransitioning={isMapScrolling}
                  onPrev={goToPreviousYear}
                  onNext={goToNextYear}
                  onGoTo={goToYear}
                />
              </div>

              {/* Carousel track */}
              <div className="flex-1 overflow-hidden">
                <div
                  className="flex h-full transition-transform duration-800 ease-in-out"
                  style={{ transform: `translateX(-${currentMapYear * 100}%)` }}
                >
                  {arcEntries.map((journey: ArcEntry, index) => (
                    <div
                      key={journey.slug}
                      ref={(element) => {
                        panelRefs.current[index] = element
                      }}
                      className="journey-content-area paged-scroll-area scrollable-content scrollbar-fade scroll-fade-vertical h-full min-w-full overflow-y-auto px-4 pb-4 pt-1.5 md:px-10 md:pb-6 md:pt-2"
                    >
                      <div className="mx-auto max-w-3xl space-y-2.5 md:space-y-3">

                        {/* Arc header */}
                        <div className="text-center">
                          <div className="mb-1 flex items-center justify-center gap-2 md:gap-3">
                            <span className="map-sky-ink-strong font-cinzel text-lg font-bold md:text-2xl">
                              {journey.yearLabel}
                            </span>
                            <span className="map-mood-pill rounded-full px-2.5 py-0.5 font-garamond text-[0.72rem] italic md:px-3 md:py-1 md:text-xs">
                              {journey.mood}
                            </span>
                          </div>
                          <h3 className="map-sky-ink-strong font-cinzel text-[1.5rem] font-bold leading-tight md:text-3xl">
                            {journey.title}
                          </h3>
                          <p className="map-sky-ink font-garamond text-[0.92rem] md:text-base">{journey.location}</p>
                        </div>

                        {/* Summary card */}
                        <div className="rounded-lg border border-amber-300 bg-amber-50/90 p-3 md:p-4">
                          <h4 className="mb-1.5 font-cinzel text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-600 md:text-xs md:tracking-widest">
                            Chapter
                          </h4>
                          <p className="font-garamond text-[0.98rem] italic leading-relaxed text-amber-950 md:text-base">
                            {journey.chapter}
                          </p>
                        </div>

                        {journey.images.length > 0 && (
                          <ArcImageRow images={journey.images} />
                        )}

                        {/* Narrative grid — 2×2 */}
                        {(journey.whatIDid || journey.whomIMet || journey.whatILearned || journey.whatIAchieved) && (
                          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
                            {journey.whatIDid && (
                              <ArcDetailCard label="What I Did" items={journey.whatIDid} />
                            )}
                            {journey.whomIMet && (
                              <WhomIMetCard items={journey.whomIMet} />
                            )}
                            {journey.whatILearned && (
                              <ArcDetailCard label="What I Learned" items={journey.whatILearned} />
                            )}
                            {journey.whatIAchieved && (
                              <ArcDetailCard label="What I Achieved" items={journey.whatIAchieved} />
                            )}
                          </div>
                        )}

                        {/* Themes — pill row, matches Scholar Scrolls exactly */}
                        {journey.tags.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                            {journey.tags.map((theme) => (
                              <span
                                key={theme}
                                className="rounded-full border border-amber-300/80 bg-amber-100/80 px-2.5 py-0.5 font-garamond text-xs text-amber-800 md:px-3 md:py-1 md:text-sm"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* CTA + folio line */}
                        <div className="flex flex-col items-center gap-2 border-t border-amber-300/50 pt-2.5 md:gap-3 md:pt-3">
                          <button
                            type="button"
                            onClick={() => handleJourneyClick(journey.slug)}
                            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-garamond text-[0.95rem] text-orange-100 transition-all duration-300 medieval-button hover:ember-glow md:gap-3 md:px-6 md:py-3 md:text-base"
                          >
                            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                            Read Full Story
                          </button>
                          <p className="font-garamond text-[0.82rem] italic text-amber-300/80 md:text-sm">
                            Chapter {currentMapYear + 1} of {arcEntries.length} &bull; {journey.location}
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
      </div>
    </section>
  )
}
