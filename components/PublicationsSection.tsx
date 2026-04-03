"use client"

import type { TouchEvent } from "react"
import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { publicationEntries, type PublicationEntry } from "@/content/entries"
import { useBoundaryPagedScroll } from "@/hooks/useBoundaryPagedScroll"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"

const MANUSCRIPT_TRANSITION_MS = 800

interface PublicationsSectionProps {
  revealClassName?: string
}

function ManuscriptDetailCard({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50/90 p-2.5 md:p-4">
      <h5 className="mb-1.5 font-cinzel text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-600 md:mb-2 md:text-xs md:tracking-widest">
        {label}
      </h5>
      <p className="font-garamond text-[0.95rem] leading-snug text-amber-950 md:text-base md:leading-relaxed">
        {content}
      </p>
    </div>
  )
}

function NavPill({
  current,
  isTransitioning,
  onPrev,
  onNext,
  onGoTo,
  pubs,
}: {
  current: number
  isTransitioning: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo: (i: number) => void
  pubs: PublicationEntry[]
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-amber-100/88 px-3 py-1.5 shadow-md backdrop-blur-sm md:gap-4 md:px-4 md:py-2 md:shadow-lg">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-full p-1.5 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50 md:p-2"
        aria-label="Previous manuscript"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>
      <div className="flex gap-1.5 md:gap-2">
        {pubs.map((pub, index) => (
          <button
            key={pub.title}
            type="button"
            onClick={() => onGoTo(index)}
            className={`h-2 w-2 rounded-full transition-all duration-500 md:h-3 md:w-3 ${
              current === index
                ? "scale-125 bg-amber-600 scholar-hover-glow"
                : "bg-amber-300 hover:scale-110 hover:bg-amber-400"
            }`}
            aria-label={`Go to manuscript ${pub.title}`}
            disabled={isTransitioning && current !== index}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="rounded-full p-1.5 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50 md:p-2"
        aria-label="Next manuscript"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>
    </div>
  )
}

export default function PublicationsSection({ revealClassName = "" }: PublicationsSectionProps) {
  const router = useRouter()
  const [initialPublicationRestoreState] = useState(() => {
    const pendingReturnState = readPendingReturnState("/")
    return pendingReturnState?.sourceSection === "publications"
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
    currentIndex: currentManuscript,
    isTransitioning: isManuscriptScrolling,
    panelRefs,
    goToIndex: navigateToManuscript,
    goPrevious: navigateToPreviousManuscript,
    goNext: navigateToNextManuscript,
  } = useBoundaryPagedScroll({
    itemCount: publicationEntries.length,
    panelSelector: ".manuscript-scrollable-area",
    transitionMs: MANUSCRIPT_TRANSITION_MS,
    initialIndex: initialPublicationRestoreState.initialIndex,
    initialPanelScrollTop: initialPublicationRestoreState.initialScrollTop,
  })
  const swipeTouchStartXRef = useRef<number | null>(null)
  const swipeTouchStartYRef = useRef<number | null>(null)

  const handlePublicationClick = useCallback(
    (slug: string) => {
      const activePanel = panelRefs.current[currentManuscript]

      saveEntryOriginState({
        sourceRoute: "/",
        sourceSection: "publications",
        homeSectionIndex: getHomeSectionIndexForOrigin("publications"),
        sourceScrollY: typeof window === "undefined" ? 0 : window.scrollY,
        sourceInternalScroll: activePanel?.scrollTop ?? 0,
        sourceChapterIndex: currentManuscript,
        itemSlug: slug,
      })

      router.push(`/item/${slug}`)
    },
    [currentManuscript, panelRefs, router],
  )

  const handleSwipeTouchStart = useCallback((event: TouchEvent) => {
    swipeTouchStartXRef.current = event.touches[0].clientX
    swipeTouchStartYRef.current = event.touches[0].clientY
  }, [])

  const handleSwipeTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (swipeTouchStartXRef.current === null || swipeTouchStartYRef.current === null) return

      const deltaX = swipeTouchStartXRef.current - event.changedTouches[0].clientX
      const deltaY = swipeTouchStartYRef.current - event.changedTouches[0].clientY

      swipeTouchStartXRef.current = null
      swipeTouchStartYRef.current = null

      if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 48) return

      if (deltaX > 0) navigateToNextManuscript()
      else navigateToPreviousManuscript()
    },
    [navigateToNextManuscript, navigateToPreviousManuscript],
  )

  const handleSwipeTouchCancel = useCallback(() => {
    swipeTouchStartXRef.current = null
    swipeTouchStartYRef.current = null
  }, [])

  return (
    <section
      className="section-safe-area relative flex h-full min-w-full flex-col justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-45" />

      <div className={`${revealClassName} relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-8`}>
        {/* Section header */}
        <div className="flex-shrink-0 py-2.5 text-center md:py-6">
          <h2 className="map-sky-ink-strong font-cinzel text-[2.15rem] font-bold leading-tight sm:text-4xl md:text-5xl">
            Scholar Scrolls
          </h2>
          <p className="map-sky-ink mx-auto mt-1 max-w-xl font-garamond text-[0.95rem] italic leading-snug sm:text-lg md:mt-0 md:max-w-2xl md:leading-normal">
            Manuscripts of scholarly wisdom, preserved in the digital scriptorium
          </p>
        </div>

        <div
          className="mb-2 flex h-[58dvh] min-h-[290px] flex-col md:h-[55dvh] md:min-h-[300px]"
          data-swipe-zone
          onTouchStart={handleSwipeTouchStart}
          onTouchEnd={handleSwipeTouchEnd}
          onTouchCancel={handleSwipeTouchCancel}
        >
          <div className="map-ghost-panel flex h-full flex-col overflow-hidden rounded-[1rem] md:rounded-lg">

            {/* Mobile nav pill — in-flow above content */}
            <div className="flex flex-shrink-0 justify-center px-4 pt-2 pb-1 md:hidden">
              <NavPill
                current={currentManuscript}
                isTransitioning={isManuscriptScrolling}
                onPrev={navigateToPreviousManuscript}
                onNext={navigateToNextManuscript}
                onGoTo={navigateToManuscript}
                pubs={publicationEntries}
              />
            </div>

            {/* Desktop nav pill — in-flow, right-aligned top bar */}
            <div className="hidden flex-shrink-0 justify-end px-6 pt-4 pb-1 md:flex">
              <NavPill
                current={currentManuscript}
                isTransitioning={isManuscriptScrolling}
                onPrev={navigateToPreviousManuscript}
                onNext={navigateToNextManuscript}
                onGoTo={navigateToManuscript}
                pubs={publicationEntries}
              />
            </div>

            {/* Carousel track */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-800 ease-in-out"
                style={{ transform: `translateX(-${currentManuscript * 100}%)` }}
              >
                {publicationEntries.map((publication: PublicationEntry, index) => {
                  return (
                    <div
                      key={publication.slug}
                      ref={(element) => {
                        panelRefs.current[index] = element
                      }}
                      className="manuscript-scrollable-area paged-scroll-area scrollable-content scrollbar-fade scroll-fade-vertical h-full min-w-full overflow-y-auto px-4 pb-4 pt-1 md:px-10 md:pb-6 md:pt-2"
                    >
                      {/* Centered manuscript column */}
                      <div className="mx-auto max-w-3xl space-y-3 md:space-y-4">

                        {/* Title — no offset, fully centered */}
                        <div className="text-center">
                          <h3 className="map-sky-ink-strong font-cinzel text-[1.65rem] font-bold leading-[1.15] md:text-3xl">
                            <span className="map-sky-ink-strong hidden font-cinzel text-5xl leading-none md:inline illuminated-letter">
                              {publication.title.charAt(0)}
                            </span>
                            <span className="md:hidden">{publication.title.charAt(0)}</span>
                            {publication.title.substring(1)}
                          </h3>
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm md:gap-x-4">
                          <span className="font-garamond italic text-amber-200">
                            {publication.journal}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-amber-400/60 md:block" />
                          <span className="font-garamond text-amber-300">
                            Anno Domini {publication.yearLabel}
                          </span>
                          {publication.status && (
                            <>
                              <span className="hidden h-1 w-1 rounded-full bg-amber-400/60 md:block" />
                              <span className="rounded-full border border-amber-400/70 bg-amber-900/40 px-2 py-0.5 font-garamond text-[0.78rem] text-amber-200 md:px-2.5 md:text-sm">
                                {publication.status}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Abstract */}
                        {publication.abstract && (
                          <div className="rounded-lg border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/80 p-3.5 md:p-5">
                            <h4 className="mb-1.5 font-cinzel text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-600 md:mb-2 md:text-xs md:tracking-widest">
                              Abstract
                            </h4>
                            <p className="font-garamond text-[0.98rem] italic leading-snug text-amber-950 md:text-lg md:leading-relaxed">
                              {publication.abstract}
                            </p>
                          </div>
                        )}

                        {/* Detail grid — 2 col on desktop */}
                        {(publication.researchQuestion || publication.methodology || publication.findings || publication.implications) && (
                          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
                            {publication.researchQuestion && (
                              <ManuscriptDetailCard label="Research Question" content={publication.researchQuestion} />
                            )}
                            {publication.methodology && (
                              <ManuscriptDetailCard label="Methodology" content={publication.methodology} />
                            )}
                            {publication.findings && (
                              <ManuscriptDetailCard label="Key Findings" content={publication.findings} />
                            )}
                            {publication.implications && (
                              <ManuscriptDetailCard label="Implications" content={publication.implications} />
                            )}
                          </div>
                        )}

                        {/* Keywords */}
                        {publication.tags.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                            {publication.tags.map((kw) => (
                              <span
                                key={kw}
                                className="rounded-full border border-amber-300/80 bg-amber-100/80 px-2.5 py-0.5 font-garamond text-[0.78rem] text-amber-800 md:px-3 md:py-1 md:text-sm"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* CTA + folio line */}
                        <div className="flex flex-col items-center gap-2.5 border-t border-amber-300/50 pt-3 md:gap-3 md:pt-4">
                          <button
                            type="button"
                            onClick={() => handlePublicationClick(publication.slug)}
                            className="inline-flex items-center gap-2.5 rounded-lg px-5 py-2.5 font-garamond text-sm text-orange-100 transition-all duration-300 medieval-button hover:ember-glow md:gap-3 md:px-7 md:py-3 md:text-base"
                          >
                            <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Read full manuscript
                          </button>
                          <p className="font-garamond text-xs italic text-amber-300/80 md:text-sm">
                            Manuscript {currentManuscript + 1} of {publicationEntries.length}
                          </p>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
