"use client"

import { useEffect, useRef, useState } from "react"
import { blogPosts } from "@/utils/content"
import TavernTale from "./ui/TavernTale"
import InfiniteCarousel from "./ui/InfiniteCarousel"

interface BlogSectionProps {
  revealClassName?: string
}

export default function BlogSection({ revealClassName = "" }: BlogSectionProps) {
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

  const handleTaleClick = (title: string) => {
    console.log(`Navigate to full tale: ${title}`)
  }

  return (
    <section
      className="section-safe-area relative flex h-full min-w-full flex-col overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className={`${revealClassName} relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8`}>
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Campfire Notes</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Fragments from the workbench, the archive, and the road
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <div className="map-ghost-panel relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-8">
              <div ref={shellRef} className="mx-auto flex w-full max-w-5xl items-center justify-center overflow-visible">
                <InfiniteCarousel
                  items={blogPosts}
                  itemWidth={itemWidth}
                  gap={gap}
                  snap="left"
                  className="w-full"
                  renderItem={(tale) => (
                    <TavernTale
                      title={tale.title}
                      excerpt={tale.excerpt}
                      date={tale.date}
                      readTime={tale.readTime}
                      className="w-full"
                      onClick={() => handleTaleClick(tale.title)}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
