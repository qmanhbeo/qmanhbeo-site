"use client"

import { useRouter } from "next/navigation"
import { blogPosts } from "@/utils/content"
import { useResponsiveCarouselWidth } from "@/hooks/useResponsiveCarouselWidth"
import TavernTale from "./ui/TavernTale"
import InfiniteCarousel from "./ui/InfiniteCarousel"

interface BlogSectionProps {
  revealClassName?: string
}

export default function BlogSection({ revealClassName = "" }: BlogSectionProps) {
  const gap = 20
  const { shellRef, itemWidth } = useResponsiveCarouselWidth({ gap, minWidth: 240 })
  const router = useRouter()

  const handleTaleClick = (id: string) => {
    router.push(`/item/${id}`)
  }

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
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-visible px-8 py-8 md:px-10 md:py-10">
              <div ref={shellRef} className="mx-auto flex w-full max-w-5xl items-center justify-center overflow-visible py-2 md:py-3">
                <InfiniteCarousel
                  items={blogPosts}
                  itemWidth={itemWidth}
                  gap={gap}
                  snap="left"
                  itemAlign="center"
                  className="w-full scroll-fade-horizontal py-1 md:py-2"
                  renderItem={(tale) => {
                    const index = blogPosts.indexOf(tale)
                    const archiveId = index >= 0 ? `note-${index}` : "note-unknown"

                    return (
                      <TavernTale
                        title={tale.title}
                        excerpt={tale.excerpt}
                        date={tale.date}
                        readTime={tale.readTime}
                        className="w-full"
                        onClick={() => handleTaleClick(archiveId)}
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
