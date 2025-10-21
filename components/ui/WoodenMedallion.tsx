"use client"

import type React from "react"
import { useState } from "react"

interface WoodenMedallionProps {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  className?: string
}

export default function WoodenMedallion({ icon, label, href, onClick, className = "" }: WoodenMedallionProps) {
  const [isGlowing, setIsGlowing] = useState(false)

  const content = (
    <div
      className={`wooden-medallion group cursor-pointer transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsGlowing(true)}
      onMouseLeave={() => setIsGlowing(false)}
      onClick={onClick}
    >
      <div className={`relative p-6 transition-all duration-300 ${isGlowing ? "ember-medallion-glow" : ""}`}>
        {/* Wooden Background */}
        <div className="absolute inset-0 wood-medallion rounded-full shadow-lg" />

        {/* Carved Border */}
        <div className="absolute inset-2 border-2 border-amber-800 rounded-full opacity-60" />
        <div className="absolute inset-3 border border-amber-700 rounded-full opacity-40" />

        {/* Wood Grain Lines */}
        <div className="absolute inset-0 wood-grain rounded-full opacity-30" />

        {/* Content */}
        <div
          className={`relative z-10 flex flex-col items-center transition-all duration-300 ${isGlowing ? "transform scale-110" : ""}`}
        >
          <div className="text-amber-100 mb-3 group-hover:text-orange-200 transition-colors carved-icon">{icon}</div>
          <span className="block font-garamond font-medium text-amber-100 group-hover:text-orange-200 transition-colors text-sm">
            {label}
          </span>
        </div>

        {/* Rune Pulse Effect */}
        <div
          className={`absolute inset-0 rune-pulse rounded-full transition-opacity duration-500 ${isGlowing ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}
