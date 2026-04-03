"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { useBoundaryPagedScroll } from "@/hooks/useBoundaryPagedScroll"
import { publications, type Publication } from "@/utils/content"

const MANUSCRIPT_TRANSITION_MS = 800

interface PublicationsSectionProps {
  revealClassName?: string
}

function ManuscriptDetailCard({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-md border border-amber-200/60 bg-amber-50/50 p-4">
      <h5 className="map-sky-ink-strong mb-1.5 font-cinzel text-xs font-bold uppercase tracking-widest opacity-70">
        {label}
      </h5>
      <p className="font-garamond text-base leading-relaxed text-amber-900/80">{content}</p>
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
  pubs: Publication[]
}) {
  return (
    <div className="flex items-center gap-4 rounded-full bg-amber-100/90 px-4 py-2 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={onPrev}
        className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous manuscript"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex gap-2">
        {pubs.map((pub, index) => (
          <button
            key={pub.title}
            type="button"
            onClick={() => onGoTo(index)}
            className={`h-3 w-3 rounded-full transition-all duration-500 ${
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
        className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next manuscript"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function PublicationsSection({ revealClassName = "" }: PublicationsSectionProps) {
  const router = useRouter()
  const {
    currentIndex: currentManuscript,
    isTransitioning: isManuscriptScrolling,
    panelRefs,
    goToIndex: navigateToManuscript,
    goPrevious: navigateToPreviousManuscript,
    goNext: navigateToNextManuscript,
  } = useBoundaryPagedScroll({
    itemCount: publications.length,
    panelSelector: ".manuscript-scrollable-area",
    transitionMs: MANUSCRIPT_TRANSITION_MS,
  })

  return (
    <section
      className="relative flex h-full min-w-full flex-col justify-center overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-45" />

      <div className={`${revealClassName} relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-8`}>
        {/* Section header */}
        <div className="flex-shrink-0 py-4 md:py-6 text-center">
          <h2 className="map-sky-ink-strong font-cinzel text-4xl font-bold md:text-5xl">Scholar Scrolls</h2>
          <p className="map-sky-ink mx-auto max-w-2xl font-garamond text-lg italic">
            Manuscripts of scholarly wisdom, preserved in the digital scriptorium
          </p>
        </div>

        <div className="mb-2 h-[55dvh] min-h-[300px]">
          <div className="map-ghost-panel flex h-full flex-col overflow-hidden rounded-lg">

            {/* Mobile nav pill — in-flow above content */}
            <div className="md:hidden flex-shrink-0 flex justify-center px-4 pt-3 pb-1">
              <NavPill
                current={currentManuscript}
                isTransitioning={isManuscriptScrolling}
                onPrev={navigateToPreviousManuscript}
                onNext={navigateToNextManuscript}
                onGoTo={navigateToManuscript}
                pubs={publications}
              />
            </div>

            {/* Desktop nav pill — in-flow, right-aligned top bar */}
            <div className="hidden md:flex flex-shrink-0 justify-end px-6 pt-4 pb-1">
              <NavPill
                current={currentManuscript}
                isTransitioning={isManuscriptScrolling}
                onPrev={navigateToPreviousManuscript}
                onNext={navigateToNextManuscript}
                onGoTo={navigateToManuscript}
                pubs={publications}
              />
            </div>

            {/* Carousel track */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-800 ease-in-out"
                style={{ transform: `translateX(-${currentManuscript * 100}%)` }}
              >
                {publications.map((publication: Publication, index) => {
                  const archiveId = `publication-${index}`

                  return (
                    <div
                      key={publication.title}
                      ref={(element) => {
                        panelRefs.current[index] = element
                      }}
                      className="manuscript-scrollable-area paged-scroll-area scrollable-content scrollbar-fade h-full min-w-full overflow-y-auto px-6 pb-6 pt-2 md:px-10"
                    >
                      {/* Centered manuscript column */}
                      <div className="mx-auto max-w-3xl space-y-4">

                        {/* Title — no offset, fully centered */}
                        <div className="text-center">
                          <h3 className="map-sky-ink-strong font-cinzel text-2xl font-bold leading-tight md:text-3xl">
                            <span className="hidden md:inline map-sky-ink-strong illuminated-letter font-cinzel text-5xl leading-none">
                              {publication.title.charAt(0)}
                            </span>
                            <span className="md:hidden">{publication.title.charAt(0)}</span>
                            {publication.title.substring(1)}
                          </h3>
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                          <span className="font-garamond italic text-amber-700/80">
                            {publication.journal}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-amber-500/50 md:block" />
                          <span className="font-garamond text-amber-800/70">
                            Anno Domini {publication.year}
                          </span>
                          {publication.status && (
                            <>
                              <span className="hidden h-1 w-1 rounded-full bg-amber-500/50 md:block" />
                              <span className="rounded-full border border-amber-400/50 bg-amber-100/60 px-2.5 py-0.5 font-garamond text-sm text-amber-700">
                                {publication.status}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Abstract */}
                        {publication.abstract && (
                          <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-5">
                            <h4 className="map-sky-ink-strong mb-2 font-cinzel text-xs font-bold uppercase tracking-widest opacity-60">
                              Abstract
                            </h4>
                            <p className="font-garamond text-base italic leading-relaxed text-amber-800 md:text-lg">
                              {publication.abstract}
                            </p>
                          </div>
                        )}

                        {/* Detail grid — 2 col on desktop */}
                        {(publication.researchQuestion || publication.methodology || publication.keyFindings || publication.implications) && (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {publication.researchQuestion && (
                              <ManuscriptDetailCard label="Research Question" content={publication.researchQuestion} />
                            )}
                            {publication.methodology && (
                              <ManuscriptDetailCard label="Methodology" content={publication.methodology} />
                            )}
                            {publication.keyFindings && (
                              <ManuscriptDetailCard label="Key Findings" content={publication.keyFindings} />
                            )}
                            {publication.implications && (
                              <ManuscriptDetailCard label="Implications" content={publication.implications} />
                            )}
                          </div>
                        )}

                        {/* Keywords */}
                        {publication.keywords && publication.keywords.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2">
                            {publication.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="rounded-full border border-amber-300/70 bg-amber-100/40 px-3 py-1 font-garamond text-sm text-amber-700/80"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* CTA + folio line */}
                        <div className="flex flex-col items-center gap-3 border-t border-amber-300/50 pt-4">
                          <button
                            type="button"
                            onClick={() => router.push(`/item/${archiveId}`)}
                            className="inline-flex items-center gap-3 rounded-lg px-7 py-3 font-garamond text-base text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Read full manuscript
                          </button>
                          <p className="map-sky-ink font-garamond text-sm italic opacity-60">
                            Manuscript {currentManuscript + 1} of {publications.length}
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
