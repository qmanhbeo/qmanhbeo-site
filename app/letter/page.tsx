"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import LetterComposer from "@/components/ui/LetterComposer"

export default function LetterPage() {
  return (
    <div className="min-h-screen forest-campfire">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="medieval-button mb-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-garamond text-orange-100 transition-all duration-300 hover:ember-glow"
          >
            <ArrowLeft className="h-5 w-5" />
            Return to Hearth
          </Link>

          <h1 className="font-cinzel text-4xl font-bold text-orange-100 md:text-6xl">Write Me a Letter</h1>
          <p className="mx-auto mt-4 max-w-2xl font-garamond text-lg italic leading-relaxed text-orange-200 md:text-xl">
            In an age of passing messages, this page keeps room for thoughtful correspondence.
          </p>
        </div>

        <LetterComposer />
      </div>
    </div>
  )
}
