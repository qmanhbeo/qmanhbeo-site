"use client"

import { useState } from "react"
import { Home, User, Map, Hammer, ScrollText, BookOpen, Mail, Users } from "lucide-react"

interface WandererTrailProps {
  currentSection: number
  isMapExpanded: boolean
  onSectionClick: (index: number) => void
}

const trailSections = [
  { icon: Home, label: "Hearth", description: "Welcome to the journey" },
  { icon: User, label: "Lore", description: "The tale of Leonardo" },
  { icon: Map, label: "Paideia", description: "Paths across distant lands" },
  { icon: Hammer, label: "Forge", description: "Crafted spell scrolls" },
  { icon: ScrollText, label: "Manuscripts", description: "Scholarly manuscripts" },
  { icon: BookOpen, label: "Notes", description: "Fragments from the workbench" },
  { icon: Mail, label: "Letters", description: "Words take flight" },
  { icon: Users, label: "Fellowship", description: "Join the community" },
]

export default function WandererTrail({ currentSection, isMapExpanded, onSectionClick }: WandererTrailProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)

  if (isMapExpanded) return null

  return (
    <div className="wanderer-trail-container">
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
          {trailSections.map((section, index) => {
            const IconComponent = section.icon
            const isActive = currentSection === index
            const isHovered = hoveredSection === index
            const progress = (index / (trailSections.length - 1)) * 100

            return (
              <div key={index} className="trail-marker-container" style={{ left: `${progress}%` }}>
                {/* Marker */}
                <button
                  className={`trail-marker ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
                  onClick={() => onSectionClick(index)}
                  onMouseEnter={() => setHoveredSection(index)}
                  onMouseLeave={() => setHoveredSection(null)}
                  aria-label={`Go to ${section.label}`}
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
                      <h4 className="tooltip-title font-cinzel">{section.label}</h4>
                      <p className="tooltip-description font-garamond italic">{section.description}</p>
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
