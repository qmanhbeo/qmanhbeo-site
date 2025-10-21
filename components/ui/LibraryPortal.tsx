"use client"

import { useState } from "react"
import { BookOpen, Sparkles } from "lucide-react"

interface LibraryPortalProps {
  onClick: () => void
  className?: string
}

export default function LibraryPortal({ onClick, className = "" }: LibraryPortalProps) {
  const [isGlowing, setIsGlowing] = useState(false)

  return (
    <div
      className={`library-portal group cursor-pointer transition-all duration-500 ${className}`}
      onMouseEnter={() => setIsGlowing(true)}
      onMouseLeave={() => setIsGlowing(false)}
      onClick={onClick}
    >
      <div className={`relative p-8 transition-all duration-500 ${isGlowing ? "portal-glow" : ""}`}>
        {/* Wooden Frame Background */}
        <div className="absolute inset-0 wooden-portal-frame rounded-lg shadow-xl" />

        {/* Brass Plaque */}
        <div className="absolute inset-2 brass-plaque rounded-md" />

        {/* Magical Runes in Corners */}
        <div className="absolute top-3 left-3 text-amber-400 opacity-60 animate-pulse">✦</div>
        <div className="absolute top-3 right-3 text-amber-400 opacity-60 animate-pulse">✧</div>
        <div className="absolute bottom-3 left-3 text-amber-400 opacity-60 animate-pulse">✦</div>
        <div className="absolute bottom-3 right-3 text-amber-400 opacity-60 animate-pulse">✧</div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`mb-4 transition-all duration-500 ${isGlowing ? "transform scale-110" : ""}`}>
            <BookOpen className="w-12 h-12 text-amber-100 group-hover:text-orange-200 transition-colors" />
          </div>

          <h3 className="text-2xl font-bold text-amber-100 mb-2 font-cinzel group-hover:text-orange-200 transition-colors">
            Enter the Archive
          </h3>

          <p className="text-amber-200 font-garamond italic text-sm group-hover:text-orange-300 transition-colors">
            Browse the complete collection of scholarly scrolls
          </p>

          {/* Sparkle Effects */}
          <div
            className={`absolute inset-0 sparkle-overlay transition-opacity duration-500 ${isGlowing ? "opacity-100" : "opacity-0"}`}
          >
            <Sparkles className="absolute top-4 left-6 w-4 h-4 text-yellow-300 animate-ping" />
            <Sparkles className="absolute bottom-6 right-4 w-3 h-3 text-yellow-400 animate-ping animation-delay-300" />
            <Sparkles className="absolute top-8 right-8 w-2 h-2 text-yellow-200 animate-ping animation-delay-600" />
          </div>
        </div>

        {/* Portal Energy Ring */}
        <div
          className={`absolute inset-4 portal-energy rounded-full transition-opacity duration-500 ${isGlowing ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  )
}
