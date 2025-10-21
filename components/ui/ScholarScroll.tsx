"use client"

import type React from "react"
import { useState } from "react"

interface ScholarScrollProps {
  title: string
  journal: string
  year: string
  abstract?: string
  children?: React.ReactNode
  className?: string
}

export default function ScholarScroll({
  title,
  journal,
  year,
  abstract,
  children,
  className = "",
}: ScholarScrollProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`scholar-scroll group transition-all duration-300 hover:shadow-xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-8 h-full">
        {/* Formal Parchment Background */}
        <div className="absolute inset-0 scholar-parchment rounded-lg shadow-md" />

        {/* Wax Seal */}
        <div className="absolute top-4 right-4 w-8 h-8 wax-seal-small rounded-full" />

        {/* Embossed Border */}
        <div className="absolute inset-2 border-2 border-amber-300 rounded-lg opacity-30" />
        <div className="absolute inset-4 border border-amber-400 rounded-lg opacity-20" />

        {/* Content */}
        <div className="relative z-10">
          {/* Illuminated First Letter */}
          <div className="float-left mr-3 mb-2">
            <span className="illuminated-letter text-4xl font-cinzel text-amber-700 leading-none">
              {title.charAt(0)}
            </span>
          </div>

          <h3 className="text-lg font-bold text-amber-900 mb-3 font-cinzel leading-tight">{title.substring(1)}</h3>

          <div className="flex flex-col gap-2 mb-4">
            <span className="text-amber-700 font-garamond italic text-sm">{journal}</span>
            <span className="text-amber-600 font-garamond text-xs">Anno Domini {year}</span>
          </div>

          {abstract && <p className="text-amber-800 font-garamond text-sm mb-4 leading-relaxed italic">{abstract}</p>}

          {children}
        </div>

        {/* Subtle Glow on Hover */}
        <div
          className={`absolute inset-0 scholar-glow rounded-lg transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  )
}
