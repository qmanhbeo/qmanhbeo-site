"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface MagicalScrollProps {
  title: string
  subtitle?: string
  onClick?: () => void
  className?: string
}

export default function MagicalScroll({ title, subtitle, onClick, className = "" }: MagicalScrollProps) {
  const [isUnfurling, setIsUnfurling] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    setIsUnfurling(true)

    // Navigate after animation starts
    setTimeout(() => {
      if (onClick) {
        onClick()
      } else {
        router.push("/letter")
      }
    }, 800) // Mid-way through the animation
  }

  return (
    <div
      className={`magical-scroll-container group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative flex flex-col items-center">
        {/* Main Scroll */}
        <div
          className={`magical-scroll transition-all duration-1000 ease-out ${
            isUnfurling ? "unfurling" : ""
          } ${isHovered ? "hovered" : ""}`}
        >
          {/* Scroll Background */}
          <div className="scroll-parchment" />

          {/* Wax Seal */}
          <div className={`wax-seal-large ${isUnfurling ? "breaking" : ""}`}>
            <div className="seal-inner">
              <span className="seal-symbol">✉</span>
            </div>
            {/* Wax drips */}
            <div className="wax-drip wax-drip-1" />
            <div className="wax-drip wax-drip-2" />
            <div className="wax-drip wax-drip-3" />
          </div>

          {/* Scroll Content */}
          <div className="scroll-content">
            <h3 className="scroll-title font-cinzel">{title}</h3>
            {subtitle && <p className="scroll-subtitle font-garamond italic">{subtitle}</p>}
          </div>

          {/* Magical Sparkles */}
          <div className={`sparkles ${isHovered ? "active" : ""}`}>
            <div className="sparkle sparkle-1">✦</div>
            <div className="sparkle sparkle-2">✧</div>
            <div className="sparkle sparkle-3">✦</div>
            <div className="sparkle sparkle-4">✧</div>
            <div className="sparkle sparkle-5">✦</div>
          </div>

          {/* Unfurling Effect Overlay */}
          <div className={`unfurl-overlay ${isUnfurling ? "active" : ""}`} />
        </div>

        {/* Call to Action Text */}
        <div className="mt-6 text-center">
          <p className="text-orange-200 font-garamond italic text-lg group-hover:text-orange-100 transition-colors">
            Click to break the seal and share your thoughts...
          </p>
        </div>
      </div>
    </div>
  )
}
