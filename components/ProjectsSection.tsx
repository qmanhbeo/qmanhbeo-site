"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ScrollText, Sparkles } from "lucide-react"
import { projectEntries } from "@/content/entries"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import { getHomeSectionIndexForOrigin, readPendingReturnState, saveEntryOriginState } from "@/utils/entryNavigation"
import type { SectionSurface } from "@/utils/worldSections"
import InfiniteCarousel from "./ui/InfiniteCarousel"
import MobileSnapCarousel from "./ui/MobileSnapCarousel"
import SpellScroll from "./ui/SpellScroll"

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

interface ProjectsSectionProps {
  revealClassName?: string
  surface?: SectionSurface
}

export default function ProjectsSection({
  revealClassName = "",
  surface = "home",
}: ProjectsSectionProps) {
  const gap = 20
  const { shellRef, itemWidth } = useResponsiveCarouselWidth({ gap, minWidth: 240 })
  const router = useRouter()
  const isWorldPanel = surface === "world-panel"
  const originRoute = isWorldPanel ? "/world" : "/"
  const storageKey = isWorldPanel ? "carousel:projects:world" : "carousel:projects:home"
  const legacyStorageKey = isWorldPanel ? undefined : "carousel:projects"
  const [initialProjectIndex] = useState(() => {
    const pendingReturnState = readPendingReturnState(originRoute)
    if (pendingReturnState?.sourceSection === "projects") return pendingReturnState.sourceCarouselIndex ?? 0
    return readStoredIndex(storageKey, legacyStorageKey)
  })

  const handleIndexChange = useCallback((index: number) => {
    saveStoredIndex(storageKey, index)
  }, [storageKey])

  const handleProjectClick = useCallback(
    (slug: string, index: number) => {
      saveEntryOriginState({
        sourceRoute: originRoute,
        sourceSection: "projects",
        homeSectionIndex: getHomeSectionIndexForOrigin("projects"),
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
      <div className="firelight absolute inset-0 opacity-60" />

      <div
        className={`${revealClassName} relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-4 ${isWorldPanel ? "py-5 sm:px-6" : "sm:px-8"}`}
      >
        <div className="flex-shrink-0 py-4 text-center md:py-6">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Spell Scrolls</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Enchanted works forged in the fires of creativity. Take a scroll and wander.
          </p>
        </div>

        <div className={isWorldPanel ? "flex min-h-0 flex-1 items-center justify-center" : "flex h-[55dvh] min-h-[280px] items-center justify-center"}>
          <div className="map-ghost-panel relative flex w-full min-h-0 flex-col overflow-hidden rounded-lg px-4 py-6 md:p-8">
            <div className={isWorldPanel ? "md:hidden" : "relative left-1/2 w-screen -translate-x-1/2 md:hidden"}>
              <MobileSnapCarousel
                items={projectEntries}
                initialIndex={initialProjectIndex}
                onActiveIndexChange={handleIndexChange}
                gap={18}
                itemWidth={isWorldPanel ? "100%" : "90vw"}
                className="pb-1"
                viewportClassName={isWorldPanel ? "" : "px-[5vw]"}
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
                              className="medieval-button flex items-center gap-1.5 rounded px-3 py-1.5 font-garamond text-xs text-orange-100"
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

            <div ref={shellRef} className="hidden w-full min-h-0 overflow-visible py-2 md:block md:py-3">
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
                              className="medieval-button flex items-center gap-1.5 rounded px-3 py-1.5 font-garamond text-xs text-orange-100"
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
