"use client"

import { useState } from "react"
import { sections } from "@/utils/sections"

interface WandererTrailProps {
  currentSection: number
  isMapExpanded: boolean
  onSectionClick: (index: number) => void
}

export default function WandererTrail({ currentSection, isMapExpanded, onSectionClick }: WandererTrailProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)

  if (isMapExpanded) return null

  return (
    <div className="page-load-unblur-fixed wanderer-trail-container">
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
            const progress = sections.length > 1 ? (index / (sections.length - 1)) * 100 : 50

            return (
              <div key={index} className="trail-marker-container" style={{ left: `${progress}%` }}>
                {/* Marker */}
                <button
                  className={`trail-marker ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
                  onClick={() => onSectionClick(index)}
                  onMouseEnter={() => setHoveredSection(index)}
                  onMouseLeave={() => setHoveredSection(null)}
                  aria-label={`Go to ${section.navLabel}`}
                >
                  <div className="marker-icon">
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Enhanced glow effect for active marker */}
                  {isActive && <div className="marker-active-glow" />}
                </button>

                {/* Tooltip */}
                {isHovered && (
                  <div className="trail-tooltip">
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
