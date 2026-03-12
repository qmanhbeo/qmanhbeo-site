"use client"

import type React from "react"
import { useMemo, useState } from "react"

interface SpellScrollProps {
  title: string
  description: string
  runes?: string[]
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

const getDeterministicTilt = (seed: string) => {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 10000
  }

  return ((hash / 10000) * 10 - 5).toFixed(2)
}

export default function SpellScroll({
  title,
  description,
  runes = [],
  children,
  className = "",
  onClick,
}: SpellScrollProps) {
  const [isHovered, setIsHovered] = useState(false)
  const tiltDeg = useMemo(() => getDeterministicTilt(`${title}-${description}`), [description, title])
  const isInteractive = Boolean(onClick)

  return (
    <div className={`w-full h-full max-w-none box-border ${className}`}>
      <div
        className={`spell-scroll group relative h-full w-full ${isInteractive ? "cursor-pointer" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        style={{
          transform: `rotate(${tiltDeg}deg)`,
          transition: "transform 500ms",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 500ms",
          }}
        >
          <div className="absolute inset-0 spell-parchment rounded-lg shadow-lg" />

          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-600 opacity-60" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-600 opacity-60" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-600 opacity-60" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-600 opacity-60" />

          <div className="relative z-10 p-6 h-full w-full flex flex-col">
            <h3 className="text-xl font-bold text-amber-900 mb-3 font-cinzel group-hover:text-orange-700 transition-colors">
              {title}
            </h3>

            <p className="text-amber-800 font-garamond mb-4 leading-relaxed">{description}</p>

            {runes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {runes.map((rune, index) => (
                  <span key={index} className="magical-rune px-3 py-1 text-xs font-garamond font-medium">
                    {rune}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto">{children}</div>
          </div>

          <div
            className={`absolute inset-0 shimmer-overlay rounded-lg transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </div>
  )
}
