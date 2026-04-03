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
  presentation?: "desktop" | "mobile"
}

export default function TavernTale({
  title,
  excerpt,
  date,
  readTime,
  className = "",
  onClick,
  presentation = "desktop",
}: TavernTaleProps) {
  const [isUnfurling, setIsUnfurling] = useState(false)
  const scatter = useMemo(() => getScatteredCardPreset(`${title}-${date}`, "soft"), [date, title])
  const isInteractive = Boolean(onClick)
  const isMobilePresentation = presentation === "mobile"
  const rotationDeg = isMobilePresentation ? scatter.rotateDeg * 0.25 : scatter.rotateDeg
  const translateYPx = isMobilePresentation ? scatter.translateYPx * 0.2 : scatter.translateYPx
  const hoverLiftPx = isMobilePresentation ? Math.max(-1, Math.round(scatter.hoverLiftPx * 0.35)) : scatter.hoverLiftPx
  const hoverScale = isMobilePresentation ? 1.006 : scatter.hoverScale

  return (
    <div className={`box-border w-full ${isMobilePresentation ? "py-1" : "py-3"} ${className}`}>
      <div
        className={`tavern-tale group relative w-full transition-transform duration-500 ${
          isInteractive ? "cursor-pointer" : ""
        } ${isMobilePresentation ? "min-h-[286px]" : "min-h-[252px]"}`}
        onMouseEnter={() => setIsUnfurling(true)}
        onMouseLeave={() => setIsUnfurling(false)}
        onClick={onClick}
        style={{
          transform: `translate3d(0, ${translateYPx}px, 0) rotate(${rotationDeg}deg)`,
          transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className={`relative h-full ${isMobilePresentation ? "p-5" : "p-6"}`}
          style={{
            transform: isUnfurling
              ? `translate3d(0, ${hoverLiftPx}px, 0) scale(${hoverScale})`
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
            <h3
              className={`mb-3 line-clamp-3 font-cinzel font-bold text-amber-900 transition-colors group-hover:text-orange-700 handwritten-title ${
                isMobilePresentation ? "text-[1.3rem] leading-snug" : "text-xl"
              }`}
            >
              {title}
            </h3>
            <p
              className={`mb-4 font-garamond italic text-amber-800 ${
                isMobilePresentation ? "line-clamp-6 text-[1rem] leading-relaxed" : "line-clamp-5 leading-relaxed"
              }`}
            >
              {excerpt}
            </p>
            <div
              className={`mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 font-garamond text-amber-700 ${
                isMobilePresentation ? "text-[0.92rem]" : "text-sm"
              }`}
            >
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
