"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Filter, ScrollText, Search } from "lucide-react"
import {
  getEntryCollectionLabel,
  getEntryKindLabel,
  getEntryPeriodLabel,
  getEntryPreviewText,
  searchEntries,
  type EntryType,
} from "@/content/entries"

const entryTypes: Array<{ label: string; value: EntryType | "all" }> = [
  { label: "All Collections", value: "all" },
  { label: "Journeys", value: "arc" },
  { label: "Spell Scrolls", value: "project" },
  { label: "Scholar Scrolls", value: "publication" },
  { label: "Campfire Notes", value: "note" },
]

export default function LibraryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<EntryType | "all">("all")

  const filteredEntries = searchEntries(searchQuery).filter((entry) => filterType === "all" || entry.type === filterType)

  return (
    <div className="h-screen forest-campfire overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex-shrink-0 px-8 py-6">
          <div className="text-center">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-garamond medieval-button text-orange-100 transition-all duration-300 hover:ember-glow"
            >
              <ArrowLeft className="h-5 w-5" />
              Return to Hearth
            </Link>

            <h1 className="text-4xl font-bold text-orange-100 font-cinzel md:text-5xl lg:text-6xl">
              Archive Codex
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg font-garamond italic leading-relaxed text-orange-200 md:text-xl">
              The full codex in page form. Journeys, spell scrolls, manuscripts, and campfire notes all draw from the
              same shared shelves.
            </p>
          </div>
        </div>

        <div className="mb-4 flex-shrink-0 px-8">
          <div className="mx-auto max-w-5xl">
            <div className="library-search-bar rounded-lg p-4 shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Search the gathered shelves..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-lg border-2 border-amber-300 bg-transparent py-3 pl-12 pr-4 font-garamond text-amber-900 outline-none placeholder-amber-500 focus:border-amber-600"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />
                  <select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value as EntryType | "all")}
                    className="cursor-pointer rounded-lg border-2 border-amber-300 bg-transparent py-3 pl-10 pr-8 font-garamond text-amber-900 outline-none focus:border-amber-600"
                  >
                    {entryTypes.map((entryType) => (
                      <option key={entryType.value} value={entryType.value}>
                        {entryType.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex-shrink-0 text-center">
          <p className="font-garamond italic text-amber-300">
            {filteredEntries.length} scroll{filteredEntries.length !== 1 ? "s" : ""} found in the archive
          </p>
        </div>

        <div className="scrollable-content min-h-0 flex-1 overflow-y-auto px-8">
          <div className="mx-auto max-w-7xl pb-8">
            {filteredEntries.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEntries.map((entry) => (
                  <button
                    key={entry.slug}
                    type="button"
                    onClick={() => router.push(`/item/${entry.slug}`)}
                    className="group rounded-[1.75rem] border border-amber-200/20 bg-amber-50/75 p-6 text-left shadow-[0_18px_40px_rgba(34,19,11,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/60"
                  >
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100/90 px-3 py-1 font-cinzel text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-900">
                        {getEntryKindLabel(entry)}
                      </span>
                      <span className="rounded-full bg-white/60 px-3 py-1 font-garamond text-sm italic text-amber-700">
                        {getEntryPeriodLabel(entry)}
                      </span>
                    </div>

                    <h2 className="font-cinzel text-2xl font-bold leading-tight text-amber-950 transition-colors duration-300 group-hover:text-orange-800">
                      {entry.title}
                    </h2>
                    <p className="mt-2 font-garamond text-sm italic text-amber-700">{entry.subtitle}</p>
                    <p className="mt-4 line-clamp-4 font-garamond text-base leading-relaxed text-amber-900">
                      {getEntryPreviewText(entry)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-amber-700/15 bg-white/55 px-3 py-1 font-garamond text-sm text-amber-800">
                        {getEntryCollectionLabel(entry)}
                      </span>
                      {entry.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-amber-700/15 bg-white/55 px-3 py-1 font-garamond text-sm text-amber-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 font-garamond text-sm text-amber-800">
                      <BookOpen className="h-4 w-4" />
                      Open full scroll
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <ScrollText className="mx-auto mb-4 h-16 w-16 text-amber-300" />
                <h3 className="mb-4 font-cinzel text-2xl font-bold text-amber-300">No Scrolls Found</h3>
                <p className="font-garamond italic text-amber-400">
                  The codex contains no entries matching this search. Try another phrase or clear the filter.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-amber-600/30 py-6 text-center">
          <p className="font-garamond italic text-amber-300">
            &quot;In the quiet halls of learning, wisdom whispers through ancient pages...&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
