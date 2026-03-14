import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { archiveEntries } from "@/utils/content"

export const metadata: Metadata = {
  title: "Archive Entry",
}

interface ItemPageProps {
  params: {
    id: string
  }
}

export default function ItemPage({ params }: ItemPageProps) {
  const entry = archiveEntries.find((candidate) => candidate.id === params.id)

  const title = entry?.title ?? "Uncatalogued Scroll"
  const subtitle = entry?.subtitle ?? "This entry has not yet been fully written."
  const kindLabel = entry?.kindLabel ?? "Unknown Kind"
  const collectionLabel = entry?.collectionLabel ?? "Unsorted Shelves"
  const periodLabel = entry?.periodLabel ?? "Date to be inscribed"
  const preview = entry?.preview ?? "A placeholder entry. The full story of this scroll is still being drafted."
  const tags = entry?.tags ?? ["work in progress", "placeholder"]

  return (
    <div className="min-h-screen forest-campfire">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/40" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="medieval-button inline-flex items-center gap-2 rounded-lg px-5 py-2 font-garamond text-sm text-orange-100 transition-all duration-300 hover:ember-glow"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Hearth
          </Link>

          <div className="hidden flex-col items-end text-right font-garamond text-xs text-orange-200 md:flex">
            <span className="uppercase tracking-[0.18em]">Archive Entry</span>
            <span className="text-[0.7rem] italic opacity-80">{params.id}</span>
          </div>
        </div>

        <main className="section-safe-area parchment-safe relative mx-auto flex w-full flex-1 flex-col rounded-3xl border border-amber-200/30 bg-amber-50/80 p-6 shadow-2xl md:p-10">
          <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 scholar-parchment" />

          <div className="relative z-10 flex flex-1 flex-col gap-8">
            <header className="text-center">
              <p className="mb-3 inline-flex flex-wrap items-center justify-center gap-3 font-garamond text-xs uppercase tracking-[0.18em] text-amber-800">
                <span className="rounded-full bg-amber-100 px-3 py-1">{kindLabel}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">{collectionLabel}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">{periodLabel}</span>
              </p>

              <h1 className="map-sky-ink-strong font-cinzel text-3xl font-bold leading-tight md:text-4xl">{title}</h1>

              <p className="map-sky-ink mx-auto mt-4 max-w-2xl font-garamond text-base italic md:text-lg">
                {subtitle}
              </p>
            </header>

            <section className="scrollable-content parchment-safe mx-auto w-full max-w-2xl flex-1 overflow-y-auto rounded-2xl border border-amber-200/60 bg-white/70 p-5 md:p-7">
              <div className="space-y-5 font-garamond text-base leading-relaxed text-amber-900 md:text-lg">
                <p>{preview}</p>

                <p>
                  This is a <span className="font-semibold">placeholder version</span> of the entry. In the future, this
                  page will contain the full write-up, diagrams, links to code or manuscripts, and any additional
                  context that does not fit comfortably on the main scrolls.
                </p>

                <p>
                  For now, treat it as a promise that the work here will eventually be documented with the same care as
                  its implementation.
                </p>
              </div>
            </section>

            <footer className="mt-2 border-t border-amber-200 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-garamond text-amber-700 md:text-sm">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[0.7rem] uppercase tracking-[0.14em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="italic text-amber-600">
                  This entry is part of an ongoing effort to knit scattered work into a single, readable archive.
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

