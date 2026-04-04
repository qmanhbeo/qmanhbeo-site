"use client"

import { useCallback, useState } from "react"

const STORAGE_KEY = "carousel:notes"
function readStoredIndex(): number {
  try {
    const v = parseInt(sessionStorage.getItem(STORAGE_KEY) ?? "", 10)
    return isNaN(v) ? 0 : v
  } catch { return 0 }
}
function saveStoredIndex(index: number) {
  try { sessionStorage.setItem(STORAGE_KEY, String(index)) } catch { /* noop */ }
}
import { useRouter } from "next/navigation"
import { noteEntries } from "@/content/entries"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"
import MobileSnapCarousel from "./ui/MobileSnapCarousel"
import SpellScroll from "./ui/SpellScroll"
import TavernTale from "./ui/TavernTale"
import InfiniteCarousel from "./ui/InfiniteCarousel"

interface BlogSectionProps {
  revealClassName?: string
}

export default function BlogSection({ revealClassName = "" }: BlogSectionProps) {
  const gap = 20
  const { shellRef, itemWidth } = useResponsiveCarouselWidth({ gap, minWidth: 240 })
  const router = useRouter()
  const [initialNoteIndex] = useState(() => {
    const pendingReturnState = readPendingReturnState("/")
    if (pendingReturnState?.sourceSection === "notes") return pendingReturnState.sourceCarouselIndex ?? 0
    return readStoredIndex()
  })

  const handleIndexChange = useCallback((index: number) => saveStoredIndex(index), [])

  const handleTaleClick = useCallback(
    (slug: string, index: number) => {
      saveEntryOriginState({
        sourceRoute: "/",
        sourceSection: "notes",
        homeSectionIndex: getHomeSectionIndexForOrigin("notes"),
        sourceScrollY: typeof window === "undefined" ? 0 : window.scrollY,
        sourceCarouselIndex: index,
        itemSlug: slug,
      })

      router.push(`/item/${slug}`)
    },
    [router],
  )

  return (
    <section
      className="section-safe-area relative flex h-full min-w-full flex-col justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className={`${revealClassName} relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-8`}>
        <div className="flex-shrink-0 py-4 md:py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Campfire Notes</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Fragments from the workbench, the archive, and the road
          </p>
        </div>

        <div className="flex h-[55dvh] min-h-[280px] items-center justify-center">
          <div className="map-ghost-panel relative flex w-full flex-col overflow-hidden rounded-lg px-4 py-6 md:p-8">
            <div className="relative left-1/2 w-screen -translate-x-1/2 md:hidden">
              <MobileSnapCarousel
                items={noteEntries}
                initialIndex={initialNoteIndex}
                onActiveIndexChange={handleIndexChange}
                gap={18}
                itemWidth="90vw"
                className="pb-1"
                viewportClassName="px-[5vw]"
                renderItem={(note, index) => {
                  return (
                    <SpellScroll
                      title={note.title}
                      description={note.excerpt}
                      runes={[note.dateLabel, note.noteLabel].filter((value): value is string => Boolean(value))}
                      presentation="mobile"
                      className="w-full"
                      onClick={() => handleTaleClick(note.slug, index)}
                    />
                  )
                }}
              />
            </div>

            <div ref={shellRef} className="hidden w-full overflow-visible py-2 md:block md:py-3">
              <InfiniteCarousel
                items={noteEntries}
                itemWidth={itemWidth}
                gap={gap}
                snap="left"
                itemAlign="center"
                initialIndex={initialNoteIndex}
                onActiveIndexChange={handleIndexChange}
                className="w-full scroll-fade-horizontal py-1 md:py-2"
                renderItem={(note, index) => {
                  return (
                    <TavernTale
                      title={note.title}
                      excerpt={note.excerpt}
                      date={note.dateLabel ?? ""}
                      readTime={note.noteLabel}
                      className="w-full"
                      onClick={() => handleTaleClick(note.slug, index)}
                    />
                  )
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
