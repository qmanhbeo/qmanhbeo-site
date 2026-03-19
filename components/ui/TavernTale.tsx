"use client"

import { Calendar, Clock3 } from "lucide-react"
import { useState } from "react"

interface TavernTaleProps {
  title: string
  excerpt: string
  date: string
  readTime: string
  className?: string
  onClick?: () => void
}

const getDeterministicTilt = (seed: string) => {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 6000
  }

  return ((hash / 6000) * 3 - 1.5).toFixed(2)
}

export default function TavernTale({ title, excerpt, date, readTime, className = "", onClick }: TavernTaleProps) {
  const [isUnfurling, setIsUnfurling] = useState(false)
  const tilt = getDeterministicTilt(`${title}-${date}`)
  const isInteractive = Boolean(onClick)

  return (
    <div
      className={`tavern-tale group transition-all duration-500 ${isInteractive ? "cursor-pointer" : ""} ${className}`}
      onMouseEnter={() => setIsUnfurling(true)}
      onMouseLeave={() => setIsUnfurling(false)}
      onClick={onClick}
      style={{
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div className="relative p-6 h-full">
        <div className="absolute inset-0 tavern-parchment rounded-lg shadow-lg" />

        <div className="absolute top-0 left-4 w-8 h-2 torn-edge opacity-60" />
        <div className="absolute bottom-0 right-6 w-6 h-2 torn-edge opacity-40" />

        <div className="absolute top-3 right-8 w-2 h-2 ink-stain rounded-full opacity-30" />
        <div className="absolute bottom-4 left-3 w-1 h-1 ink-stain rounded-full opacity-40" />

        <div className={`relative z-10 transition-transform duration-500 ${isUnfurling ? "scale-105" : ""}`}>
          <h3 className="text-xl font-bold text-amber-900 mb-3 font-cinzel group-hover:text-orange-700 transition-colors handwritten-title">
            {title}
          </h3>
          <p className="text-amber-800 mb-4 font-garamond italic leading-relaxed">{excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-amber-700 font-garamond">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 className="h-4 w-4" />
              {readTime}
            </span>
          </div>
        </div>

        <div
          className={`absolute inset-0 unfurling-glow rounded-lg transition-opacity duration-500 ${
            isUnfurling ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  )
}
