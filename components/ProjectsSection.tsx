// File: components/ProjectsSection.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { projects } from "@/utils/content"
import SpellScroll from "./ui/SpellScroll"
import InfiniteCarousel from "./ui/InfiniteCarousel"

export default function ProjectsSection() {
  const shellRef = useRef<HTMLDivElement>(null)
  const [itemWidth, setItemWidth] = useState(300)
  const GAP = 20

  useEffect(() => {
    const el = shellRef.current
    if (!el) return

    const compute = () => {
      const w = el.clientWidth
      // pick how many cards per view
      const per = w >= 1280 ? 4 : w >= 1000 ? 3 : w >= 640 ? 2 : 1
      // exact fit: (total width - total gaps) / per
      const candidate = (w - GAP * (per - 1)) / per
      // ✅ simplest fix: NO upper cap — let cards expand to fill
      const width = Math.max(240, Math.round(candidate))
      setItemWidth(width)
    }

    const ro = new ResizeObserver(compute)
    ro.observe(el)
    compute()
    return () => ro.disconnect()
  }, [])

  return (
    <section
      className="min-w-full h-full flex flex-col relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-60" />
      <div className="relative z-10 px-8 max-w-7xl w-full h-full flex flex-col mx-auto">
        <div className="text-center py-6 flex-shrink-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-2 text-orange-100 font-cinzel">
            Spell Scrolls
          </h2>
          <p className="text-lg text-orange-200 max-w-2xl mx-auto font-garamond italic">
            Enchanted works forged in the fires of creativity — take a scroll and wander.
          </p>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="spell-parchment rounded-lg flex flex-col overflow-hidden relative p-8 w-full">
            <div ref={shellRef} className="flex-1 overflow-visible">
              <InfiniteCarousel
                items={projects}
                itemWidth={itemWidth}
                gap={20}
                snap="left"
                className="h-full"
                renderItem={(p) => (
                  <SpellScroll
                    title={p.title}
                    description={p.description}
                    runes={p.tech}
                    className="h-full w-full"
                  >
                    <div className="flex gap-3 mt-4">
                      <button className="medieval-button text-orange-100 px-4 py-2 rounded text-sm font-garamond flex items-center gap-2">
                        📜 Grimoire
                      </button>
                      <button className="medieval-button text-orange-100 px-4 py-2 rounded text-sm font-garamond flex items-center gap-2">
                        ✨ Cast Spell
                      </button>
                    </div>
                  </SpellScroll>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
