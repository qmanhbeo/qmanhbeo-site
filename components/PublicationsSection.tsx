"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { useBoundaryPagedScroll } from "@/hooks/useBoundaryPagedScroll"
import { publications, type Publication } from "@/utils/content"

const MANUSCRIPT_TRANSITION_MS = 800

interface PublicationsSectionProps {
  revealClassName?: string
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
      className="relative flex h-full min-w-full flex-col overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-45" />

      <div className={`${revealClassName} relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8`}>
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="map-sky-ink-strong font-cinzel text-4xl font-bold md:text-5xl">Scholar Scrolls</h2>
          <p className="map-sky-ink mx-auto max-w-2xl font-garamond text-lg italic">
            Manuscripts of scholarly wisdom, preserved in the digital scriptorium
          </p>
        </div>

        <div className="mb-4 min-h-0 flex-1">
          <div className="map-ghost-panel relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-full bg-amber-100 px-4 py-2 shadow-lg">
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
                {publications.map((publication: Publication, index) => {
                  const archiveId = `publication-${index}`

                  return (
                    <div
                      key={publication.title}
                      ref={(element) => {
                        panelRefs.current[index] = element
                      }}
                      className="manuscript-scrollable-area paged-scroll-area scrollable-content scrollbar-fade h-full min-w-full overflow-y-auto p-8"
                    >
                      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center">
                        <div className="space-y-6 pb-8 text-center">
                          <div className="mb-8">
                            <h3 className="map-sky-ink-strong mb-6 font-cinzel text-3xl font-bold leading-tight md:text-4xl">
                              <span className="map-sky-ink-strong illuminated-letter mr-2 font-cinzel text-6xl leading-none">
                                {publication.title.charAt(0)}
                              </span>
                              {publication.title.substring(1)}
                            </h3>
                          </div>

                          <div className="mb-8 flex flex-col items-center justify-center gap-6 md:flex-row">
                            <div className="flex items-center gap-2">
                              <span className="map-sky-ink-strong font-garamond font-semibold">Journal:</span>
                              <span className="map-sky-ink font-garamond text-lg italic">
                                {publication.journal}
                              </span>
                            </div>
                            <div className="hidden h-2 w-2 rounded-full bg-amber-600 opacity-60 md:block" />
                            <div className="flex items-center gap-2">
                              <span className="map-sky-ink-strong font-garamond font-semibold">Year:</span>
                              <span className="map-sky-ink font-garamond text-lg">
                                Anno Domini {publication.year}
                              </span>
                            </div>
                          </div>

                          {publication.abstract && (
                            <div className="mb-8">
                              <h4 className="map-sky-ink-strong mb-4 font-cinzel text-xl font-bold">Abstract</h4>
                              <div className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                                <p className="font-garamond text-lg italic leading-relaxed text-amber-800">
                                  {publication.abstract}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="mb-8">
                            <h4 className="map-sky-ink-strong mb-4 font-cinzel text-xl font-bold">Research Context</h4>
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
                            <h4 className="map-sky-ink-strong mb-4 font-cinzel text-xl font-bold">Key Contributions</h4>
                            <div className="mx-auto max-w-3xl space-y-4">
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  &bull; Novel theoretical framework for understanding complex interdisciplinary
                                  relationships and their implications for future research directions.
                                </p>
                              </div>
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  &bull; Empirical validation through comprehensive data analysis and case studies
                                  spanning multiple contexts and environments.
                                </p>
                              </div>
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  &bull; Practical implications for policy development and implementation strategies in
                                  contemporary organizational settings.
                                </p>
                              </div>
                              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <p className="font-garamond leading-relaxed text-amber-800">
                                  &bull; Methodological innovations that can be applied to similar research questions in
                                  related fields of study.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mb-8">
                            <h4 className="map-sky-ink-strong mb-4 font-cinzel text-xl font-bold">
                              Research Methodology
                            </h4>
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
                            <button
                              type="button"
                              onClick={() => router.push(`/item/${archiveId}`)}
                              className="inline-flex items-center gap-3 rounded-lg px-8 py-4 font-garamond text-lg text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
                            >
                              <ExternalLink className="h-5 w-5" />
                              See full manuscript
                            </button>
                          </div>
                        </div>

                        <div className="mt-8 border-t border-amber-300 pt-6 text-center">
                          <p className="map-sky-ink font-garamond italic">
                            Manuscript {currentManuscript + 1} of {publications.length} &bull; {publication.year}
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
