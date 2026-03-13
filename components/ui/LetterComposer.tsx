"use client"

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react"
import { Feather, MailCheck, Send } from "lucide-react"

interface LetterComposerProps {
  className?: string
}

const parchmentStyle = {
  background:
    "radial-gradient(circle at 18% 16%, rgba(255,255,255,0.36) 0%, transparent 28%), radial-gradient(circle at 82% 78%, rgba(160,82,45,0.08) 0%, transparent 30%), linear-gradient(135deg, #f9f0dd 0%, #f2e0bf 48%, #e6cfab 100%)",
  boxShadow: "0 26px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
}

const rodStyle = {
  background: "linear-gradient(180deg, #cb8a41 0%, #8f4d1a 48%, #d1984b 100%)",
  boxShadow: "0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,240,214,0.35)",
}

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-amber-900/20 bg-amber-50/85 px-4 py-3 text-base text-amber-950 shadow-sm outline-none transition placeholder:text-amber-800/55 focus:border-amber-700/45 focus:bg-amber-50 focus:ring-2 focus:ring-amber-500/25"

export default function LetterComposer({ className = "" }: LetterComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [letterSent, setLetterSent] = useState(false)
  const resetTimerRef = useRef<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleLetterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setLetterSent(true)

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = window.setTimeout(() => {
      setLetterSent(false)
      setFormData({ name: "", email: "", message: "" })
    }, 5000)
  }

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center">
        <span className="h-9 w-9 rounded-full border border-amber-950/25" style={rodStyle} />
        <span className="h-6 flex-1 rounded-full border border-amber-950/20" style={rodStyle} />
        <span className="h-9 w-9 rounded-full border border-amber-950/25" style={rodStyle} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center">
        <span className="h-9 w-9 rounded-full border border-amber-950/25" style={rodStyle} />
        <span className="h-6 flex-1 rounded-full border border-amber-950/20" style={rodStyle} />
        <span className="h-9 w-9 rounded-full border border-amber-950/25" style={rodStyle} />
      </div>

      <div
        className="relative overflow-hidden rounded-[2rem] border border-amber-950/20 px-6 pb-12 pt-12 md:px-10 md:pb-14 md:pt-14"
        style={parchmentStyle}
      >
        <div className="pointer-events-none absolute left-5 top-5 h-5 w-5 border-l-2 border-t-2 border-amber-700/55" />
        <div className="pointer-events-none absolute right-5 top-5 h-5 w-5 border-r-2 border-t-2 border-amber-700/55" />
        <div className="pointer-events-none absolute bottom-5 left-5 h-5 w-5 border-b-2 border-l-2 border-amber-700/55" />
        <div className="pointer-events-none absolute bottom-5 right-5 h-5 w-5 border-b-2 border-r-2 border-amber-700/55" />
        <Feather className="pointer-events-none absolute right-8 top-8 h-24 w-24 -rotate-12 text-amber-900/10" />

        {!letterSent ? (
          <form className="relative z-10 space-y-6" onSubmit={handleLetterSubmit}>
            <div className="text-center">
              <p className="font-cinzel text-xs font-semibold uppercase tracking-[0.35em] text-amber-700/80">
                Correspondence
              </p>
              <h3 className="mt-4 font-cinzel text-3xl font-bold text-amber-950 md:text-4xl">Unfurl a Letter</h3>
              <p className="mx-auto mt-3 max-w-2xl font-garamond text-lg italic leading-relaxed text-amber-800">
                If these pages speak to your own work, send word by firelight. I read every thoughtful note.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-900/10 bg-amber-50/30 p-5 shadow-inner shadow-amber-900/5">
              <p className="font-garamond text-xl italic text-amber-900">Dear Fellow Wanderer,</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="font-cinzel text-sm font-semibold uppercase tracking-wide text-amber-900">
                  Your Name
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={fieldClassName}
                  placeholder="By what name shall I know you?"
                />
              </label>

              <label className="block">
                <span className="font-cinzel text-sm font-semibold uppercase tracking-wide text-amber-900">
                  Your Reply Address
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={fieldClassName}
                  placeholder="your.email@realm.com"
                />
              </label>
            </div>

            <label className="block">
              <span className="font-cinzel text-sm font-semibold uppercase tracking-wide text-amber-900">
                Your Letter
              </span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={8}
                className={`${fieldClassName} scrollbar-fade min-h-[14rem] resize-y`}
                placeholder="Share your thoughts, your work, your questions, or simply say hello."
              />
            </label>

            <div className="flex flex-col gap-4 border-t border-amber-900/15 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="font-garamond text-lg italic text-amber-800">With warm regards from the hearth,</p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group medieval-button inline-flex items-center justify-center gap-3 self-start rounded-full px-8 py-4 font-garamond text-lg text-orange-100 transition-all duration-300 hover:ember-glow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Feather className="h-5 w-5 animate-pulse" />
                    <span>Sealing with wax...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    <span>Send Letter</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="relative z-10 flex flex-col items-center py-10 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-900/15 bg-amber-100/80 text-amber-800 shadow-inner shadow-amber-900/10">
              <MailCheck className="h-9 w-9" />
            </div>

            <h3 className="font-cinzel text-3xl font-bold text-amber-950 md:text-4xl">Letter Dispatched</h3>
            <p className="mx-auto mt-4 max-w-2xl font-garamond text-xl italic leading-relaxed text-amber-800">
              Your words are on their way through the night. I&apos;ll write back as soon as I can.
            </p>
            <div className="mt-6 rounded-full bg-amber-100/80 px-5 py-2 font-garamond text-base italic text-amber-800 shadow-sm">
              Usually within a few days.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
