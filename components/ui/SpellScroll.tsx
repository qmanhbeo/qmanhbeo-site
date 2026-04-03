"use client"

import type React from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"

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
  const [summaryLineClamp, setSummaryLineClamp] = useState(4)
  const summaryContainerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const tiltDeg = useMemo(() => getDeterministicTilt(`${title}-${description}`), [description, title])
  const isInteractive = Boolean(onClick)
  const hasFooterContent = runes.length > 0 || Boolean(children)

  useLayoutEffect(() => {
    const summaryContainer = summaryContainerRef.current
    const summary = summaryRef.current

    if (!summaryContainer || !summary) return

    const updateSummaryClamp = () => {
      const computedStyles = window.getComputedStyle(summary)
      const parsedLineHeight = Number.parseFloat(computedStyles.lineHeight)
      const fallbackLineHeight = Number.parseFloat(computedStyles.fontSize) * 1.45
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fallbackLineHeight
      const availableHeight = summaryContainer.clientHeight
      const nextClamp = Math.max(1, Math.floor(availableHeight / lineHeight))

      setSummaryLineClamp((currentClamp) => (currentClamp === nextClamp ? currentClamp : nextClamp))
    }

    const resizeObserver = new ResizeObserver(updateSummaryClamp)
    resizeObserver.observe(summaryContainer)
    updateSummaryClamp()

    return () => {
      resizeObserver.disconnect()
    }
  }, [description, hasFooterContent, runes.length, title])

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

          <div className="relative z-10 flex h-full w-full flex-col p-4">
            <div className="flex min-h-0 flex-1 flex-col">
              <h3 className="line-clamp-3 text-xl font-bold leading-snug text-amber-900 transition-colors group-hover:text-orange-700 font-cinzel">
                {title}
              </h3>

              <div ref={summaryContainerRef} className="mt-2 min-h-0 flex-1 overflow-hidden">
                <p
                  ref={summaryRef}
                  className="text-sm leading-snug text-amber-800 font-garamond"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: summaryLineClamp,
                    overflow: "hidden",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-shrink-0 flex-col gap-2">
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
