"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { ScrollText, Sparkles } from "lucide-react"
import { projects } from "@/utils/content"
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
            <div ref={shellRef} className="w-full overflow-visible">
              <InfiniteCarousel
                items={projects}
                itemWidth={itemWidth}
                gap={gap}
                snap="left"
                itemAlign="center"
                renderItem={(project) => {
                  const index = projects.indexOf(project)
                  const archiveId = index >= 0 ? `project-${index}` : "project-unknown"
                  const hasGithubLink = Boolean(project.github && project.github !== "#")
                  const hasDemoLink = Boolean(project.demo && project.demo !== "#")
                  const hasAnyProjectLink = hasGithubLink || hasDemoLink

                  return (
                    <SpellScroll
                      title={project.title}
                      description={project.description}
                      runes={project.tech}
                      className="w-full"
                      onClick={() => router.push(`/item/${archiveId}`)}
                    >
                      {hasAnyProjectLink ? (
                        <div className="flex flex-wrap gap-2">
                          {hasGithubLink && (
                            <a
                              href={project.github}
                              className="flex items-center gap-1.5 rounded px-3 py-1.5 font-garamond text-xs text-orange-100 medieval-button"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <ScrollText className="h-3.5 w-3.5" />
                              Grimoire
                            </a>
                          )}

                          {hasDemoLink && (
                            <a
                              href={project.demo}
                              className="flex items-center gap-1.5 rounded px-3 py-1.5 font-garamond text-xs text-orange-100 medieval-button"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Cast Spell
                            </a>
                          )}
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
