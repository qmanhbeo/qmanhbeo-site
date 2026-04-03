"use client"

import type React from "react"
import { useState } from "react"

interface WoodenMedallionProps {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  className?: string
  rel?: string
  target?: string
}

export default function WoodenMedallion({
  icon,
  label,
  href,
  onClick,
  className = "",
  rel,
  target,
}: WoodenMedallionProps) {
  const [isGlowing, setIsGlowing] = useState(false)
  const isInteractive = Boolean(href || onClick)

  const content = (
    <div
      className={`wooden-medallion group transition-all duration-300 ${isInteractive ? "cursor-pointer" : ""} ${className}`}
      onMouseEnter={() => setIsGlowing(true)}
      onMouseLeave={() => setIsGlowing(false)}
      onClick={onClick}
    >
      <div className={`relative rounded-full p-4 transition-all duration-300 md:p-6 ${isGlowing ? "ember-medallion-glow" : ""}`}>
        {/* Wooden Background */}
        <div className="absolute inset-0 wood-medallion rounded-full shadow-lg" />

        {/* Carved Border */}
        <div className="absolute inset-2 border-2 border-amber-800 rounded-full opacity-60" />
        <div className="absolute inset-3 border border-amber-700 rounded-full opacity-40" />

        {/* Wood Grain Lines */}
        <div className="absolute inset-0 wood-grain rounded-full opacity-30" />

        {/* Content */}
        <div
          className={`relative z-10 flex flex-col items-center transition-all duration-300 ${isGlowing ? "transform scale-105 md:scale-110" : ""}`}
        >
          <div className="carved-icon mb-2 text-amber-100 transition-colors group-hover:text-orange-200 md:mb-3">
            {icon}
          </div>
          <span className="block font-garamond text-[0.82rem] font-medium text-amber-100 transition-colors group-hover:text-orange-200 md:text-sm">
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
    return (
      <a href={href} target={target} rel={rel}>
        {content}
      </a>
    )
  }

  return content
}
