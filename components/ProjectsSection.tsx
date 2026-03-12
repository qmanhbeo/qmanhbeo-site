"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollText, Sparkles } from "lucide-react"
import { projects } from "@/utils/content"
import SpellScroll from "./ui/SpellScroll"
import InfiniteCarousel from "./ui/InfiniteCarousel"

export default function ProjectsSection() {
  const shellRef = useRef<HTMLDivElement>(null)
  const [itemWidth, setItemWidth] = useState(300)
  const gap = 20

  useEffect(() => {
    const element = shellRef.current
    if (!element) return

    const computeWidth = () => {
      const shellWidth = element.clientWidth
      const cardsPerView = shellWidth >= 1280 ? 4 : shellWidth >= 1000 ? 3 : shellWidth >= 640 ? 2 : 1
      const candidateWidth = (shellWidth - gap * (cardsPerView - 1)) / cardsPerView
      setItemWidth(Math.max(240, Math.round(candidateWidth)))
    }

    const resizeObserver = new ResizeObserver(computeWidth)
    resizeObserver.observe(element)
    computeWidth()

    return () => {
      resizeObserver.disconnect()
    }
  }, [gap])

  return (
    <section
      className="section-safe-area relative flex h-full min-w-full flex-col overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8">
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Spell Scrolls</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Enchanted works forged in the fires of creativity. Take a scroll and wander.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="spell-parchment relative flex w-full flex-col overflow-hidden rounded-lg p-8">
            <div ref={shellRef} className="flex-1 overflow-visible">
              <InfiniteCarousel
                items={projects}
                itemWidth={itemWidth}
                gap={gap}
                snap="left"
                className="h-full"
                renderItem={(project) => {
                  const hasGithubLink = Boolean(project.github && project.github !== "#")
                  const hasDemoLink = Boolean(project.demo && project.demo !== "#")
                  const hasAnyProjectLink = hasGithubLink || hasDemoLink

                  return (
                    <SpellScroll
                      title={project.title}
                      description={project.description}
                      runes={project.tech}
                      className="h-full w-full"
                    >
                      {hasAnyProjectLink ? (
                        <div className="mt-4 flex gap-3">
                          {hasGithubLink && (
                            <a
                              href={project.github}
                              className="flex items-center gap-2 rounded px-4 py-2 font-garamond text-sm text-orange-100 medieval-button"
                            >
                              <ScrollText className="h-4 w-4" />
                              Grimoire
                            </a>
                          )}

                          {hasDemoLink && (
                            <a
                              href={project.demo}
                              className="flex items-center gap-2 rounded px-4 py-2 font-garamond text-sm text-orange-100 medieval-button"
                            >
                              <Sparkles className="h-4 w-4" />
                              Cast Spell
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 font-garamond text-sm italic text-amber-700">
                          Repository and public demo links are not published yet.
                        </p>
                      )}
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
