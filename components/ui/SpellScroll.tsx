"use client"

import type React from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { getScatteredCardPreset } from "@/utils/scatteredCards"

interface SpellScrollProps {
  title: string
  description: string
  runes?: string[]
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  presentation?: "desktop" | "mobile"
}

export default function SpellScroll({
  title,
  description,
  runes = [],
  children,
  className = "",
  onClick,
  presentation = "desktop",
}: SpellScrollProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [summaryLineClamp, setSummaryLineClamp] = useState(4)
  const summaryContainerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const scatter = useMemo(
    () => getScatteredCardPreset(`${title}-${description}`, presentation === "mobile" ? "soft" : "medium"),
    [description, presentation, title],
  )
  const isInteractive = Boolean(onClick)
  const hasFooterContent = runes.length > 0 || Boolean(children)
  const isMobilePresentation = presentation === "mobile"
  const rotationDeg = isMobilePresentation ? scatter.rotateDeg * 0.45 : scatter.rotateDeg
  const translateYPx = isMobilePresentation ? scatter.translateYPx * 0.35 : scatter.translateYPx
  const hoverLiftPx = isMobilePresentation ? Math.max(-1, Math.round(scatter.hoverLiftPx * 0.5)) : scatter.hoverLiftPx
  const hoverScale = isMobilePresentation ? 1.008 : scatter.hoverScale

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
    <div className={`box-border w-full ${isMobilePresentation ? "h-[344px]" : "h-[308px]"} ${className}`}>
      <div className="flex h-full items-center justify-center">
        <div
          className={`spell-scroll group relative w-full ${isMobilePresentation ? "h-[320px]" : "h-[280px]"} ${
            isInteractive ? "cursor-pointer" : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
          style={{
            transform: `translate3d(0, ${translateYPx}px, 0) rotate(${rotationDeg}deg)`,
            transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: isHovered
                ? `translate3d(0, ${hoverLiftPx}px, 0) scale(${hoverScale})`
                : "translate3d(0, 0, 0) scale(1)",
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="absolute inset-0 spell-parchment rounded-lg shadow-lg" />

            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-600 opacity-60" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-600 opacity-60" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-600 opacity-60" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-600 opacity-60" />

            <div className={`relative z-10 flex h-full w-full flex-col ${isMobilePresentation ? "p-5" : "p-4"}`}>
              <div className="flex min-h-0 flex-1 flex-col">
                <h3
                  className={`line-clamp-3 font-cinzel font-bold leading-snug text-amber-900 transition-colors group-hover:text-orange-700 ${
                    isMobilePresentation ? "text-[1.35rem]" : "text-xl"
                  }`}
                >
                  {title}
                </h3>

                <div ref={summaryContainerRef} className="mt-2 min-h-0 flex-1 overflow-hidden">
                  <p
                    ref={summaryRef}
                    className={`font-garamond text-amber-800 ${isMobilePresentation ? "text-[0.98rem] leading-relaxed" : "text-sm leading-snug"}`}
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

              <div className={`flex flex-shrink-0 flex-col gap-2 ${isMobilePresentation ? "mt-4" : "mt-3"}`}>
                {runes.length > 0 && (
                  <div className={`flex flex-wrap ${isMobilePresentation ? "gap-2" : "gap-1.5"}`}>
                    {runes.map((rune, index) => (
                      <span
                        key={index}
                        className={`magical-rune font-garamond font-medium ${isMobilePresentation ? "px-2.5 py-1 text-[0.78rem]" : "px-2 py-0.5 text-xs"}`}
                      >
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
    </div>
  )
}
