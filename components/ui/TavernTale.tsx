"use client"
import { useState } from "react"

interface TavernTaleProps {
  title: string
  excerpt: string
  date: string
  readTime: string
  className?: string
  onClick?: () => void
}

export default function TavernTale({ title, excerpt, date, readTime, className = "", onClick }: TavernTaleProps) {
  const [isUnfurling, setIsUnfurling] = useState(false)

  return (
    <div
      className={`tavern-tale group cursor-pointer transition-all duration-500 ${className}`}
      onMouseEnter={() => setIsUnfurling(true)}
      onMouseLeave={() => setIsUnfurling(false)}
      onClick={onClick}
      style={{
        transform: `rotate(${Math.random() * 3 - 1.5}deg)`,
      }}
    >
      <div className="relative p-6 h-full">
        {/* Worn Parchment Background */}
        <div className="absolute inset-0 tavern-parchment rounded-lg shadow-lg" />

        {/* Torn Edge Effects */}
        <div className="absolute top-0 left-4 w-8 h-2 torn-edge opacity-60" />
        <div className="absolute bottom-0 right-6 w-6 h-2 torn-edge opacity-40" />

        {/* Ink Stains */}
        <div className="absolute top-3 right-8 w-2 h-2 ink-stain rounded-full opacity-30" />
        <div className="absolute bottom-4 left-3 w-1 h-1 ink-stain rounded-full opacity-40" />

        {/* Content */}
        <div className={`relative z-10 transition-all duration-500 ${isUnfurling ? "transform scale-105" : ""}`}>
          <h3 className="text-xl font-bold text-amber-900 mb-3 font-cinzel group-hover:text-orange-700 transition-colors handwritten-title">
            {title}
          </h3>
          <p className="text-amber-800 mb-4 font-garamond italic leading-relaxed">{excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-amber-700 font-garamond">
            <span className="flex items-center gap-1">📅 {date}</span>
            <span>⏱️ {readTime}</span>
          </div>
        </div>

        {/* Unfurling Effect */}
        <div
          className={`absolute inset-0 unfurling-glow rounded-lg transition-opacity duration-500 ${isUnfurling ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  )
}
