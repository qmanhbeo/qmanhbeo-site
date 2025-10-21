"use client"

import { useEffect, useRef } from "react"
import { blogPosts } from "@/utils/content"
import TavernTale from "./ui/TavernTale"

export default function BlogSection() {
  const carouselRef = useRef<HTMLDivElement>(null)

  // Create infinite array by tripling the items
  const infiniteTales = [...blogPosts, ...blogPosts, ...blogPosts]
  const itemWidth = 320 // 300px item + 20px gap
  const sectionWidth = blogPosts.length * itemWidth

  // Handle wheel events for horizontal scrolling
  useEffect(() => {
    const handleTavernScrollWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement

      // Check if we're inside the tavern tales area
      const tavernContent = target.closest(".tavern-tales-area")
      if (!tavernContent) return

      const scrollContainer = tavernContent as HTMLElement
      const isAtTop = scrollContainer.scrollTop === 0
      const isAtBottom = scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight - 1

      // Only handle horizontal navigation if we're at scroll boundaries
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        // Translate vertical scroll to horizontal scroll
        if (carouselRef.current) {
          carouselRef.current.scrollLeft += e.deltaY
        }
      }
    }

    document.addEventListener("wheel", handleTavernScrollWheel, { passive: false, capture: true })

    return () => {
      document.removeEventListener("wheel", handleTavernScrollWheel, { capture: true })
    }
  }, [])

  // Handle infinite loop by resetting scroll position
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return

    const container = carouselRef.current
    const { scrollLeft, clientWidth } = container

    // Reset position for seamless infinite loop
    if (scrollLeft >= sectionWidth * 2 - clientWidth / 2) {
      // Near the end, jump back to middle section
      container.style.scrollBehavior = "auto"
      container.scrollLeft = scrollLeft - sectionWidth
      requestAnimationFrame(() => {
        if (container) container.style.scrollBehavior = "smooth"
      })
    } else if (scrollLeft <= clientWidth / 2) {
      // Near the beginning, jump forward to middle section
      container.style.scrollBehavior = "auto"
      container.scrollLeft = scrollLeft + sectionWidth
      requestAnimationFrame(() => {
        if (container) container.style.scrollBehavior = "smooth"
      })
    }
  }

  // Initialize scroll position to middle section
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = sectionWidth
    }
  }, [sectionWidth])

  // Handle tale click
  const handleTaleClick = (tale: any) => {
    console.log(`Navigate to full tale: ${tale.title}`)
  }

  return (
    <section
      className="min-w-full h-full flex flex-col relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-50" />

      <div className="relative z-10 px-8 max-w-7xl w-full h-full flex flex-col mx-auto">
        {/* Header */}
        <div className="text-center py-6 flex-shrink-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-2 text-orange-100 font-cinzel">Tavern Tales</h2>
          <p className="text-lg text-orange-200 max-w-2xl mx-auto font-garamond italic">
            Stories shared by the hearth, passed from wanderer to wanderer through the ages
          </p>
        </div>

        {/* Tavern Tales Showcase Box */}
        <div className="flex-1 min-h-0">
          <div className="tavern-parchment rounded-lg h-full flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-hidden p-8">
              <div className="h-full overflow-y-auto scrollable-content tavern-tales-area">
                <div className="flex items-center justify-center min-h-full">
                  {/* Native CSS Scroll Snap Carousel */}
                  <div className="relative w-full max-w-5xl">
                    <div
                      ref={carouselRef}
                      className="flex gap-5 overflow-x-auto scrollbar-hide"
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

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 text-amber-600 opacity-40">🍺</div>
            <div className="absolute bottom-4 right-4 text-amber-600 opacity-40">📖</div>
            <div className="absolute top-4 right-4 text-amber-600 opacity-40">🕯️</div>
            <div className="absolute bottom-4 left-4 text-amber-600 opacity-40">🪶</div>
          </div>
        </div>
      </div>
    </section>
  )
}
