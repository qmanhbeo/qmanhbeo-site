"use client"

import { type RefObject, type UIEvent, useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import FocusTrap from "focus-trap-react"
import { useAudioContext } from "@/context/AudioContext"
import { ArrowLeft, BookOpen, Search, X } from "lucide-react"
import {
  getAllEntries,
  getEntryCollectionLabel,
  getEntryKindLabel,
  getEntryPeriodLabel,
  getEntryPreviewHeading,
  getEntryPreviewText,
  searchEntries,
} from "@/content/entries"
import {
  type ArchiveCodexMobileView,
  readArchiveCodexState,
  saveArchiveCodexState,
  saveEntryOriginState,
} from "@/utils/entryNavigation"

interface ArchiveCodexOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const pageSurfaceStyle = {
  background:
    "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.48) 0%, transparent 28%), radial-gradient(circle at 82% 76%, rgba(160,82,45,0.1) 0%, transparent 30%), linear-gradient(135deg, #f7ead2 0%, #efddb8 58%, #e3c48e 100%)",
  boxShadow: "inset 0 1px 0 rgba(255,248,232,0.65), inset 0 0 0 1px rgba(130,76,29,0.12)",
}

const allEntries = getAllEntries()

function CodexResultCards({
  entries,
  selectedSlug,
  onSelect,
}: {
  entries: typeof allEntries
  selectedSlug: string
  onSelect: (slug: string) => void
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-amber-800/15 bg-white/35 px-5 py-8 text-center">
        <div className="font-cinzel text-lg font-semibold text-amber-900">No scrolls found</div>
        <p className="mt-2 font-garamond italic text-amber-800">
          Try another phrase and the codex will search the shelves again.
        </p>
      </div>
    )
  }

  return entries.map((entry, index) => {
    const isSelected = entry.slug === selectedSlug

    return (
      <button
        key={entry.slug}
        type="button"
        onClick={() => onSelect(entry.slug)}
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
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100/75 px-3 py-1 font-cinzel text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-amber-900">
                {getEntryCollectionLabel(entry)}
              </span>
              <span className="font-garamond text-sm italic text-amber-700">{getEntryPeriodLabel(entry)}</span>
            </div>
            <h4 className="font-cinzel text-lg font-bold leading-snug text-amber-950">{entry.title}</h4>
            <p className="mt-1 font-garamond text-sm italic text-amber-800">{entry.subtitle}</p>
          </div>
        </div>
      </button>
    )
  })
}

function CodexEntryPreview({
  entry,
  onOpenEntry,
  scrollRef,
  onScroll,
  mobileBackButton,
}: {
  entry: (typeof allEntries)[number] | null
  onOpenEntry: () => void
  scrollRef: RefObject<HTMLDivElement | null>
  onScroll: (event: UIEvent<HTMLDivElement>) => void
  mobileBackButton?: React.ReactNode
}) {
  if (!entry) {
    return (
      <div className="flex flex-1 items-center justify-center text-center">
        <div>
          <div className="font-cinzel text-2xl font-semibold text-amber-900">No preview available</div>
          <p className="mt-3 max-w-md font-garamond text-lg italic text-amber-800">
            The search returned no matching scrolls. Adjust the query to reopen the shelves.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="scrollable-content scrollbar-fade min-h-0 flex-1 overflow-y-auto pb-4 pr-1"
      onScroll={onScroll}
    >
      {mobileBackButton}

      <div className="text-center">
        <h4 className="font-cinzel text-[1.7rem] font-bold leading-tight text-amber-950 md:text-3xl">{entry.title}</h4>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-garamond text-base text-amber-800">
          <span className="rounded-full bg-amber-100/70 px-4 py-2 italic">{getEntryKindLabel(entry)}</span>
          <span className="rounded-full bg-amber-100/70 px-4 py-2">{getEntryCollectionLabel(entry)}</span>
          <span className="rounded-full bg-amber-100/70 px-4 py-2">{getEntryPeriodLabel(entry)}</span>
        </div>

        <p className="mt-3 font-garamond text-[1rem] italic text-amber-800 md:mt-4 md:text-lg">{entry.subtitle}</p>
      </div>

      <div className="mt-8 rounded-[1.6rem] border border-amber-800/15 bg-white/40 p-6 shadow-[inset_0_1px_0_rgba(255,248,232,0.65)]">
        <div className="mb-3 font-cinzel text-lg font-semibold uppercase tracking-[0.12em] text-amber-900">
          {getEntryPreviewHeading(entry)}
        </div>
        <p className="font-garamond text-lg italic leading-relaxed text-amber-800">{getEntryPreviewText(entry)}</p>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-amber-800/15 bg-amber-50/60 p-5">
        <div className="mb-3 font-cinzel text-sm font-semibold uppercase tracking-[0.14em] text-amber-900">
          Shelf Marks
        </div>
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-amber-700/20 bg-white/45 px-3 py-1 font-garamond text-sm text-amber-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onOpenEntry}
          className="inline-flex items-center gap-3 rounded-lg px-8 py-4 font-garamond text-lg text-orange-100 transition-all duration-300 medieval-button hover:ember-glow"
        >
          <BookOpen className="h-5 w-5" />
          See full scroll
        </button>
      </div>
    </div>
  )
}

export default function ArchiveCodexOverlay({
  isOpen,
  onClose,
}: ArchiveCodexOverlayProps) {
  const router = useRouter()
  const { playSfx } = useAudioContext()
  const [initialArchiveState] = useState(() => readArchiveCodexState())
  const [selectedEntrySlug, setSelectedEntrySlug] = useState(
    initialArchiveState?.selectedEntrySlug || allEntries[0]?.slug || "",
  )
  const [searchQuery, setSearchQuery] = useState(initialArchiveState?.searchQuery ?? "")
  const [mobileView, setMobileView] = useState<ArchiveCodexMobileView>(initialArchiveState?.mobileView ?? "list")
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const leftPaneRef = useRef<HTMLDivElement | null>(null)
  const mobileListPaneRef = useRef<HTMLDivElement | null>(null)
  const rightPaneRef = useRef<HTMLDivElement | null>(null)
  const hasRestoredScrollPositionsRef = useRef(false)
  const lastKnownLeftPaneScrollRef = useRef(initialArchiveState?.leftPaneScrollTop ?? 0)
  const lastKnownRightPaneScrollRef = useRef(initialArchiveState?.rightPaneScrollTop ?? 0)

  const filteredEntries = searchEntries(searchQuery)
  const selectedEntry = filteredEntries.find((entry) => entry.slug === selectedEntrySlug) ?? filteredEntries[0] ?? null
  const activeEntrySlug = selectedEntry?.slug ?? selectedEntrySlug
  const selectedEntrySlugToOpen = selectedEntry?.slug ?? ""
  const visibleMobileView: ArchiveCodexMobileView = mobileView === "detail" && filteredEntries.length > 0 ? "detail" : "list"

  const persistCodexState = useCallback(
    (nextIsOpen = isOpen) => {
      const nextLeftPaneScrollTop = leftPaneRef.current?.scrollTop ?? lastKnownLeftPaneScrollRef.current
      const nextRightPaneScrollTop = rightPaneRef.current?.scrollTop ?? lastKnownRightPaneScrollRef.current

      lastKnownLeftPaneScrollRef.current = nextLeftPaneScrollTop
      lastKnownRightPaneScrollRef.current = nextRightPaneScrollTop

      saveArchiveCodexState({
        isOpen: nextIsOpen,
        searchQuery,
        selectedEntrySlug: activeEntrySlug,
        leftPaneScrollTop: nextLeftPaneScrollTop,
        rightPaneScrollTop: nextRightPaneScrollTop,
        mobileView: visibleMobileView,
      })
    },
    [activeEntrySlug, isOpen, searchQuery, visibleMobileView],
  )

  const handleClose = useCallback(() => {
    persistCodexState(false)
    onClose()
  }, [onClose, persistCodexState])

  const handleSelectDesktopEntry = useCallback((slug: string) => {
    playSfx("transition")
    setSelectedEntrySlug(slug)
  }, [playSfx])

  const handleSelectMobileEntry = useCallback(
    (slug: string) => {
      playSfx("transition")
      if (slug !== activeEntrySlug) {
        lastKnownRightPaneScrollRef.current = 0
      }

      setSelectedEntrySlug(slug)
      setMobileView("detail")
    },
    [activeEntrySlug, playSfx],
  )

  const handleBackToShelf = useCallback(() => {
    persistCodexState()
    setMobileView("list")
  }, [persistCodexState])

  const handleOpenEntry = () => {
    if (!selectedEntrySlugToOpen) return
    playSfx("open")

    saveArchiveCodexState({
      isOpen: true,
      searchQuery,
      selectedEntrySlug: selectedEntrySlugToOpen,
      leftPaneScrollTop: leftPaneRef.current?.scrollTop ?? lastKnownLeftPaneScrollRef.current,
      rightPaneScrollTop: rightPaneRef.current?.scrollTop ?? lastKnownRightPaneScrollRef.current,
      mobileView: visibleMobileView,
    })

    saveEntryOriginState({
      sourceRoute: "/",
      sourceSection: "archive",
      sourceScrollY: typeof window === "undefined" ? 0 : window.scrollY,
      sourceQuery: searchQuery,
      sourceSelectedSlug: selectedEntrySlugToOpen,
      sourceLeftPaneScrollTop: leftPaneRef.current?.scrollTop ?? lastKnownLeftPaneScrollRef.current,
      sourceRightPaneScrollTop: rightPaneRef.current?.scrollTop ?? lastKnownRightPaneScrollRef.current,
      codexWasOpen: true,
      itemSlug: selectedEntrySlugToOpen,
    })

    router.push(`/item/${selectedEntrySlugToOpen}`)
  }

  useEffect(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)

    if (isOpen) {
      const raf = window.requestAnimationFrame(() => {
        setIsVisible(true)
        setIsClosing(false)
        setIsAnimatingOpen(true)
      })

      return () => {
        window.cancelAnimationFrame(raf)
        if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
      }
    }

    if (!isVisible) return

    // Start close: reverse the book-page transforms, then unmount.
    const raf = window.requestAnimationFrame(() => {
      setIsClosing(true)
      setIsAnimatingOpen(false)
    })

    closeTimerRef.current = window.setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 600)

    return () => {
      window.cancelAnimationFrame(raf)
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [isOpen, isVisible])

  useEffect(() => {
    if (!isVisible) return

    const originalOverflow = document.body.style.overflow
    const originalOverscrollBehavior = document.body.style.overscrollBehavior
    const originalOverlayLock = document.body.dataset.overlayLock

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose()
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
  }, [handleClose, isVisible])

  useEffect(() => {
    persistCodexState(isOpen)
  }, [isOpen, persistCodexState])

  useEffect(() => {
    if (!isOpen) {
      hasRestoredScrollPositionsRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (!isVisible || hasRestoredScrollPositionsRef.current) return

    const savedCodexState = readArchiveCodexState()
    if (!savedCodexState) return

    const restoreScrollPositions = () => {
      if (leftPaneRef.current) {
        leftPaneRef.current.scrollTop = savedCodexState.leftPaneScrollTop
        lastKnownLeftPaneScrollRef.current = savedCodexState.leftPaneScrollTop
      }

      if (rightPaneRef.current) {
        rightPaneRef.current.scrollTop = savedCodexState.rightPaneScrollTop
        lastKnownRightPaneScrollRef.current = savedCodexState.rightPaneScrollTop
      }
    }

    hasRestoredScrollPositionsRef.current = true
    const frame = window.requestAnimationFrame(restoreScrollPositions)
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const frame = window.requestAnimationFrame(() => {
      if (visibleMobileView === "list") {
        if (mobileListPaneRef.current) mobileListPaneRef.current.scrollTop = lastKnownLeftPaneScrollRef.current
        if (leftPaneRef.current) leftPaneRef.current.scrollTop = lastKnownLeftPaneScrollRef.current
      }

      if (visibleMobileView === "detail" && rightPaneRef.current) {
        rightPaneRef.current.scrollTop = lastKnownRightPaneScrollRef.current
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [isVisible, selectedEntrySlug, visibleMobileView])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6"
      onClick={handleClose}
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <div
        className={`absolute inset-0 bg-slate-950/78 backdrop-blur-md ${
          isClosing ? "animate-out fade-out duration-500 fill-mode-both" : "animate-in fade-in duration-300"
        }`}
      />

      <FocusTrap active={isVisible} focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: false }}>
        <div
          className={`relative z-10 w-full max-w-6xl ${
            isClosing ? "animate-out fade-out duration-500 fill-mode-both" : "animate-in fade-in duration-300"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-codex-title"
          onClick={(event) => event.stopPropagation()}
          onWheelCapture={(event) => event.stopPropagation()}
        >
        <button
          type="button"
          onClick={handleClose}
          className="medieval-button absolute right-2.5 top-2.5 z-30 rounded-full p-2.5 text-orange-100 transition-all duration-300 hover:ember-glow md:right-3 md:top-3 md:p-3"
          aria-label="Close archive codex"
        >
          <X className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </button>

        <div
          className="relative flex h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] flex-col overflow-x-hidden overflow-y-auto rounded-[2.2rem] border border-amber-200/10 bg-gradient-to-br from-[#58290f]/95 via-[#30150b]/98 to-[#170c08]/98 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-[2.6rem] md:p-5"
          style={{ perspective: "2200px" }}
        >
          <div className="absolute inset-x-6 top-3 h-10 rounded-full bg-amber-100/6 blur-2xl md:inset-x-8 md:top-4 md:h-12" />
          <div className="absolute inset-y-6 left-1/2 z-20 hidden w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1a0d08] via-[#704324]/75 to-[#1a0d08] shadow-[0_0_24px_rgba(0,0,0,0.35)] md:block" />

          <div className="relative z-30 px-4 pb-2 pt-4 text-center md:px-10 md:pb-4 md:pt-8">
            <h3
              id="archive-codex-title"
              className="map-sky-ink-strong font-cinzel text-2xl font-bold leading-tight md:text-5xl md:leading-none"
            >
              The Archive Codex
            </h3>
            <p className="map-sky-ink mx-auto mt-2 line-clamp-2 max-w-3xl font-garamond text-sm italic leading-snug opacity-85 md:mt-3 md:line-clamp-none md:text-lg md:leading-normal md:opacity-100">
              Search the gathered shelves from the hearth. Journeys, manuscripts, spell scrolls, and campfire notes
              now rest in one codex.
            </p>
          </div>

          <div className="relative z-30 px-4 pb-3 md:px-10 md:pb-4">
            <div className="mx-auto max-w-3xl rounded-[1.2rem] border border-amber-100/15 bg-amber-50/70 p-3 shadow-[0_12px_28px_rgba(34,19,11,0.18)] md:rounded-[1.6rem] md:p-4">
              <label htmlFor="archive-codex-search" className="sr-only">
                Search the archive codex
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-700 md:left-4 md:h-5 md:w-5" />
                <input
                  id="archive-codex-search"
                  type="text"
                  placeholder="Search all scrolls, from journeys to notes..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-[0.95rem] border border-amber-700/20 bg-white/50 py-2.5 pl-10 pr-3 font-garamond text-base text-amber-950 outline-none transition-colors duration-200 placeholder:text-sm placeholder:text-amber-700/70 focus:border-amber-700/45 focus:bg-white/70 md:rounded-[1.2rem] md:py-3 md:pl-12 md:pr-4 md:text-lg md:placeholder:text-base"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 min-h-0 flex-1 md:overflow-hidden">
            <div className="md:hidden h-full min-h-0">
              {visibleMobileView === "list" ? (
                <section
                  className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-amber-900/15 p-6 transition-all duration-300 ${
                    isClosing ? "animate-out fade-out duration-200 fill-mode-both" : "animate-in fade-in duration-200"
                  }`}
                  style={pageSurfaceStyle}
                >
                  <div className="relative z-10 flex h-full min-h-0 flex-col">
                    <div className="mb-6 text-center">
                      <div className="font-cinzel text-sm font-semibold uppercase tracking-[0.16em] text-amber-900">
                        {filteredEntries.length} scroll{filteredEntries.length === 1 ? "" : "s"} found
                      </div>
                    </div>

                    <div
                      ref={mobileListPaneRef}
                      className="scrollable-content scrollbar-fade min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 pr-1"
                      onScroll={(event) => {
                        lastKnownLeftPaneScrollRef.current = event.currentTarget.scrollTop
                        persistCodexState()
                      }}
                    >
                      <CodexResultCards
                        entries={filteredEntries}
                        selectedSlug={selectedEntry?.slug ?? ""}
                        onSelect={handleSelectMobileEntry}
                      />
                    </div>
                  </div>
                </section>
              ) : (
                <section
                  className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-amber-900/15 p-6 transition-all duration-300 ${
                    isClosing ? "animate-out fade-out duration-200 fill-mode-both" : "animate-in fade-in duration-200"
                  }`}
                  style={pageSurfaceStyle}
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/10 to-transparent" />

                  <div className="relative z-10 flex h-full min-h-0 flex-col">
                    <CodexEntryPreview
                      entry={selectedEntry}
                      onOpenEntry={handleOpenEntry}
                      scrollRef={rightPaneRef}
                      onScroll={(event) => {
                        lastKnownRightPaneScrollRef.current = event.currentTarget.scrollTop
                        persistCodexState()
                      }}
                      mobileBackButton={
                        <button
                          type="button"
                          onClick={handleBackToShelf}
                          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-800/20 bg-white/45 px-4 py-2 font-garamond text-base text-amber-900 transition-colors duration-200 hover:bg-white/65"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to shelf
                        </button>
                      }
                    />
                  </div>
                </section>
              )}
            </div>

            <div className="hidden flex-col gap-4 md:flex md:h-full md:min-h-0 md:flex-row">
              <section
                className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-amber-900/15 p-6 transition-all duration-500 md:min-h-0 md:flex-1 md:basis-0 md:p-8"
                style={{
                  ...pageSurfaceStyle,
                  transformOrigin: "right center",
                  transform: isAnimatingOpen ? "rotateY(0deg) translateX(0)" : "rotateY(82deg) translateX(18%)",
                  opacity: isAnimatingOpen ? 1 : 0,
                }}
              >
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/10 to-transparent" />

                <div className="relative z-10 flex h-full min-h-0 flex-col">
                  <div className="mb-6 text-center">
                    <div className="font-cinzel text-sm font-semibold uppercase tracking-[0.16em] text-amber-900">
                      {filteredEntries.length} scroll{filteredEntries.length === 1 ? "" : "s"} found
                    </div>
                  </div>

                  <div
                    ref={leftPaneRef}
                    className="scrollable-content scrollbar-fade min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 pr-2"
                    onScroll={(event) => {
                      lastKnownLeftPaneScrollRef.current = event.currentTarget.scrollTop
                      persistCodexState()
                    }}
                  >
                    <CodexResultCards
                      entries={filteredEntries}
                      selectedSlug={selectedEntry?.slug ?? ""}
                      onSelect={handleSelectDesktopEntry}
                    />
                  </div>

                </div>
              </section>

              <section
                className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-amber-900/15 p-6 transition-all duration-500 md:min-h-0 md:flex-1 md:basis-0 md:p-8"
                style={{
                  ...pageSurfaceStyle,
                  transformOrigin: "left center",
                  transform: isAnimatingOpen ? "rotateY(0deg) translateX(0)" : "rotateY(-82deg) translateX(-18%)",
                  opacity: isAnimatingOpen ? 1 : 0,
                }}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/10 to-transparent" />

                <div className="relative z-10 flex h-full min-h-0 flex-col">
                  <CodexEntryPreview
                    entry={selectedEntry}
                    onOpenEntry={handleOpenEntry}
                    scrollRef={rightPaneRef}
                    onScroll={(event) => {
                      lastKnownRightPaneScrollRef.current = event.currentTarget.scrollTop
                      persistCodexState()
                    }}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      </FocusTrap>
    </div>
  )
}
