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
    <div className={`w-full h-[280px] box-border ${className}`}>
      <div
        className={`spell-scroll group relative w-full h-full ${isInteractive ? "cursor-pointer" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        style={{
          transform: `rotate(${tiltDeg}deg)`,
          transition: "transform 500ms",
        }}
      >
        <div
          className="relative w-full h-full"
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

          <div className="relative z-10 flex w-full h-full flex-col p-4 gap-2">
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
              <h3 className="text-xl font-bold text-amber-900 font-cinzel group-hover:text-orange-700 transition-colors line-clamp-2 leading-snug">
                {title}
              </h3>

              <p className="text-amber-800 font-garamond leading-snug line-clamp-3 text-sm overflow-hidden">{description}</p>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {runes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {runes.map((rune, index) => (
                    <span key={index} className="magical-rune px-2 py-0.5 text-xs font-garamond font-medium">
                      {rune}
                    </span>
                  ))}
                </div>
              )}

              {children ? <div className="overflow-hidden">{children}</div> : null}
            </div>
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
