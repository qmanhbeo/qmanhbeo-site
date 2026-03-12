"use client"

import type { CSSProperties } from "react"

interface QuoteScrollProps {
  quote: string
  author: string
  className?: string
}

const paperClipPath =
  "polygon(2% 8%, 8% 2%, 16% 6%, 25% 1%, 33% 7%, 41% 2%, 49% 0%, 57% 4%, 66% 1%, 75% 6%, 84% 2%, 93% 5%, 98% 1%, 100% 8%, 97% 17%, 100% 27%, 95% 38%, 99% 47%, 92% 56%, 100% 68%, 95% 79%, 98% 89%, 94% 100%, 84% 95%, 74% 100%, 63% 94%, 52% 100%, 40% 96%, 29% 99%, 19% 93%, 9% 100%, 0% 92%, 3% 81%, 0% 71%, 7% 61%, 1% 51%, 6% 40%, 0% 30%, 4% 19%, 0% 11%)"

const paperShadowStyle: CSSProperties = {
  background: "rgba(12, 6, 3, 0.34)",
  clipPath: paperClipPath,
  filter: "blur(14px)",
  transform: "translate(12px, 14px) rotate(1.2deg)",
}

const paperSurfaceStyle: CSSProperties = {
  background:
    "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.55) 0%, transparent 28%), radial-gradient(circle at 82% 76%, rgba(160,82,45,0.14) 0%, transparent 30%), linear-gradient(135deg, #f8ecd4 0%, #f2dfbd 56%, #e3bc84 100%)",
  boxShadow: "0 24px 48px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 248, 232, 0.42)",
  clipPath: paperClipPath,
}

const tornScrapStyle: CSSProperties = {
  background: "linear-gradient(135deg, rgba(247, 233, 204, 0.96) 0%, rgba(230, 195, 142, 0.9) 100%)",
  boxShadow: "0 10px 18px rgba(0, 0, 0, 0.18)",
}

export default function QuoteScroll({ quote, author, className = "" }: QuoteScrollProps) {
  return (
    <div className={`quote-scroll mx-auto w-fit max-w-full ${className}`}>
      <div
        className="relative mx-auto inline-block px-6 py-7 sm:px-8 sm:py-8"
        style={{ transform: "rotate(-1.15deg)" }}
      >
        <div className="absolute inset-0 opacity-70" style={paperShadowStyle} />
        <div className="absolute inset-0" style={paperSurfaceStyle} />

        <div
          className="absolute -left-2 top-10 h-4 w-12 -rotate-[18deg] opacity-90"
          style={{ ...tornScrapStyle, clipPath: "polygon(0 20%, 19% 0, 100% 12%, 91% 100%, 10% 84%)" }}
        />
        <div
          className="absolute right-12 top-0 h-4 w-16 rotate-[7deg] opacity-80"
          style={{ ...tornScrapStyle, clipPath: "polygon(0 36%, 16% 0, 100% 18%, 86% 100%, 10% 78%)" }}
        />
        <div
          className="absolute bottom-0 left-20 h-4 w-14 -rotate-[10deg] opacity-75"
          style={{ ...tornScrapStyle, clipPath: "polygon(0 0, 100% 18%, 88% 100%, 6% 74%)" }}
        />
        <div
          className="absolute -bottom-1 right-20 h-4 w-10 rotate-[11deg] opacity-80"
          style={{ ...tornScrapStyle, clipPath: "polygon(6% 10%, 100% 0, 92% 84%, 0 100%)" }}
        />

        <div className="relative z-10 text-center">
          {/* <div className="mb-2 flex justify-start">
            <span className="font-cinzel text-5xl leading-none text-amber-900/25 sm:text-6xl">&ldquo;</span>
          </div> */}

          <blockquote className="mx-auto w-fit max-w-[42rem]">
            <p className="font-garamond text-lg italic leading-relaxed text-[#87401a] sm:text-xl">{quote}</p>
            {/* <footer className="mt-6 text-right font-cinzel text-lg tracking-[0.16em] text-[#743313] sm:text-xl">
              - {author}
            </footer> */}
          </blockquote>
        </div>
      </div>
    </div>
  )
}
