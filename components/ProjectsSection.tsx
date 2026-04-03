"use client"

import { useRouter } from "next/navigation"
import { ScrollText, Sparkles } from "lucide-react"
import { projectEntries } from "@/content/entries"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import SpellScroll from "./ui/SpellScroll"
import InfiniteCarousel from "./ui/InfiniteCarousel"

interface ProjectsSectionProps {
  revealClassName?: string
}

export default function ProjectsSection({ revealClassName = "" }: ProjectsSectionProps) {
  const gap = 20
  const { shellRef, itemWidth } = useResponsiveCarouselWidth({ gap, minWidth: 240 })
  const router = useRouter()

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
          <div className="map-ghost-panel relative flex w-full flex-col overflow-hidden rounded-lg p-8">
            <div ref={shellRef} className="w-full overflow-visible py-2 md:py-3">
              <InfiniteCarousel
                items={projectEntries}
                itemWidth={itemWidth}
                gap={gap}
                snap="left"
                itemAlign="center"
                className="w-full scroll-fade-horizontal py-1 md:py-2"
                renderItem={(project) => {
                  const cardLinks = project.links.filter((link) => link.showOnCard)

                  return (
                    <SpellScroll
                      title={project.title}
                      description={project.summary}
                      runes={project.tags}
                      className="w-full"
                      onClick={() => router.push(`/item/${project.slug}`)}
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
