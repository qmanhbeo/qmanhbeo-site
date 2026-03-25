"use client"

import { Sparkles } from "lucide-react"
import { useState } from "react"

interface ArchiveCodexButtonProps {
  isOpen?: boolean
  onOpen: () => void
  label?: string
  className?: string
}

const spineStyle = {
  background: "linear-gradient(180deg, #7d3d14 0%, #5b280d 48%, #8f4c1b 100%)",
  boxShadow: "inset -1px 0 0 rgba(255,214,158,0.18), inset 1px 0 0 rgba(0,0,0,0.18)",
}

const coverStyle = {
  background:
    "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.16) 0%, transparent 26%), linear-gradient(135deg, #a85e1f 0%, #8e4b18 45%, #6f340f 100%)",
  boxShadow: "0 22px 34px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,225,186,0.18)",
}

const pagesStyle = {
  background:
    "linear-gradient(180deg, rgba(255,249,236,0.98) 0%, rgba(236,221,191,0.98) 100%), repeating-linear-gradient(180deg, rgba(138,103,61,0.18) 0 2px, transparent 2px 6px)",
  boxShadow: "inset 0 0 0 1px rgba(145,107,60,0.12)",
}

export default function ArchiveCodexButton({
  isOpen = false,
  onOpen,
  label = "Enter the Archive",
  className = "",
}: ArchiveCodexButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = isHovered || isOpen

  return (
    <button
      type="button"
      className={`group relative block w-full max-w-[30rem] bg-transparent text-left outline-none ${className}`}
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      <div className="relative h-[5rem] sm:h-[7.5rem]" style={{ perspective: "1400px" }}>
        <div
          className={`absolute inset-x-5 bottom-1 rounded-full blur-2xl transition-all duration-500 ${
            isExpanded ? "h-9 bg-amber-400/30" : "h-7 bg-amber-500/20"
          }`}
        />

        <div
          className="absolute inset-y-3 left-0 w-12 rounded-l-[1.35rem] rounded-r-md border border-amber-950/25"
          style={spineStyle}
        >
          <div className="absolute inset-y-2 left-2 w-1 rounded-full bg-amber-950/20" />
          <div className="absolute inset-y-3 right-2 w-px bg-amber-100/15" />
        </div>

        <div
          className="hidden sm:block absolute inset-y-4 right-3 w-3 rounded-r-md transition-all duration-500"
          style={{
            ...pagesStyle,
            opacity: isExpanded ? 1 : 0.92,
            boxShadow: isExpanded
              ? "0 0 18px rgba(255,221,154,0.3), inset 0 0 0 1px rgba(145,107,60,0.12)"
              : "inset 0 0 0 1px rgba(145,107,60,0.12)",
          }}
        />

        <div
          className="absolute inset-y-2 left-9 right-5 origin-left rounded-[1.35rem] border border-amber-950/25 transition-all duration-500"
          style={{
            ...coverStyle,
            transform: isExpanded ? "rotateY(-18deg) translateY(-3px) translateX(2px)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-b from-white/8 via-transparent to-black/6" />
          <div className="absolute inset-y-2 left-3 w-3 rounded-full bg-amber-950/12" />
          <div className="absolute inset-y-0 left-0 w-5 rounded-l-[1.35rem] bg-black/8" />

          <div className="absolute left-[3.8rem] right-4 sm:right-16 top-1/2 -translate-y-1/2 text-center text-amber-50">
            <div className="inline-flex items-center justify-center gap-3 whitespace-nowrap">
              <span className="font-cinzel text-lg font-bold tracking-wide md:text-xl">{label}</span>
              <Sparkles
                className={`h-5 w-5 shrink-0 text-amber-200/90 transition-transform duration-500 ${
                  isExpanded ? "rotate-12 scale-110" : ""
                }`}
              />
            </div>

            <div
              className={`mx-auto mt-3 h-1.5 rounded-full transition-all duration-500 ${
                isExpanded ? "w-28 bg-amber-100/30" : "w-20 bg-amber-100/20"
              }`}
            />

            <div
              className={`overflow-hidden font-garamond text-sm italic text-amber-100/85 transition-all duration-500 ${
                isExpanded ? "mt-3 max-h-16 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              Open the codex and browse collected work.
            </div>
          </div>

          <div className="absolute bottom-4 right-8 hidden sm:flex items-center gap-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="relative h-11 w-3 rounded-sm border border-amber-300/35 bg-gradient-to-b from-stone-200 to-stone-400 transition-all duration-500"
                style={{
                  transform: isExpanded
                    ? `translateX(${index === 0 ? "-1px" : "1px"}) translateY(-1px)`
                    : "translateX(0) translateY(0)",
                }}
              >
                <div className="absolute inset-x-0 top-1 h-[2px] bg-amber-50/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
