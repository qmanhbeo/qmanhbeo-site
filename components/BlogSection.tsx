"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { noteEntries } from "@/content/entries"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"
import type { SectionSurface } from "@/utils/worldSections"
import InfiniteCarousel from "./ui/InfiniteCarousel"
import MobileSnapCarousel from "./ui/MobileSnapCarousel"
import SpellScroll from "./ui/SpellScroll"
import TavernTale from "./ui/TavernTale"

function readStoredIndex(storageKey: string, legacyKey?: string): number {
  try {
    const raw = sessionStorage.getItem(storageKey) ?? (legacyKey ? sessionStorage.getItem(legacyKey) : null) ?? ""
    const value = parseInt(raw, 10)
    return Number.isNaN(value) ? 0 : value
  } catch {
    return 0
  }
}

function saveStoredIndex(storageKey: string, index: number) {
  try {
    sessionStorage.setItem(storageKey, String(index))
  } catch {
    // noop
  }
}

interface BlogSectionProps {
  revealClassName?: string
  surface?: SectionSurface
}

export default function BlogSection({
  revealClassName = "",
  surface = "home",
}: BlogSectionProps) {
  const gap = 20
  const { shellRef, itemWidth } = useResponsiveCarouselWidth({ gap, minWidth: 240 })
  const router = useRouter()
  const isWorldPanel = surface === "world-panel"
  const originRoute = isWorldPanel ? "/world" : "/"
  const storageKey = isWorldPanel ? "carousel:blog:world" : "carousel:blog:home"
  const legacyStorageKey = isWorldPanel ? undefined : "carousel:notes"
  const [initialNoteIndex] = useState(() => {
    const pendingReturnState = readPendingReturnState(originRoute)
    if (pendingReturnState?.sourceSection === "blog") return pendingReturnState.sourceCarouselIndex ?? 0
    return readStoredIndex(storageKey, legacyStorageKey)
  })

  const handleIndexChange = useCallback((index: number) => {
    saveStoredIndex(storageKey, index)
  }, [storageKey])

  const handleTaleClick = useCallback(
    (slug: string, index: number) => {
      saveEntryOriginState({
        sourceRoute: originRoute,
        sourceSection: "blog",
        homeSectionIndex: getHomeSectionIndexForOrigin("blog"),
        sourceScrollY: typeof window === "undefined" ? 0 : window.scrollY,
        sourceCarouselIndex: index,
        itemSlug: slug,
      })

      router.push(`/item/${slug}`)
    },
    [originRoute, router],
  )

  return (
    <section
      className={
        isWorldPanel
          ? "relative flex h-full min-h-0 min-w-0 flex-col justify-center overflow-hidden"
          : "section-safe-area relative flex h-full min-w-full flex-col justify-center overflow-hidden"
      }
      style={isWorldPanel ? undefined : { scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div
        className={`${revealClassName} relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 ${isWorldPanel ? "py-5 sm:px-6" : "sm:px-8"}`}
      >
        <div className="flex-shrink-0 py-4 text-center md:py-6">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Campfire Notes</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Fragments from the workbench, the archive, and the road
          </p>
        </div>

        <div className={isWorldPanel ? "flex min-h-0 flex-1 items-center justify-center" : "flex h-[55dvh] min-h-[280px] items-center justify-center"}>
          <div className="map-ghost-panel relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-lg px-4 py-6 md:p-8">
            <div className={isWorldPanel ? "md:hidden" : "relative left-1/2 w-screen -translate-x-1/2 md:hidden"}>
              <MobileSnapCarousel
                items={noteEntries}
                initialIndex={initialNoteIndex}
                onActiveIndexChange={handleIndexChange}
                gap={18}
                itemWidth={isWorldPanel ? "100%" : "90vw"}
                className="pb-1"
                viewportClassName={isWorldPanel ? "" : "px-[5vw]"}
                renderItem={(note, index) => (
                  <SpellScroll
                    title={note.title}
                    description={note.excerpt}
                    runes={[note.dateLabel, note.noteLabel].filter((value): value is string => Boolean(value))}
                    presentation="mobile"
                    className="w-full"
                    onClick={() => handleTaleClick(note.slug, index)}
                  />
                )}
              />
            </div>

            <div ref={shellRef} className="hidden w-full min-h-0 overflow-visible py-2 md:block md:py-3">
              <InfiniteCarousel
                items={noteEntries}
                itemWidth={itemWidth}
                gap={gap}
                snap="left"
                itemAlign="center"
                initialIndex={initialNoteIndex}
                onActiveIndexChange={handleIndexChange}
                className="w-full scroll-fade-horizontal py-1 md:py-2"
                renderItem={(note, index) => (
                  <TavernTale
                    title={note.title}
                    excerpt={note.excerpt}
                    date={note.dateLabel ?? ""}
                    readTime={note.noteLabel}
                    className="w-full"
                    onClick={() => handleTaleClick(note.slug, index)}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
