"use client"

import { type ChangeEvent, type FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Feather, MailCheck, Send } from "lucide-react"

interface LetterComposerProps {
  className?: string
}

const LETTER_DRAFT_STORAGE_KEY = "letter-composer-draft-v1"

const parchmentStyle = {
  background:
    "radial-gradient(circle at 18% 16%, rgba(255,255,255,0.36) 0%, transparent 28%), radial-gradient(circle at 82% 78%, rgba(160,82,45,0.08) 0%, transparent 30%), linear-gradient(135deg, #f9f0dd 0%, #f2e0bf 48%, #e6cfab 100%)",
  boxShadow: "0 26px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
}

const rodStyle = {
  background: "linear-gradient(180deg, #cb8a41 0%, #8f4d1a 48%, #d1984b 100%)",
  boxShadow: "0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,240,214,0.35)",
}

const letterFieldLabelClassName = "font-garamond text-sm italic tracking-[0.06em] text-amber-900/62"

const lineFieldClassName =
  "mt-1.5 w-full border-0 border-b border-amber-900/22 bg-transparent px-0 pb-2 pt-1 font-garamond text-lg text-amber-950 outline-none transition-[border-color,color,opacity] duration-200 placeholder:text-amber-900/42 focus:border-amber-800/55 focus:ring-0"

const messageFieldClassName =
  "mt-1.5 w-full min-h-[3rem] overflow-hidden border-0 border-b border-amber-900/22 bg-transparent px-0 pb-2 pt-1 font-garamond text-lg leading-8 text-amber-950 outline-none transition-[height,border-color,color,opacity] duration-200 ease-out placeholder:text-amber-900/42 focus:border-amber-800/55 focus:ring-0 resize-none"

const resizeTextarea = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "0px"
  textarea.style.height = `${textarea.scrollHeight}px`
}

export default function LetterComposer({ className = "" }: LetterComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [letterSent, setLetterSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resetTimerRef = useRef<number | null>(null)
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [formData, setFormData] = useState(() => {
    if (typeof window === "undefined") {
      return { name: "", email: "", message: "" }
    }

    const savedDraft = window.sessionStorage.getItem(LETTER_DRAFT_STORAGE_KEY)

    if (!savedDraft) {
      return { name: "", email: "", message: "" }
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as Partial<{ name: string; email: string; message: string }>

      return {
        name: parsedDraft.name ?? "",
        email: parsedDraft.email ?? "",
        message: parsedDraft.message ?? "",
      }
    } catch {
      return { name: "", email: "", message: "" }
    }
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  useLayoutEffect(() => {
    if (!messageTextareaRef.current) return

    resizeTextarea(messageTextareaRef.current)
  }, [formData.message])

  useEffect(() => {
    if (typeof window === "undefined" || letterSent) return

    const hasDraftContent = Object.values(formData).some((value) => value.trim().length > 0)

    if (!hasDraftContent) {
      window.sessionStorage.removeItem(LETTER_DRAFT_STORAGE_KEY)
      return
    }

    window.sessionStorage.setItem(LETTER_DRAFT_STORAGE_KEY, JSON.stringify(formData))
  }, [formData, letterSent])

  const handleLetterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/send-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to send')

      setLetterSent(true)
      window.sessionStorage.removeItem(LETTER_DRAFT_STORAGE_KEY)

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }

      resetTimerRef.current = window.setTimeout(() => {
        setLetterSent(false)
        setFormData({ name: "", email: "", message: "" })
      }, 5000)
    } catch {
      setError('The letter could not be sent. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 ${className}`}>
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
        className="relative overflow-hidden rounded-[2rem] border border-amber-950/20 px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10"
        style={parchmentStyle}
      >
        <div className="pointer-events-none absolute left-5 top-5 h-5 w-5 border-l-2 border-t-2 border-amber-700/55" />
        <div className="pointer-events-none absolute right-5 top-5 h-5 w-5 border-r-2 border-t-2 border-amber-700/55" />
        <div className="pointer-events-none absolute bottom-5 left-5 h-5 w-5 border-b-2 border-l-2 border-amber-700/55" />
        <div className="pointer-events-none absolute bottom-5 right-5 h-5 w-5 border-b-2 border-r-2 border-amber-700/55" />
        <Feather className="pointer-events-none absolute right-8 top-8 h-24 w-24 -rotate-12 text-amber-900/10" />

        {!letterSent ? (
          <form className="relative z-10 space-y-7 md:space-y-8" onSubmit={handleLetterSubmit}>
            <div className="max-w-2xl">
              <p className="font-garamond text-lg italic leading-relaxed text-amber-800 md:text-xl">
                If these pages speak to your own work, send word by firelight. I read every thoughtful note.
              </p>
            </div>

            <p className="font-garamond text-2xl italic text-amber-900/90">Dear Fellow Wanderer,</p>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className={letterFieldLabelClassName}>
                  Your name
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={lineFieldClassName}
                  placeholder="By what name shall I know you?"
                />
              </label>

              <label className="block">
                <span className={letterFieldLabelClassName}>
                  Your reply address
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={lineFieldClassName}
                  placeholder="your.email@realm.com"
                />
              </label>
            </div>

            <label className="block">
              <span className={letterFieldLabelClassName}>
                Your letter
              </span>
              <textarea
                ref={messageTextareaRef}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={1}
                className={messageFieldClassName}
                placeholder="Share your thoughts, your work, your questions, or simply say hello."
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-red-700/20 bg-red-50/80 px-4 py-3 font-garamond text-base text-red-800">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 pt-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-garamond text-lg italic text-amber-800">With warm regards from the hearth,</p>
                <p className="mt-1 font-cinzel text-xl text-amber-950/90">Leonardo</p>
              </div>

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
