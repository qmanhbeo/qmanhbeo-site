"use client"

import { useCallback, useState } from "react"

const STORAGE_KEY = "carousel:projects"
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
import { ScrollText, Sparkles } from "lucide-react"
import { projectEntries } from "@/content/entries"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"
import MobileSnapCarousel from "./ui/MobileSnapCarousel"
import SpellScroll from "./ui/SpellScroll"
import InfiniteCarousel from "./ui/InfiniteCarousel"

interface ProjectsSectionProps {
  revealClassName?: string
}

export default function ProjectsSection({ revealClassName = "" }: ProjectsSectionProps) {
  const gap = 20
  const { shellRef, itemWidth } = useResponsiveCarouselWidth({ gap, minWidth: 240 })
  const router = useRouter()
  const [initialProjectIndex] = useState(() => {
    const pendingReturnState = readPendingReturnState("/")
    if (pendingReturnState?.sourceSection === "projects") return pendingReturnState.sourceCarouselIndex ?? 0
    return readStoredIndex()
  })

  const handleIndexChange = useCallback((index: number) => saveStoredIndex(index), [])

  const handleProjectClick = useCallback(
    (slug: string, index: number) => {
      saveEntryOriginState({
        sourceRoute: "/",
        sourceSection: "projects",
        homeSectionIndex: getHomeSectionIndexForOrigin("projects"),
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
      <div className="firelight absolute inset-0 opacity-60" />

      <div className={`${revealClassName} relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-8`}>
        <div className="flex-shrink-0 py-4 md:py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Spell Scrolls</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Enchanted works forged in the fires of creativity. Take a scroll and wander.
          </p>
        </div>

        <div className="flex h-[55dvh] min-h-[280px] items-center justify-center">
          <div className="map-ghost-panel relative flex w-full flex-col overflow-hidden rounded-lg px-4 py-6 md:p-8">
            <div className="md:hidden relative left-1/2 w-screen -translate-x-1/2">
              <MobileSnapCarousel
                items={projectEntries}
                initialIndex={initialProjectIndex}
                onActiveIndexChange={handleIndexChange}
                gap={18}
                itemWidth="90vw"
                className="pb-1"
                viewportClassName="px-[5vw]"
                renderItem={(project, index) => {
                  const cardLinks = project.links.filter((link) => link.showOnCard)

                  return (
                    <SpellScroll
                      title={project.title}
                      description={project.summary}
                      runes={project.tags}
                      presentation="mobile"
                      className="w-full"
                      onClick={() => handleProjectClick(project.slug, index)}
                    >
                      {cardLinks.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cardLinks.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              className="flex items-center gap-1.5 rounded px-3 py-1.5 font-garamond text-xs text-orange-100 medieval-button"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {link.kind === "demo" ? (
                                <Sparkles className="h-3.5 w-3.5" />
                              ) : (
                                <ScrollText className="h-3.5 w-3.5" />
                              )}
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </SpellScroll>
                  )
                }}
              />
            </div>

            <div ref={shellRef} className="hidden w-full overflow-visible py-2 md:block md:py-3">
              <InfiniteCarousel
                items={projectEntries}
                itemWidth={itemWidth}
                gap={gap}
                snap="left"
                itemAlign="center"
                initialIndex={initialProjectIndex}
                onActiveIndexChange={handleIndexChange}
                className="w-full scroll-fade-horizontal py-1 md:py-2"
                renderItem={(project, index) => {
                  const cardLinks = project.links.filter((link) => link.showOnCard)

                  return (
                    <SpellScroll
                      title={project.title}
                      description={project.summary}
                      runes={project.tags}
                      className="w-full"
                      onClick={() => handleProjectClick(project.slug, index)}
                    >
                      {cardLinks.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cardLinks.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              className="flex items-center gap-1.5 rounded px-3 py-1.5 font-garamond text-xs text-orange-100 medieval-button"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {link.kind === "demo" ? (
                                <Sparkles className="h-3.5 w-3.5" />
                              ) : (
                                <ScrollText className="h-3.5 w-3.5" />
                              )}
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </SpellScroll>
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
