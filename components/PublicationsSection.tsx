"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { publications, type Publication } from "@/utils/content"

const MANUSCRIPT_TRANSITION_MS = 800

export default function PublicationsSection() {
  const [currentManuscript, setCurrentManuscript] = useState(0)
  const [isManuscriptScrolling, setIsManuscriptScrolling] = useState(false)

  const currentManuscriptRef = useRef(0)
  const isManuscriptScrollingRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    currentManuscriptRef.current = currentManuscript
  }, [currentManuscript])

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
  }, [])

  const navigateToManuscript = useCallback(
    (manuscriptIndex: number) => {
      if (isManuscriptScrollingRef.current) return

      const normalizedIndex = (manuscriptIndex + publications.length) % publications.length
      isManuscriptScrollingRef.current = true
      setIsManuscriptScrolling(true)
      setCurrentManuscript(normalizedIndex)

      clearTransitionTimeout()
      transitionTimeoutRef.current = window.setTimeout(() => {
        isManuscriptScrollingRef.current = false
        setIsManuscriptScrolling(false)
        transitionTimeoutRef.current = null
      }, MANUSCRIPT_TRANSITION_MS)
    },
    [clearTransitionTimeout],
  )

  const navigateToPreviousManuscript = useCallback(() => {
    navigateToManuscript(currentManuscriptRef.current - 1)
  }, [navigateToManuscript])

  const navigateToNextManuscript = useCallback(() => {
    navigateToManuscript(currentManuscriptRef.current + 1)
  }, [navigateToManuscript])

  useEffect(() => {
    const handleManuscriptWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement
      const manuscriptContent = target.closest(".manuscript-scrollable-area")
      if (!(manuscriptContent instanceof HTMLElement)) return

      if (isManuscriptScrollingRef.current) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      const isAtTop = manuscriptContent.scrollTop <= 0
      const isAtBottom =
        manuscriptContent.scrollTop >= manuscriptContent.scrollHeight - manuscriptContent.clientHeight - 1

      if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        if (event.deltaY > 0) {
          navigateToNextManuscript()
        } else {
          navigateToPreviousManuscript()
        }
      }
    }

    document.addEventListener("wheel", handleManuscriptWheel, { passive: false, capture: true })
    return () => {
      document.removeEventListener("wheel", handleManuscriptWheel, true)
    }
  }, [navigateToNextManuscript, navigateToPreviousManuscript])

  useEffect(() => {
    return () => {
      clearTransitionTimeout()
    }
  }, [clearTransitionTimeout])

  return (
    <section
      className="relative flex h-full min-w-full flex-col overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-45" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8">
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Scholar Scrolls</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Manuscripts of scholarly wisdom, preserved in the digital scriptorium
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <div className="scholar-parchment relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-full bg-amber-100/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              <button
                type="button"
                onClick={navigateToPreviousManuscript}
                className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous manuscript"
                disabled={isManuscriptScrolling}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                {publications.map((publication, index) => (
                  <button
                    key={publication.title}
                    type="button"
                    onClick={() => navigateToManuscript(index)}
                    className={`h-3 w-3 rounded-full transition-all duration-500 ${
                      currentManuscript === index
                        ? "scale-125 bg-amber-600 scholar-hover-glow"
                        : "bg-amber-300 hover:scale-110 hover:bg-amber-400"
                    }`}
                    aria-label={`Go to manuscript ${publication.title}`}
                    disabled={isManuscriptScrolling && currentManuscript !== index}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={navigateToNextManuscript}
                className="scale-75 rounded-full p-2 text-orange-100 transition-all duration-300 medieval-button hover:ember-glow disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next manuscript"
                disabled={isManuscriptScrolling}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-800 ease-in-out"
                style={{ transform: `translateX(-${currentManuscript * 100}%)` }}
              >
                {publications.map((publication: Publication) => {
                  const hasReadableLink = Boolean(publication.link && publication.link !== "#")

                  return (
                    <div key={publication.title} className="h-full min-w-full p-8">
                      <div className="manuscript-scrollable-area scrollable-content mx-auto h-full max-w-4xl overflow-y-auto">
                        <div className="space-y-6 pb-8 text-center">
                          <div className="mb-8">
                            <h3 className="mb-6 font-cinzel text-3xl font-bold leading-tight text-amber-900 md:text-4xl">
                              <span className="illuminated-letter mr-2 font-cinzel text-6xl leading-none text-amber-700">
                                {publication.title.charAt(0)}
                              </span>
                              {publication.title.substring(1)}
                            </h3>
                          </div>

                          <div className="mb-8 flex flex-col items-center justify-center gap-6 md:flex-row">
                            <div className="flex items-center gap-2">
                              <span className="font-garamond font-semibold text-amber-700">Journal:</span>
                              <span className="font-garamond text-lg italic text-amber-800">
                                {publication.journal}
                              </span>
                            </div>
                            <div className="hidden h-2 w-2 rounded-full bg-amber-600 opacity-60 md:block" />
                            <div className="flex items-center gap-2">
                              <span className="font-garamond font-semibold text-amber-700">Year:</span>
                              <span className="font-garamond text-lg text-amber-800">
                                Anno Domini {publication.year}
                              </span>
                            </div>
                          </div>

                          {publication.abstract && (
                            <div className="mb-8">
                              <h4 className="mb-4 font-cinzel text-xl font-bold text-amber-900">Abstract</h4>
                              <div className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                                <p className="font-garamond text-lg italic leading-relaxed text-amber-800">
                                  {publication.abstract}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="mb-8">
                            <h4 className="mb-4 font-cinzel text-xl font-bold text-amber-900">Research Context</h4>
                            <div className="mx-auto max-w-3xl rounded-lg border-l-4 border-amber-600 bg-amber-50 p-6">
                              <p className="mb-4 font-garamond leading-relaxed text-amber-800">
                                This manuscript represents a significant contribution to the field, building upon
                                centuries of scholarly tradition while embracing modern methodologies. The research
                                methodology employed combines rigorous analytical frameworks with innovative approaches to
                                data interpretation.
                              </p>
                              <p className="mb-4 font-garamond leading-relaxed text-amber-800">
                                The theoretical foundation draws from interdisciplinary perspectives, incorporating
                                insights from multiple domains to create a comprehensive understanding of the subject
                                matter. This holistic approach enables a more nuanced analysis of complex phenomena.
                              </p>
                              <p className="font-garamond leading-relaxed text-amber-800">
                                Furthermore, the practical implications of this research extend beyond academic discourse,
                                offering valuable insights for practitioners and policymakers working in related fields.
                              </p>
                            </div>
                          </div>

                          <div className="mb-8">
                            <h4 className="mb-4 font-cinzel text-xl font-bold text-amber-900">Key Contributions</h4>
                            <div className="mx-auto max-w-3xl space-y-4">
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  • Novel theoretical framework for understanding complex interdisciplinary relationships
                                  and their implications for future research directions.
                                </p>
                              </div>
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  • Empirical validation through comprehensive data analysis and case studies spanning
                                  multiple contexts and environments.
                                </p>
                              </div>
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  • Practical implications for policy development and implementation strategies in
                                  contemporary organizational settings.
                                </p>
                              </div>
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  • Methodological innovations that can be applied to similar research questions in
                                  related fields of study.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mb-8">
                            <h4 className="mb-4 font-cinzel text-xl font-bold text-amber-900">Research Methodology</h4>
                            <div className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                              <p className="mb-4 font-garamond leading-relaxed text-amber-800">
                                The research employs a mixed-methods approach, combining quantitative analysis with
                                qualitative insights to provide a comprehensive understanding of the phenomena under
                                investigation. Data collection involved multiple phases and diverse sources.
                              </p>
                              <p className="mb-4 font-garamond leading-relaxed text-amber-800">
                                Statistical analysis was conducted using advanced computational methods, ensuring robust
                                and reliable results. The qualitative component involved in-depth interviews and
                                ethnographic observations to capture nuanced perspectives.
                              </p>
                              <p className="font-garamond leading-relaxed text-amber-800">
                                Ethical considerations were paramount throughout the research process, with all
                                procedures approved by relevant institutional review boards and conducted in accordance
                                with established guidelines.
                              </p>
                            </div>
                          </div>

                          <div className="mb-8 text-center">
                            {hasReadableLink ? (
                              <a
                                href={publication.link}
                                className="inline-flex items-center gap-3 rounded-lg px-8 py-4 font-garamond text-lg text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
                              >
                                <ExternalLink className="h-5 w-5" />
                                Read Manuscript
                              </a>
                            ) : (
                              <button
                                type="button"
                                className="inline-flex cursor-not-allowed items-center gap-3 rounded-lg px-8 py-4 font-garamond text-lg text-orange-100 opacity-50 medieval-button"
                                disabled
                              >
                                <ExternalLink className="h-5 w-5" />
                                Manuscript Unavailable
                              </button>
                            )}
                          </div>

                          <div className="border-t border-amber-300 pt-6 text-center">
                            <p className="font-garamond italic text-amber-700">
                              Manuscript {currentManuscript + 1} of {publications.length} • {publication.year}
                            </p>
                          </div>
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
