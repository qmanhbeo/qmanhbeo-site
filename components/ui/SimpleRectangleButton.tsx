"use client"

import { useState } from "react"

interface SimpleRectangleButtonProps {
  onClick: () => void
  className?: string
  hoverColor?: "ember" | "scholar" | "magic"
  width?: "normal" | "wide" | "full"
}

export default function SimpleRectangleButton({
  onClick,
  className = "",
  hoverColor = "ember",
  width = "normal",
}: SimpleRectangleButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getHoverEffect = () => {
    switch (hoverColor) {
      case "ember":
        return "hover:ember-glow hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500"
      case "scholar":
        return "hover:scholar-hover-glow hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600"
      case "magic":
        return "hover:enchanted-glow hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500"
      default:
        return "hover:ember-glow hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500"
    }
  }

  // Make buttons much more prominent
  const widthClasses = {
    normal: "w-full max-w-md", // 448px
    wide: "w-full max-w-2xl", // 672px
    full: "w-full max-w-4xl", // 896px
  }

  return (
    <div className="flex justify-center w-full">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${widthClasses[width]}
          h-20
          bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
          border-3 border-amber-500
          rounded-xl
          cursor-pointer
          transition-all duration-500 ease-out
          transform
          shadow-xl
          ${getHoverEffect()}
          ${isHovered ? "scale-110 shadow-2xl" : ""}
          ${className}
        `}
        aria-label="Interactive button"
      >
        {/* More prominent inner glow effect */}
        <div
          className={`
            w-full h-full rounded-lg
            transition-all duration-500
            flex items-center justify-center
            ${isHovered ? "bg-gradient-to-r from-white/20 to-white/10" : "bg-gradient-to-r from-white/5 to-white/10"}
          `}
        >
          {/* Optional: Add a subtle indicator */}
          <div
            className={`
              w-8 h-1 bg-amber-300 rounded-full opacity-60
              transition-all duration-500
              ${isHovered ? "w-16 opacity-100" : ""}
            `}
          />
        </div>
      </button>
    </div>
  )
}
