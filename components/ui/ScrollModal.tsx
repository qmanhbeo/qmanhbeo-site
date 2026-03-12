"use client"

import { ExternalLink, X } from "lucide-react"
import { type Publication } from "@/utils/content"

interface ScrollModalProps {
  publication: Publication | null
  isOpen: boolean
  onClose: () => void
}

export default function ScrollModal({ publication, isOpen, onClose }: ScrollModalProps) {
  if (!isOpen || !publication) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <div className="scroll-modal-parchment rounded-lg p-8 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-orange-100 medieval-button"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-amber-200 px-6 py-2">
              <span className="font-cinzel text-sm font-bold text-amber-800">Scholarly Manuscript</span>
            </div>
            <div className="mx-auto h-1 w-24 rounded-full bg-amber-600 opacity-60" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="float-left mb-2 mr-4">
                <span className="illuminated-letter font-cinzel text-6xl leading-none text-amber-700">
                  {publication.title.charAt(0)}
                </span>
              </div>
              <h2 className="mb-4 font-cinzel text-3xl font-bold leading-tight text-amber-900">
                {publication.title.substring(1)}
              </h2>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border-l-4 border-amber-600 bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <span className="font-garamond font-semibold text-amber-700">Journal:</span>
                <span className="font-garamond italic text-amber-800">{publication.journal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-garamond font-semibold text-amber-700">Year:</span>
                <span className="font-garamond text-amber-800">Anno Domini {publication.year}</span>
              </div>
            </div>

            {publication.abstract && (
              <div className="space-y-4">
                <h3 className="font-cinzel text-xl font-bold text-amber-900">Abstract</h3>
                <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                  <p className="font-garamond text-lg italic leading-relaxed text-amber-800">{publication.abstract}</p>
                </div>
              </div>
            )}

            {publication.link && publication.link !== "#" && (
              <div className="pt-6 text-center">
                <a
                  href={publication.link}
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-3 font-garamond text-lg text-orange-100 medieval-button"
                >
                  <ExternalLink className="h-5 w-5" />
                  Read Full Manuscript
                </a>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-amber-300 pt-6 text-center">
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-amber-600 opacity-60" />
            <p className="font-garamond text-sm italic text-amber-600">
              &quot;Knowledge shared is wisdom multiplied&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
