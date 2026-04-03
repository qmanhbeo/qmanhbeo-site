"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { noteEntries } from "@/content/entries"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"
import MobileSnapCarousel from "./ui/MobileSnapCarousel"
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
    return pendingReturnState?.sourceSection === "notes" ? pendingReturnState.sourceCarouselIndex ?? 0 : 0
  })

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

        <div className="h-[55dvh] min-h-[280px]">
          <div className="map-ghost-panel relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-visible px-4 py-6 md:px-10 md:py-10">
              <div className="relative left-1/2 w-screen -translate-x-1/2 md:hidden">
                <MobileSnapCarousel
                  items={noteEntries}
                  initialIndex={initialNoteIndex}
                  gap={16}
                  itemWidth="91vw"
                  className="pb-1"
                  viewportClassName="px-[4.5vw]"
                  renderItem={(note, index) => {
                    return (
                      <TavernTale
                        title={note.title}
                        excerpt={note.excerpt}
                        date={note.dateLabel ?? ""}
                        readTime={note.noteLabel}
                        presentation="mobile"
                        className="w-full"
                        onClick={() => handleTaleClick(note.slug, index)}
                      />
                    )
                  }}
                />
              </div>

              <div ref={shellRef} className="mx-auto hidden w-full max-w-5xl items-center justify-center overflow-visible py-2 md:flex md:py-3">
                <InfiniteCarousel
                  items={noteEntries}
                  itemWidth={itemWidth}
                  gap={gap}
                  snap="left"
                  itemAlign="center"
                  initialIndex={initialNoteIndex}
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
      </div>
    </section>
  )
}
