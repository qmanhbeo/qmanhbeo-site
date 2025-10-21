"use client"

import { X, ExternalLink } from "lucide-react"

interface Publication {
  title: string
  journal: string
  year: string
  abstract?: string
  link?: string
}

interface ScrollModalProps {
  publication: Publication | null
  isOpen: boolean
  onClose: () => void
}

export default function ScrollModal({ publication, isOpen, onClose }: ScrollModalProps) {
  if (!isOpen || !publication) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="scroll-modal-parchment p-8 rounded-lg shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 medieval-button rounded-full p-2 text-orange-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-2 bg-amber-200 rounded-full mb-4">
              <span className="text-amber-800 font-cinzel font-bold text-sm">Scholarly Manuscript</span>
            </div>
            <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full opacity-60" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Illuminated Title */}
            <div>
              <div className="float-left mr-4 mb-2">
                <span className="illuminated-letter text-6xl font-cinzel text-amber-700 leading-none">
                  {publication.title.charAt(0)}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-amber-900 font-cinzel leading-tight mb-4">
                {publication.title.substring(1)}
              </h2>
            </div>

            {/* Metadata */}
            <div className="flex flex-col gap-3 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
              <div className="flex items-center gap-2">
                <span className="text-amber-700 font-garamond font-semibold">Journal:</span>
                <span className="text-amber-800 font-garamond italic">{publication.journal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-700 font-garamond font-semibold">Year:</span>
                <span className="text-amber-800 font-garamond">Anno Domini {publication.year}</span>
              </div>
            </div>

            {/* Abstract */}
            {publication.abstract && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-amber-900 font-cinzel">Abstract</h3>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-garamond leading-relaxed text-lg italic">{publication.abstract}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            {publication.link && (
              <div className="text-center pt-6">
                <a
                  href={publication.link}
                  className="medieval-button text-orange-100 px-8 py-3 rounded-lg font-garamond inline-flex items-center gap-3 text-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Read Full Manuscript
                </a>
              </div>
            )}
          </div>

          {/* Decorative Footer */}
          <div className="text-center mt-8 pt-6 border-t border-amber-300">
            <div className="w-16 h-1 bg-amber-600 mx-auto rounded-full opacity-60 mb-4" />
            <p className="text-amber-600 font-garamond italic text-sm">"Knowledge shared is wisdom multiplied"</p>
          </div>
        </div>
      </div>
    </div>
  )
}
