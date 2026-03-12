"use client"

import { useCallback, useEffect, useRef } from "react"
import { BookOpen, Feather, Flame, ScrollText } from "lucide-react"
import { blogPosts, type BlogPost } from "@/utils/content"
import TavernTale from "./ui/TavernTale"

export default function BlogSection() {
  const carouselRef = useRef<HTMLDivElement>(null)

  const infiniteTales = [...blogPosts, ...blogPosts, ...blogPosts]
  const itemWidth = 320
  const sectionWidth = blogPosts.length * itemWidth

  useEffect(() => {
    const handleTavernScrollWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement
      const tavernContent = target.closest(".tavern-tales-area")
      if (!(tavernContent instanceof HTMLElement)) return

      const isAtTop = tavernContent.scrollTop === 0
      const isAtBottom = tavernContent.scrollTop >= tavernContent.scrollHeight - tavernContent.clientHeight - 1

      if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        if (carouselRef.current) {
          carouselRef.current.scrollLeft += event.deltaY
        }
      }
    }

    document.addEventListener("wheel", handleTavernScrollWheel, { passive: false, capture: true })
    return () => {
      document.removeEventListener("wheel", handleTavernScrollWheel, true)
    }
  }, [])

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return

    const container = carouselRef.current
    const { scrollLeft, clientWidth } = container

    if (scrollLeft >= sectionWidth * 2 - clientWidth / 2) {
      container.style.scrollBehavior = "auto"
      container.scrollLeft = scrollLeft - sectionWidth
      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth"
      })
    } else if (scrollLeft <= clientWidth / 2) {
      container.style.scrollBehavior = "auto"
      container.scrollLeft = scrollLeft + sectionWidth
      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth"
      })
    }
  }, [sectionWidth])

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = sectionWidth
    }
  }, [sectionWidth])

  const handleTaleClick = useCallback((tale: BlogPost) => {
    console.log(`Navigate to full tale: ${tale.title}`)
  }, [])

  return (
    <section
      className="section-safe-area relative flex h-full min-w-full flex-col overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-8">
        <div className="flex-shrink-0 py-6 text-center">
          <h2 className="font-cinzel text-4xl font-bold text-orange-100 md:text-5xl">Tavern Tales</h2>
          <p className="mx-auto max-w-2xl font-garamond text-lg italic text-orange-200">
            Stories shared by the hearth, passed from wanderer to wanderer through the ages
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <div className="tavern-parchment relative flex h-full flex-col overflow-hidden rounded-lg">
            <div className="flex-1 overflow-hidden p-8">
              <div className="tavern-tales-area scrollable-content h-full overflow-y-auto">
                <div className="flex min-h-full items-center justify-center">
                  <div className="relative w-full max-w-5xl">
                    <div
                      ref={carouselRef}
                      className="scrollbar-hide flex gap-5 overflow-x-auto"
                      style={{
                        scrollBehavior: "smooth",
                        scrollSnapType: "x mandatory",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                      onScroll={handleCarouselScroll}
                    >
                      {infiniteTales.map((tale, index) => (
                        <div
                          key={`${index}-${tale.title}`}
                          className="flex-shrink-0"
                          style={{
                            width: "300px",
                            scrollSnapAlign: "start",
                          }}
                        >
                          <TavernTale
                            title={tale.title}
                            excerpt={tale.excerpt}
                            date={tale.date}
                            readTime={tale.readTime}
                            onClick={() => handleTaleClick(tale)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <BookOpen className="absolute left-4 top-4 h-5 w-5 text-amber-600 opacity-40" />
            <ScrollText className="absolute bottom-4 right-4 h-5 w-5 text-amber-600 opacity-40" />
            <Flame className="absolute right-4 top-4 h-5 w-5 text-amber-600 opacity-40" />
            <Feather className="absolute bottom-4 left-4 h-5 w-5 text-amber-600 opacity-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
