"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Filter, ScrollText, Search } from "lucide-react"
import ScholarScroll from "@/components/ui/ScholarScroll"
import ScrollModal from "@/components/ui/ScrollModal"
import { publications, type Publication } from "@/utils/content"

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedScroll, setSelectedScroll] = useState<Publication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterYear, setFilterYear] = useState("all")

  const years = Array.from(new Set(publications.map((pub) => pub.year))).sort().reverse()

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      searchQuery === "" ||
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.journal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pub.abstract && pub.abstract.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesYear = filterYear === "all" || pub.year === filterYear

    return matchesSearch && matchesYear
  })

  const handleScrollClick = (publication: Publication) => {
    setSelectedScroll(publication)
    setIsModalOpen(true)
  }

  return (
    <div className="h-screen forest-campfire overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-shrink-0 px-8 py-6">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 medieval-button text-orange-100 px-6 py-3 rounded-lg font-garamond mb-6 hover:ember-glow transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Hearth
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-orange-100 font-cinzel">
              Archive of Scrolls
            </h1>
            <p className="text-lg md:text-xl text-orange-200 max-w-3xl mx-auto font-garamond italic leading-relaxed">
              Welcome to the scriptorium, where scholarly wisdom is preserved in digital parchment.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 mb-4">
          <div className="max-w-4xl mx-auto">
            <div className="library-search-bar p-4 rounded-lg shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Search the scrolls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-2 border-amber-300 focus:border-amber-600 outline-none font-garamond text-amber-900 placeholder-amber-500 rounded-lg"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-transparent border-2 border-amber-300 focus:border-amber-600 outline-none font-garamond text-amber-900 rounded-lg cursor-pointer"
                  >
                    <option value="all">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-center mb-4">
          <p className="text-amber-300 font-garamond italic">
            {filteredPublications.length} scroll{filteredPublications.length !== 1 ? "s" : ""} found in the archive
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scrollable-content px-8 min-h-0">
          <div className="max-w-7xl mx-auto pb-8">
            {filteredPublications.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublications.map((pub, index) => (
                  <div
                    key={index}
                    className="transform transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => handleScrollClick(pub)}
                  >
                    <ScholarScroll
                      title={pub.title}
                      journal={pub.journal}
                      year={pub.year}
                      abstract={pub.abstract ? `${pub.abstract.substring(0, 120)}...` : undefined}
                      className="h-full hover:scholar-hover-glow"
                    >
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-amber-600 font-garamond text-sm italic">Click to unfurl</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse animation-delay-200" />
                          <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse animation-delay-400" />
                        </div>
                      </div>
                    </ScholarScroll>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ScrollText className="mx-auto mb-4 h-16 w-16 text-amber-300" />
                <h3 className="text-2xl font-bold text-amber-300 mb-4 font-cinzel">No Scrolls Found</h3>
                <p className="text-amber-400 font-garamond italic">
                  The archive contains no scrolls matching your search. Try different keywords or clear your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-center py-6 border-t border-amber-600/30">
          <p className="text-amber-300 font-garamond italic">
            &quot;In the quiet halls of learning, wisdom whispers through ancient pages...&quot;
          </p>
        </div>
      </div>

      <ScrollModal publication={selectedScroll} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
