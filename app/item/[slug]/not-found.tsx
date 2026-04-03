import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ItemNotFound() {
  return (
    <div className="h-dvh forest-campfire">
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/45" />

      <div className="relative z-10 mx-auto flex h-full max-w-3xl items-center justify-center px-6">
        <div className="rounded-3xl border border-amber-200/30 bg-amber-50/85 p-8 text-center shadow-2xl md:p-12">
          <p className="font-garamond text-sm uppercase tracking-[0.22em] text-amber-700">Uncatalogued Scroll</p>
          <h1 className="mt-4 font-cinzel text-3xl font-bold text-amber-950 md:text-4xl">This entry is not in the codex</h1>
          <p className="mx-auto mt-4 max-w-xl font-garamond text-lg italic text-amber-800">
            The requested slug does not match any known journey, manuscript, spell scroll, or campfire note.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-garamond medieval-button text-orange-100 transition-all duration-300 hover:ember-glow"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Hearth
          </Link>
        </div>
      </div>
    </div>
  )
}
