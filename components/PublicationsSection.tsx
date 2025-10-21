"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { publications } from "@/utils/content"
import ScrollModal from "./ui/ScrollModal"

interface Publication {
  title: string
  journal: string
  year: string
  abstract?: string
  link?: string
}

export default function PublicationsSection() {
  const [selectedScroll, setSelectedScroll] = useState<Publication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentManuscript, setCurrentManuscript] = useState(0)
  const [isManuscriptScrolling, setIsManuscriptScrolling] = useState(false)

  const handleScrollClick = (publication: Publication) => {
    setSelectedScroll(publication)
    setIsModalOpen(true)
  }

  const navigateToManuscript = (manuscriptIndex: number) => {
    if (isManuscriptScrolling) return
    setIsManuscriptScrolling(true)
    setCurrentManuscript(manuscriptIndex)
    setTimeout(() => setIsManuscriptScrolling(false), 800)
  }

  // Add wheel event listener for manuscript navigation with boundary detection
  useEffect(() => {
    const handleManuscriptWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement

      // Check if we're inside a manuscript content div
      const manuscriptContent = target.closest(".manuscript-scrollable-area")
      if (!manuscriptContent) return

      const scrollContainer = manuscriptContent as HTMLElement
      const isAtTop = scrollContainer.scrollTop === 0
      const isAtBottom = scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight - 1

      // Only handle horizontal navigation if we're at scroll boundaries
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        if (e.deltaY > 0) {
          // Scrolling down at bottom - go to next manuscript
          navigateToManuscript((currentManuscript + 1) % publications.length)
        } else {
          // Scrolling up at top - go to previous manuscript
          navigateToManuscript(currentManuscript === 0 ? publications.length - 1 : currentManuscript - 1)
        }
      }
      // If not at boundaries, allow normal vertical scrolling (do nothing)
    }

    // Add event listener to document to catch all wheel events
    document.addEventListener("wheel", handleManuscriptWheel, { passive: false, capture: true })

    return () => {
      document.removeEventListener("wheel", handleManuscriptWheel, { capture: true })
    }
  }, [currentManuscript, isManuscriptScrolling])

  return (
    <section
      className="min-w-full h-full flex flex-col relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-45" />

      <div className="relative z-10 px-8 max-w-7xl w-full h-full flex flex-col mx-auto">
        {/* Header */}
        <div className="text-center py-6 flex-shrink-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-2 text-orange-100 font-cinzel">Scholar Scrolls</h2>
          <p className="text-lg text-orange-200 max-w-2xl mx-auto font-garamond italic">
            Manuscripts of scholarly wisdom, preserved in the digital scriptorium
          </p>
        </div>

        {/* Wide Manuscript Box */}
        <div className="flex-1 min-h-0">
          <div className="scholar-parchment rounded-lg h-full flex flex-col overflow-hidden relative">
            {/* Sticky Navigation Dots - Top Right */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-amber-100/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <button
                onClick={() =>
                  navigateToManuscript(currentManuscript === 0 ? publications.length - 1 : currentManuscript - 1)
                }
                className="medieval-button rounded-full p-2 text-orange-100 hover:ember-glow transition-all duration-300 scale-75"
                aria-label="Previous manuscript"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Manuscript Navigation Dots */}
              <div className="flex gap-2">
                {publications.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToManuscript(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      currentManuscript === index
                        ? "bg-amber-600 scholar-hover-glow scale-125"
                        : "bg-amber-300 hover:bg-amber-400 hover:scale-110"
                    }`}
                    aria-label={`Go to manuscript ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => navigateToManuscript((currentManuscript + 1) % publications.length)}
                className="medieval-button rounded-full p-2 text-orange-100 hover:ember-glow transition-all duration-300 scale-75"
                aria-label="Next manuscript"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Manuscript Content */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-800 ease-in-out"
                style={{ transform: `translateX(-${currentManuscript * 100}%)` }}
              >
                {publications.map((publication, index) => (
                  <div key={index} className="min-w-full h-full p-8">
                    {/* This is the scrollable content area */}
                    <div className="h-full max-w-4xl mx-auto overflow-y-auto scrollable-content manuscript-scrollable-area">
                      <div className="text-center space-y-6 pb-8">
                        {/* Inline Illuminated Title */}
                        <div className="mb-8">
                          <h3 className="text-3xl md:text-4xl font-bold text-amber-900 font-cinzel leading-tight mb-6">
                            <span className="illuminated-letter text-6xl font-cinzel text-amber-700 leading-none mr-2">
                              {publication.title.charAt(0)}
                            </span>
                            {publication.title.substring(1)}
                          </h3>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-700 font-garamond font-semibold">Journal:</span>
                            <span className="text-amber-800 font-garamond italic text-lg">{publication.journal}</span>
                          </div>
                          <div className="hidden md:block w-2 h-2 bg-amber-600 rounded-full opacity-60" />
                          <div className="flex items-center gap-2">
                            <span className="text-amber-700 font-garamond font-semibold">Year:</span>
                            <span className="text-amber-800 font-garamond text-lg">Anno Domini {publication.year}</span>
                          </div>
                        </div>

                        {/* Abstract */}
                        {publication.abstract && (
                          <div className="mb-8">
                            <h4 className="text-xl font-bold text-amber-900 font-cinzel mb-4">Abstract</h4>
                            <div className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <p className="text-amber-800 font-garamond leading-relaxed text-lg italic">
                                {publication.abstract}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Additional Content Section for Future Use */}
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-amber-900 font-cinzel mb-4">Research Context</h4>
                          <div className="max-w-3xl mx-auto p-6 bg-amber-50 rounded-lg border-l-4 border-amber-600">
                            <p className="text-amber-800 font-garamond leading-relaxed mb-4">
                              This manuscript represents a significant contribution to the field, building upon
                              centuries of scholarly tradition while embracing modern methodologies. The research
                              methodology employed combines rigorous analytical frameworks with innovative approaches to
                              data interpretation.
                            </p>
                            <p className="text-amber-800 font-garamond leading-relaxed mb-4">
                              The theoretical foundation draws from interdisciplinary perspectives, incorporating
                              insights from multiple domains to create a comprehensive understanding of the subject
                              matter. This holistic approach enables a more nuanced analysis of complex phenomena.
                            </p>
                            <p className="text-amber-800 font-garamond leading-relaxed">
                              Furthermore, the practical implications of this research extend beyond academic discourse,
                              offering valuable insights for practitioners and policymakers working in related fields.
                            </p>
                          </div>
                        </div>

                        {/* Key Findings Section */}
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-amber-900 font-cinzel mb-4">Key Contributions</h4>
                          <div className="max-w-3xl mx-auto space-y-4">
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <p className="text-amber-800 font-garamond leading-relaxed">
                                • Novel theoretical framework for understanding complex interdisciplinary relationships
                                and their implications for future research directions.
                              </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <p className="text-amber-800 font-garamond leading-relaxed">
                                • Empirical validation through comprehensive data analysis and case studies spanning
                                multiple contexts and environments.
                              </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <p className="text-amber-800 font-garamond leading-relaxed">
                                • Practical implications for policy development and implementation strategies in
                                contemporary organizational settings.
                              </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <p className="text-amber-800 font-garamond leading-relaxed">
                                • Methodological innovations that can be applied to similar research questions in
                                related fields of study.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Methodology Section */}
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-amber-900 font-cinzel mb-4">Research Methodology</h4>
                          <div className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                            <p className="text-amber-800 font-garamond leading-relaxed mb-4">
                              The research employs a mixed-methods approach, combining quantitative analysis with
                              qualitative insights to provide a comprehensive understanding of the phenomena under
                              investigation. Data collection involved multiple phases and diverse sources.
                            </p>
                            <p className="text-amber-800 font-garamond leading-relaxed mb-4">
                              Statistical analysis was conducted using advanced computational methods, ensuring robust
                              and reliable results. The qualitative component involved in-depth interviews and
                              ethnographic observations to capture nuanced perspectives.
                            </p>
                            <p className="text-amber-800 font-garamond leading-relaxed">
                              Ethical considerations were paramount throughout the research process, with all procedures
                              approved by relevant institutional review boards and conducted in accordance with
                              established guidelines.
                            </p>
                          </div>
                        </div>

                        {/* Read Manuscript Button */}
                        <div className="text-center mb-8">
                          {publication.link ? (
                            <a
                              href={publication.link}
                              className="medieval-button text-orange-100 px-8 py-4 rounded-lg font-garamond inline-flex items-center gap-3 text-lg hover:ember-glow transition-all duration-300"
                            >
                              <ExternalLink className="w-5 h-5" />
                              Read Manuscript
                            </a>
                          ) : (
                            <button
                              className="medieval-button text-orange-100 px-8 py-4 rounded-lg font-garamond inline-flex items-center gap-3 text-lg opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <ExternalLink className="w-5 h-5" />
                              Manuscript Unavailable
                            </button>
                          )}
                        </div>

                        {/* Manuscript Progress Indicator */}
                        <div className="text-center pt-6 border-t border-amber-300">
                          <p className="text-amber-700 font-garamond italic">
                            Manuscript {currentManuscript + 1} of {publications.length} • {publication.year}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Modal */}
        <ScrollModal publication={selectedScroll} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </section>
  )
}
