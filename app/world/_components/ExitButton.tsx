"use client"

import { Home } from "lucide-react"

export default function ExitButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-[#1b110c]/90 px-4 py-2 font-cinzel text-sm text-amber-100 transition hover:border-amber-400/60 hover:bg-[#2a1810]"
    >
      <Home className="h-4 w-4" />
      Return Home
    </button>
  )
}
