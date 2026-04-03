"use client"

import Image from "next/image"
import { type MouseEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, ExternalLink, MapPin } from "lucide-react"
import {
  getEntryCollectionLabel,
  getEntryKindLabel,
  getEntryPeriodLabel,
  isArcEntry,
  isNoteEntry,
  isProjectEntry,
  isPublicationEntry,
  type ContentEntry,
  type EntryLink,
} from "@/content/entries"

function DetailCard({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-white/65 p-5">
      <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">{label}</h2>
      <p className="mt-3 font-garamond text-lg leading-relaxed text-amber-900">{content}</p>
    </div>
  )
}

function DetailListCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-white/65 p-5">
      <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">{label}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 font-garamond text-lg leading-relaxed text-amber-900">
            <span className="mt-1 text-amber-600">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EntryLinks({ links }: { links: EntryLink[] }) {
  if (links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-garamond text-base text-orange-100 medieval-button transition-all duration-300 hover:ember-glow"
        >
          <ExternalLink className="h-4 w-4" />
          {link.label}
        </a>
      ))}
    </div>
  )
}

function ArcBody({ entry }: { entry: Extract<ContentEntry, { type: "arc" }> }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/80 p-6">
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="rounded-full bg-amber-100 px-4 py-2 font-garamond text-base italic text-amber-800">
            {entry.mood}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 font-garamond text-base text-amber-800">
            <MapPin className="h-4 w-4" />
            {entry.location}
          </span>
        </div>
        <p className="mt-5 font-garamond text-xl italic leading-relaxed text-amber-900">{entry.chapter}</p>
      </div>

      {entry.images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entry.images.map((image) => (
            <div key={image.src} className="wooden-frame overflow-hidden rounded-2xl">
              <Image
                src={image.src}
                alt={image.alt}
                width={640}
                height={480}
                className="h-56 w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <DetailListCard label="What I Did" items={entry.whatIDid} />
        <DetailListCard label="Whom I Met" items={entry.whomIMet} />
        <DetailListCard label="What I Learned" items={entry.whatILearned} />
        <DetailListCard label="What I Achieved" items={entry.whatIAchieved} />
      </div>
    </div>
  )
}

function ProjectBody({ entry }: { entry: Extract<ContentEntry, { type: "project" }> }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/80 p-6">
        <p className="font-garamond text-xl italic leading-relaxed text-amber-900">{entry.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entry.detailSections.map((section) => (
          <DetailCard key={section.label} label={section.label} content={section.content} />
        ))}
      </div>

      {entry.links.length > 0 ? (
        <div className="rounded-2xl border border-amber-200/70 bg-white/65 p-5">
          <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Project Links</h2>
          <div className="mt-4">
            <EntryLinks links={entry.links} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PublicationBody({ entry }: { entry: Extract<ContentEntry, { type: "publication" }> }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/70 bg-white/65 p-5">
        <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Venue</h2>
        <p className="mt-3 font-garamond text-lg italic text-amber-900">{entry.journal}</p>
      </div>

      <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/80 p-6">
        <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Abstract</h2>
        <p className="mt-4 font-garamond text-xl italic leading-relaxed text-amber-900">{entry.abstract}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard label="Research Question" content={entry.researchQuestion} />
        <DetailCard label="Methodology" content={entry.methodology} />
        <DetailCard label="Key Findings" content={entry.findings} />
        <DetailCard label="Implications" content={entry.implications} />
      </div>

      {entry.link ? (
        <div className="rounded-2xl border border-amber-200/70 bg-white/65 p-5">
          <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Manuscript Link</h2>
          <div className="mt-4">
            <EntryLinks links={[entry.link]} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NoteBody({ entry }: { entry: Extract<ContentEntry, { type: "note" }> }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/80 p-6">
        <h2 className="font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Excerpt</h2>
        <p className="mt-4 font-garamond text-xl italic leading-relaxed text-amber-900">{entry.excerpt}</p>
      </div>

      <div className="space-y-4 rounded-3xl border border-amber-200/70 bg-white/65 p-6">
        {entry.body.map((paragraph) => (
          <p key={paragraph} className="font-garamond text-lg leading-relaxed text-amber-900">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

function EntryBody({ entry }: { entry: ContentEntry }) {
  if (isArcEntry(entry)) return <ArcBody entry={entry} />
  if (isProjectEntry(entry)) return <ProjectBody entry={entry} />
  if (isPublicationEntry(entry)) return <PublicationBody entry={entry} />
  if (isNoteEntry(entry)) return <NoteBody entry={entry} />
  return null
}

export default function ItemPageContent({ entry }: { entry: ContentEntry }) {
  const router = useRouter()
  const [isLeaving, setIsLeaving] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleReturn = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isLeaving) return
    setIsLeaving(true)
    timerRef.current = window.setTimeout(() => router.push("/"), 320)
  }

  return (
    <div className="h-dvh forest-campfire">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/40" />

      <div
        className={`relative z-10 mx-auto flex h-full max-w-5xl flex-col px-4 py-8 md:px-6 md:py-12 ${
          isLeaving
            ? "animate-out fade-out zoom-out-95 duration-300 fill-mode-both"
            : "animate-in fade-in zoom-in-95 duration-500"
        }`}
      >
        <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2 font-garamond medieval-button text-sm text-orange-100 transition-all duration-300 hover:ember-glow"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Hearth
          </button>

          <div className="hidden flex-col items-end text-right font-garamond text-xs text-orange-200 md:flex">
            <span className="uppercase tracking-[0.18em]">Archive Entry</span>
            <span className="text-[0.7rem] italic opacity-80">{entry.slug}</span>
          </div>
        </div>

        <main className="relative flex min-h-0 flex-1 flex-col rounded-3xl border border-amber-200/30 bg-amber-50/80 p-6 shadow-2xl md:p-10">
          <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 scholar-parchment" />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6">
            <header className="flex-shrink-0 text-center">
              <p className="mb-3 inline-flex flex-wrap items-center justify-center gap-3 font-garamond text-xs uppercase tracking-[0.18em] text-amber-800">
                <span className="rounded-full bg-amber-100 px-3 py-1">{getEntryKindLabel(entry)}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">{getEntryCollectionLabel(entry)}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">{getEntryPeriodLabel(entry)}</span>
              </p>

              <h1 className="map-sky-ink-strong font-cinzel text-3xl font-bold leading-tight md:text-5xl">{entry.title}</h1>
              <p className="map-sky-ink mx-auto mt-4 max-w-3xl font-garamond text-base italic md:text-xl">
                {entry.subtitle}
              </p>
            </header>

            <section className="scrollable-content min-h-0 flex-1 overflow-y-auto rounded-2xl border border-amber-200/60 bg-white/70 p-5 md:p-7">
              <EntryBody entry={entry} />
            </section>

            <footer className="mt-2 flex-shrink-0 border-t border-amber-200 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-garamond text-amber-700 md:text-sm">
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[0.7rem] uppercase tracking-[0.14em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-2 italic text-amber-600">
                  <BookOpen className="h-4 w-4" />
                  This entry now lives in the shared codex.
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
