"use client"

import { useState } from "react"
import ScholarScroll from "./ScholarScroll"

interface Publication {
  title: string
  journal: string
  year: string
  abstract?: string
  link?: string
}

interface FeaturedScrollProps {
  publication: Publication
  onScrollClick?: (publication: Publication) => void
}

export default function FeaturedScroll({ publication, onScrollClick }: FeaturedScrollProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      {/* Featured Ribbon */}
      <div className="absolute -top-2 -right-2 z-20 featured-ribbon">
        <div className="relative px-4 py-2">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 transform rotate-12 rounded shadow-lg" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded shadow-md" />
          <span className="relative text-xs font-cinzel font-bold text-amber-100 whitespace-nowrap">
            Featured Manuscript
          </span>
          {/* Wax Seal */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-800 rounded-full shadow-md">
            <div className="absolute inset-0.5 bg-red-700 rounded-full">
              <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-xs">⚜</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scholar Scroll */}
      <div
        className={`transform transition-all duration-300 ${isHovered ? "scale-105 featured-glow" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ScholarScroll
          title={publication.title}
          journal={publication.journal}
          year={publication.year}
          abstract={publication.abstract}
          className="cursor-pointer"
        >
          <div className="flex gap-3 mt-4">
            {publication.link && (
              <a
                href={publication.link}
                className="medieval-button text-orange-100 px-4 py-2 rounded text-sm font-garamond inline-flex items-center gap-2"
              >
                📜 Read Manuscript
              </a>
            )}
            <button
              onClick={() => onScrollClick?.(publication)}
              className="medieval-button text-orange-100 px-4 py-2 rounded text-sm font-garamond inline-flex items-center gap-2"
            >
              🔍 View Details
            </button>
          </div>
        </ScholarScroll>
      </div>
    </div>
  )
}
