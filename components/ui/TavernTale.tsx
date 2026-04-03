"use client"

import { Calendar, Clock3 } from "lucide-react"
import { useMemo, useState } from "react"
import { getScatteredCardPreset } from "@/utils/scatteredCards"

interface TavernTaleProps {
  title: string
  excerpt: string
  date: string
  readTime: string
  className?: string
  onClick?: () => void
}

export default function TavernTale({ title, excerpt, date, readTime, className = "", onClick }: TavernTaleProps) {
  const [isUnfurling, setIsUnfurling] = useState(false)
  const scatter = useMemo(() => getScatteredCardPreset(`${title}-${date}`, "soft"), [date, title])
  const isInteractive = Boolean(onClick)

  return (
    <div className={`w-full py-3 box-border ${className}`}>
      <div
        className={`tavern-tale group relative min-h-[252px] w-full transition-transform duration-500 ${
          isInteractive ? "cursor-pointer" : ""
        }`}
        onMouseEnter={() => setIsUnfurling(true)}
        onMouseLeave={() => setIsUnfurling(false)}
        onClick={onClick}
        style={{
          transform: `translate3d(0, ${scatter.translateYPx}px, 0) rotate(${scatter.rotateDeg}deg)`,
          transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="relative h-full p-6"
          style={{
            transform: isUnfurling
              ? `translate3d(0, ${scatter.hoverLiftPx}px, 0) scale(${scatter.hoverScale})`
              : "translate3d(0, 0, 0) scale(1)",
            transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="absolute inset-0 tavern-parchment rounded-lg shadow-lg" />

          <div className="absolute top-0 left-4 w-8 h-2 torn-edge opacity-60" />
          <div className="absolute bottom-0 right-6 w-6 h-2 torn-edge opacity-40" />

          <div className="absolute top-3 right-8 w-2 h-2 ink-stain rounded-full opacity-30" />
          <div className="absolute bottom-4 left-3 w-1 h-1 ink-stain rounded-full opacity-40" />

          <div className="relative z-10 flex h-full flex-col">
            <h3 className="mb-3 line-clamp-3 text-xl font-bold text-amber-900 transition-colors group-hover:text-orange-700 font-cinzel handwritten-title">
              {title}
            </h3>
            <p className="mb-4 line-clamp-5 font-garamond italic leading-relaxed text-amber-800">{excerpt}</p>
            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-amber-700 font-garamond">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                {readTime}
              </span>
            </div>
          </div>

          <div
            className={`absolute inset-0 unfurling-glow rounded-lg transition-opacity duration-500 ${
              isUnfurling ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </div>
  )
}
