"use client"

import { Sparkles } from "lucide-react"

interface ArchiveCodexButtonProps {
  isOpen?: boolean
  onOpen: () => void
  label?: string
  className?: string
}

const archiveGlowStyle = {
  background:
    "radial-gradient(circle at center, rgba(255, 208, 132, 0.34) 0%, rgba(255, 153, 51, 0.18) 42%, transparent 74%)",
}

export default function ArchiveCodexButton({
  isOpen = false,
  onOpen,
  label = "Enter the Archive",
  className = "",
}: ArchiveCodexButtonProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="group relative w-full max-w-[30rem] outline-none"
      >
        {/* Glow layer */}
        <div
          className="pointer-events-none absolute left-1/2 top-full h-12 w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg transition-all duration-500 group-hover:h-14 group-hover:w-[78%] group-hover:blur-xl"
          style={archiveGlowStyle}
        />

        {/* Button face */}
        <div
          className="relative flex items-center justify-center gap-3 rounded-full border border-amber-700/40 px-8 py-4 text-amber-50 transition-all duration-300 group-hover:scale-[1.03] group-hover:border-amber-600/60 group-active:scale-[0.98]"
          style={{
            background: "linear-gradient(160deg, #c47828 0%, #8e4b18 55%, #6f340f 100%)",
            boxShadow: "0 6px 24px rgba(180,90,20,0.3), inset 0 1px 0 rgba(255,220,160,0.2)",
          }}
        >
          <span className="font-cinzel text-lg font-bold tracking-wide sm:text-xl">{label}</span>
          <Sparkles className="h-5 w-5 shrink-0 text-amber-200/90 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
        </div>
      </button>
    </div>
  )
}
