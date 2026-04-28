"use client"

import Link from "next/link"

export default function WorldError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0a0604] px-6 text-amber-50">
      <div className="max-w-md text-center">
        <p className="font-cinzel text-xl font-semibold">Something went wrong loading the world.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-amber-400/35 px-5 py-2 font-cinzel text-sm text-amber-100 transition hover:border-amber-300/60"
          >
            Try again
          </button>
          <Link className="font-garamond text-sm text-amber-200/80 underline underline-offset-4" href="/">
            Return home
          </Link>
        </div>
      </div>
    </main>
  )
}
