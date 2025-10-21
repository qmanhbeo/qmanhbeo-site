"use client"

interface QuoteScrollProps {
  quote: string
  author: string
  className?: string
}

export default function QuoteScroll({ quote, author, className = "" }: QuoteScrollProps) {
  return (
    <div className={`quote-scroll max-w-2xl mx-auto ${className}`}>
      <div className="relative p-8">
        {/* Vertical Scroll Background */}
        <div className="absolute inset-0 quote-parchment rounded-lg shadow-lg" />

        {/* Decorative Frame */}
        <div className="absolute inset-4 border-2 border-amber-400 rounded-lg opacity-40" />
        <div className="absolute top-6 left-6 w-4 h-4 decorative-corner" />
        <div className="absolute top-6 right-6 w-4 h-4 decorative-corner transform rotate-90" />
        <div className="absolute bottom-6 left-6 w-4 h-4 decorative-corner transform rotate-270" />
        <div className="absolute bottom-6 right-6 w-4 h-4 decorative-corner transform rotate-180" />

        {/* Illuminated Quote Mark */}
        <div className="absolute top-4 left-8 text-6xl font-cinzel text-amber-600 opacity-30 leading-none">"</div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <p className="text-amber-800 font-garamond italic text-lg leading-relaxed mb-4 pl-8">{quote}</p>
          <p className="text-amber-700 font-cinzel text-right">— {author}</p>
        </div>

        {/* Feather Quill Decoration */}
        <div className="absolute bottom-2 right-2 text-amber-600 opacity-40">🪶</div>
      </div>
    </div>
  )
}
