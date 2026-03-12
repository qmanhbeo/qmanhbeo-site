"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpenText, LibraryBig, MoveRight, ScrollText, X } from "lucide-react"
import { publications, type Publication } from "@/utils/content"

interface ArchiveCodexOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const pageSurfaceStyle = {
  background:
    "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.48) 0%, transparent 28%), radial-gradient(circle at 82% 76%, rgba(160,82,45,0.1) 0%, transparent 30%), linear-gradient(135deg, #f7ead2 0%, #efddb8 58%, #e3c48e 100%)",
  boxShadow: "inset 0 1px 0 rgba(255,248,232,0.65), inset 0 0 0 1px rgba(130,76,29,0.12)",
}

export default function ArchiveCodexOverlay({ isOpen, onClose }: ArchiveCodexOverlayProps) {
  const [selectedPublication, setSelectedPublication] = useState<Publication>(publications[0])
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const animationFrame = window.requestAnimationFrame(() => {
      setIsAnimatingOpen(true)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalOverscrollBehavior = document.body.style.overscrollBehavior
    const originalOverlayLock = document.body.dataset.overlayLock

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "contain"
    document.body.dataset.overlayLock = "true"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscrollBehavior
      if (originalOverlayLock) {
        document.body.dataset.overlayLock = originalOverlayLock
      } else {
        delete document.body.dataset.overlayLock
      }
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <div className="absolute inset-0 bg-slate-950/78 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-6xl animate-in fade-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-codex-title"
        onClick={(event) => event.stopPropagation()}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="medieval-button absolute right-3 top-3 z-30 rounded-full p-3 text-orange-100 transition-all duration-300 hover:ember-glow"
          aria-label="Close archive codex"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className="relative overflow-hidden rounded-[2.6rem] border border-amber-200/10 bg-gradient-to-br from-[#58290f]/95 via-[#30150b]/98 to-[#170c08]/98 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:p-5"
          style={{ perspective: "2200px" }}
        >
          <div className="absolute inset-x-8 top-4 h-12 rounded-full bg-amber-100/6 blur-2xl" />
          <div className="absolute inset-y-6 left-1/2 z-20 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1a0d08] via-[#704324]/75 to-[#1a0d08] shadow-[0_0_24px_rgba(0,0,0,0.35)]" />

          <div className="relative z-10 mb-4 px-6 text-center md:mb-5">
            <h3 id="archive-codex-title" className="map-sky-ink-strong font-cinzel text-4xl font-bold md:text-5xl">
              The Archive Codex
            </h3>
            <p className="map-sky-ink mx-auto mt-3 max-w-3xl font-garamond text-lg italic">
              Open the gathered manuscripts at the hearth before stepping fully into the stacks.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section
              className="relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-amber-900/15 p-6 transition-all duration-500 md:p-8"
              style={{
                ...pageSurfaceStyle,
                transformOrigin: "right center",
                transform: isAnimatingOpen ? "rotateY(0deg) translateX(0)" : "rotateY(82deg) translateX(18%)",
                opacity: isAnimatingOpen ? 1 : 0,
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/10 to-transparent" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/65 px-4 py-2 text-amber-900">
                    <BookOpenText className="h-4 w-4" />
                    <span className="font-cinzel text-sm font-semibold tracking-[0.14em] uppercase">Table of Contents</span>
                  </div>
                  <p className="mt-3 font-garamond italic text-amber-800">
                    Choose a manuscript to preview inside the codex.
                  </p>
                </div>

                <div className="scrollable-content flex-1 space-y-3 overflow-y-auto pr-2">
                  {publications.map((publication, index) => {
                    const isSelected = publication.title === selectedPublication.title

                    return (
                      <button
                        key={publication.title}
                        type="button"
                        onClick={() => setSelectedPublication(publication)}
                        className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-300 ${
                          isSelected
                            ? "border-amber-700/45 bg-amber-100/75 shadow-[0_10px_24px_rgba(120,60,18,0.15)]"
                            : "border-amber-800/15 bg-white/35 hover:border-amber-700/30 hover:bg-white/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-sm font-cinzel font-bold text-amber-900">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-cinzel text-lg font-bold leading-snug text-amber-950">{publication.title}</h4>
                            <p className="mt-1 font-garamond text-sm italic text-amber-800">{publication.journal}</p>
                            <p className="mt-2 font-garamond text-sm text-amber-700">Anno Domini {publication.year}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-amber-800/15 bg-amber-50/65 px-5 py-4 text-center">
                  <div className="font-cinzel text-sm font-semibold uppercase tracking-[0.16em] text-amber-900">
                    {publications.length} manuscripts gathered
                  </div>
                  <p className="mt-2 font-garamond italic text-amber-800">
                    The full archive keeps the search tools and all manuscript cards intact.
                  </p>
                </div>
              </div>
            </section>

            <section
              className="relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-amber-900/15 p-6 transition-all duration-500 md:p-8"
              style={{
                ...pageSurfaceStyle,
                transformOrigin: "left center",
                transform: isAnimatingOpen ? "rotateY(0deg) translateX(0)" : "rotateY(-82deg) translateX(-18%)",
                opacity: isAnimatingOpen ? 1 : 0,
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/10 to-transparent" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/65 px-4 py-2 text-amber-900">
                    <ScrollText className="h-4 w-4" />
                    <span className="font-cinzel text-sm font-semibold tracking-[0.14em] uppercase">Selected Manuscript</span>
                  </div>

                  <h4 className="mt-5 font-cinzel text-3xl font-bold leading-tight text-amber-950">
                    {selectedPublication.title}
                  </h4>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-garamond text-base text-amber-800">
                    <span className="rounded-full bg-amber-100/70 px-4 py-2 italic">{selectedPublication.journal}</span>
                    <span className="rounded-full bg-amber-100/70 px-4 py-2">Anno Domini {selectedPublication.year}</span>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.6rem] border border-amber-800/15 bg-white/40 p-6 shadow-[inset_0_1px_0_rgba(255,248,232,0.65)]">
                  <div className="mb-3 font-cinzel text-lg font-semibold uppercase tracking-[0.12em] text-amber-900">
                    Abstract
                  </div>
                  <p className="font-garamond text-lg italic leading-relaxed text-amber-800">
                    {selectedPublication.abstract ?? "No abstract has been written on this leaf yet."}
                  </p>
                </div>

                <div className="mt-auto pt-8">
                  <div className="rounded-[1.6rem] border border-amber-800/15 bg-amber-50/60 p-5">
                    <div className="font-cinzel text-sm font-semibold uppercase tracking-[0.14em] text-amber-900">
                      Continue into the stacks
                    </div>
                    <p className="mt-2 font-garamond italic text-amber-800">
                      Open the full archive page for search, filtering, and the manuscript detail view.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href="/library"
                        className="medieval-button inline-flex items-center gap-3 rounded-full px-6 py-3 font-cinzel text-sm font-semibold uppercase tracking-[0.14em] text-orange-100 transition-all duration-300 hover:ember-glow"
                      >
                        <LibraryBig className="h-4 w-4" />
                        Open Full Archive
                        <MoveRight className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-white/35 px-5 py-3 font-cinzel text-sm font-semibold uppercase tracking-[0.14em] text-amber-900 transition-colors duration-300 hover:bg-white/55"
                      >
                        Keep Browsing Here
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
