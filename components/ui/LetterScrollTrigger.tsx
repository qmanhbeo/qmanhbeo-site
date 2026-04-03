"use client"

import { Feather, Mail } from "lucide-react"

interface LetterScrollTriggerProps {
  isOpen?: boolean
  onOpen: () => void
  label?: string
  helperText?: string
  variant?: "full" | "compact"
}

const scrollSurfaceStyle = {
  background:
    "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.28) 0%, transparent 26%), radial-gradient(circle at 78% 78%, rgba(160,82,45,0.08) 0%, transparent 30%), linear-gradient(135deg, #f2d8a2 0%, #edbf78 48%, #c97723 100%)",
  boxShadow: "0 10px 20px rgba(43,21,10,0.14), 0 0 14px rgba(255,173,84,0.05), inset 0 1px 0 rgba(255,244,220,0.4)",
}

const rollerStyle = {
  background: "linear-gradient(180deg, #d59c50 0%, #90501c 50%, #dda555 100%)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,239,210,0.4)",
}

export default function LetterScrollTrigger({
  isOpen = false,
  onOpen,
  label = "Write Him a Letter",
  helperText = "Unfurl the scroll and send a note by firelight.",
  variant = "full",
}: LetterScrollTriggerProps) {
  const isCompact = variant === "compact"

  const buttonClassName = isCompact
    ? "group relative w-full max-w-md bg-transparent py-2 sm:py-4 outline-none"
    : "group relative w-full max-w-3xl bg-transparent py-8 outline-none"

  const frameClassName = isCompact
    ? "relative flex w-full items-center gap-0"
    : "relative flex w-full items-center gap-0"

  const rollerClassName = isCompact
    ? "pointer-events-none relative z-20 -mx-1.5 h-12 w-6 sm:h-16 sm:w-8 shrink-0 rounded-full border border-amber-100/15 transition-all duration-500 group-hover:h-14 sm:group-hover:h-20 group-focus-visible:h-14 sm:group-focus-visible:h-20"
    : "pointer-events-none relative z-20 -mx-2 h-20 w-10 shrink-0 rounded-full border border-amber-100/15 transition-all duration-500 group-hover:h-28 group-focus-visible:h-28"

  const surfaceClassName = isCompact
    ? "relative z-10 block min-w-0 flex-1 overflow-hidden rounded-[1.5rem] border border-amber-900/25 px-3 py-2 sm:px-5 sm:py-3 text-center transition-all duration-500 group-hover:-translate-y-1 group-hover:py-3 sm:group-hover:py-5 group-focus-visible:-translate-y-1 group-focus-visible:py-3 sm:group-focus-visible:py-5"
    : "relative z-10 block min-w-0 flex-1 overflow-hidden rounded-[1.75rem] border border-amber-900/25 px-6 py-4 text-center transition-all duration-500 group-hover:-translate-y-1 group-hover:py-7 group-focus-visible:-translate-y-1 group-focus-visible:py-7"

  const titleClassName = isCompact ? "font-cinzel text-base sm:text-xl font-bold md:text-2xl" : "font-cinzel text-2xl font-bold md:text-3xl"
  const helperClassName = isCompact
    ? "mx-auto block max-w-xl overflow-hidden font-garamond text-sm italic leading-relaxed text-amber-900 transition-all duration-500 max-h-0 opacity-0 group-hover:mt-3 group-hover:max-h-16 group-hover:opacity-100 group-focus-visible:mt-3 group-focus-visible:max-h-16 group-focus-visible:opacity-100"
    : "mx-auto block max-w-2xl overflow-hidden font-garamond text-base italic leading-relaxed text-amber-900 transition-all duration-500 max-h-0 opacity-0 group-hover:mt-4 group-hover:max-h-20 group-hover:opacity-100 group-focus-visible:mt-4 group-focus-visible:max-h-20 group-focus-visible:opacity-100"
  const dividerClassName = isCompact
    ? "mx-auto mt-2.5 block h-1.5 w-14 rounded-full bg-amber-800/40 transition-all duration-500 group-hover:w-24 group-hover:bg-amber-700/70 group-focus-visible:w-24 group-focus-visible:bg-amber-700/70"
    : "mx-auto mt-3 block h-1.5 w-16 rounded-full bg-amber-800/40 transition-all duration-500 group-hover:w-32 group-hover:bg-amber-700/70 group-focus-visible:w-32 group-focus-visible:bg-amber-700/70"

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open the letter composer"
        className={buttonClassName}
      >
        <span className={frameClassName}>
          <span className={rollerClassName} style={rollerStyle}>
            <span className="absolute inset-[6px] rounded-full border border-amber-100/15 bg-black/10" />
          </span>

          <span className={surfaceClassName} style={scrollSurfaceStyle}>
            <span className="pointer-events-none absolute inset-x-8 top-0 h-8 bg-gradient-to-b from-white/35 to-transparent" />

            <span className="relative flex items-center justify-center gap-3 text-amber-950">
              <Feather className="h-5 w-5 -rotate-6 transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-12 group-focus-visible:-translate-y-1 group-focus-visible:-rotate-12" />
              <span className={titleClassName}>{label}</span>
              <Mail className="h-6 w-6 transition-transform duration-500 group-hover:translate-y-[-2px] group-hover:scale-110 group-focus-visible:translate-y-[-2px] group-focus-visible:scale-110" />
            </span>

            <span className={dividerClassName} />

            <span className={helperClassName}>{helperText}</span>
          </span>

          <span className={rollerClassName} style={rollerStyle}>
            <span className="absolute inset-[6px] rounded-full border border-amber-100/15 bg-black/10" />
          </span>
        </span>
      </button>
    </div>
  )
}
