"use client"

import { useState, useRef, useEffect } from "react"
import { sections } from "@/utils/sections"

interface WandererTrailProps {
  currentSection: number
  isMapExpanded: boolean
  onSectionClick: (index: number) => void
}

export default function WandererTrail({ currentSection, isMapExpanded, onSectionClick }: WandererTrailProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)
  const [pendingSection, setPendingSection] = useState<number | null>(null)
  const touchedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Clear pending tooltip whenever navigation happens (e.g. via swipe)
  useEffect(() => {
    setPendingSection(null)
  }, [currentSection])

  // Dismiss pending tooltip on outside tap
  useEffect(() => {
    const handleOutsideTouch = (event: TouchEvent) => {
      if (pendingSection === null) return
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPendingSection(null)
      }
    }
    document.addEventListener("touchstart", handleOutsideTouch, { passive: true })
    return () => document.removeEventListener("touchstart", handleOutsideTouch)
  }, [pendingSection])

  const handleTouchStart = () => {
    touchedRef.current = true
  }

  const handleTouchCancel = () => {
    touchedRef.current = false
  }

  const handleMouseEnter = (index: number) => {
    // Ignore synthetic mouseenter fired by mobile after touchend
    if (touchedRef.current) return
    setHoveredSection(index)
  }

  const handleClick = (index: number) => {
    if (touchedRef.current) {
      // Touch-originated click: two-tap pattern
      touchedRef.current = false
      if (pendingSection === index) {
        // Second tap — navigate and dismiss
        setPendingSection(null)
        onSectionClick(index)
      } else {
        // First tap — show tooltip
        setPendingSection(index)
      }
    } else {
      // Mouse click on desktop — navigate immediately
      onSectionClick(index)
    }
  }

  if (isMapExpanded) return null

  return (
    <div ref={containerRef} className="page-load-unblur-fixed wanderer-trail-container">
      {/* Transparent container with dotted trail path */}
      <div className="trail-transparent">
        {/* Trail path line */}
        <div className="trail-path">
          <svg className="trail-svg" viewBox="0 0 800 20" preserveAspectRatio="none">
            <path
              d="M0,10 Q100,5 200,10 T400,10 T600,10 T800,10"
              stroke="rgba(139, 69, 19, 0.6)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8,4"
            />
          </svg>
        </div>

        {/* Section Markers */}
        <div className="trail-markers">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            const isActive = currentSection === index
            const isHovered = hoveredSection === index
            const isPending = pendingSection === index
            const progress = sections.length > 1 ? (index / (sections.length - 1)) * 100 : 50
            const tooltipAlign = progress < 25 ? "tooltip-align-left" : progress > 75 ? "tooltip-align-right" : ""

            return (
              <div key={index} className="trail-marker-container" style={{ left: `${progress}%` }}>
                {/* Marker */}
                <button
                  className={`trail-marker ${isActive ? "active" : ""} ${isHovered || isPending ? "hovered" : ""}`}
                  onClick={() => handleClick(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => setHoveredSection(null)}
                  onFocus={() => setHoveredSection(index)}
                  onBlur={() => setHoveredSection(null)}
                  onTouchStart={handleTouchStart}
                  onTouchCancel={handleTouchCancel}
                  aria-label={`Go to ${section.navLabel}`}
                >
                  <div className="marker-icon">
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Enhanced glow effect for active marker */}
                  {isActive && <div className="marker-active-glow" />}
                </button>

                {/* Tooltip */}
                {(isHovered || isPending) && (
                  <div className={`trail-tooltip ${tooltipAlign}`}>
                    <div className="tooltip-content">
                      <h4 className="tooltip-title font-cinzel">{section.navLabel}</h4>
                      <p className="tooltip-description font-garamond italic">{section.navDescription}</p>
                    </div>
                    <div className="tooltip-arrow" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
