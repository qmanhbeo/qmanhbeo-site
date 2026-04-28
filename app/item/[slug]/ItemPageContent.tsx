"use client"

import Image from "next/image"
import { type UIEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, X } from "lucide-react"
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
import {
  clearEntryOriginState,
  readEntryOriginState,
  readItemScrollState,
  saveItemScrollState,
  savePendingReturnState,
} from "@/utils/entryNavigation"
import AmbientPlayer from "@/components/ui/AmbientPlayer"

interface MetaItem {
  label: string
  value: string
}

function getEntryMetaItems(entry: ContentEntry): MetaItem[] {
  const items: MetaItem[] = [
    { label: "Date", value: getEntryPeriodLabel(entry) },
    { label: "Category", value: getEntryKindLabel(entry) },
  ]

  if (entry.type === "arc") {
    items.push({ label: "Place", value: entry.location })
    items.push({ label: "Mood", value: entry.mood })
  }

  if (entry.type === "project" && entry.status) {
    items.push({ label: "Status", value: entry.status })
  }

  if (entry.type === "publication") {
    items.push({ label: "Venue", value: entry.journal })
    if (entry.status) {
      items.push({ label: "Status", value: entry.status })
    }
  }

  if (entry.type === "note") {
    items.push({ label: "Note Type", value: entry.noteLabel })
  }

  return items
}

function ManuscriptSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="item-manuscript-rule border-t pt-8">
      <h2 className="item-manuscript-heading font-cinzel text-xl font-bold tracking-[0.04em] md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function ManuscriptParagraph({ children, lead = false }: { children: React.ReactNode; lead?: boolean }) {
  return (
    <p
      className={`item-manuscript-ink font-garamond leading-relaxed ${
        lead ? "text-xl italic md:text-[1.5rem]" : "text-lg md:text-[1.2rem]"
      }`}
    >
      {children}
    </p>
  )
}

function ManuscriptList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2 marker:text-[#5a3117]">
      {items.map((item) => (
        <li key={item} className="item-manuscript-ink font-garamond text-lg leading-relaxed md:text-[1.2rem]">
          {item}
        </li>
      ))}
    </ul>
  )
}

function ResourceLinks({ links }: { links: EntryLink[] }) {
  if (links.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="item-manuscript-ink inline-flex w-fit items-center gap-2 font-garamond text-lg underline decoration-amber-700/45 underline-offset-4 transition-colors duration-200 hover:text-orange-800"
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
    <div className="space-y-8">
      <ManuscriptSection title="Chapter">
        <ManuscriptParagraph>{entry.chapter}</ManuscriptParagraph>
      </ManuscriptSection>

      {entry.images.length > 0 ? (
        <ManuscriptSection title="Moments from the Road">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entry.images.map((image) => (
              <figure key={image.src} className="overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(55,27,10,0.18)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={720}
                  height={540}
                  className="h-56 w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </ManuscriptSection>
      ) : null}

      <ManuscriptSection title="What I Did">
        <ManuscriptList items={entry.whatIDid} />
      </ManuscriptSection>

      <ManuscriptSection title="Whom I Met">
        <ManuscriptList items={entry.whomIMet} />
      </ManuscriptSection>

      <ManuscriptSection title="What I Learned">
        <ManuscriptList items={entry.whatILearned} />
      </ManuscriptSection>

      <ManuscriptSection title="What I Achieved">
        <ManuscriptList items={entry.whatIAchieved} />
      </ManuscriptSection>
    </div>
  )
}

function ProjectBody({ entry }: { entry: Extract<ContentEntry, { type: "project" }> }) {
  return (
    <div className="space-y-8">
      <ManuscriptSection title="Overview">
        <ManuscriptParagraph>{entry.description}</ManuscriptParagraph>
      </ManuscriptSection>

      {entry.detailSections.map((section) => (
        <ManuscriptSection key={section.label} title={section.label}>
          <ManuscriptParagraph>{section.content}</ManuscriptParagraph>
        </ManuscriptSection>
      ))}

      {entry.links.length > 0 ? (
        <ManuscriptSection title="Resources">
          <ResourceLinks links={entry.links} />
        </ManuscriptSection>
      ) : null}
    </div>
  )
}

function PublicationBody({ entry }: { entry: Extract<ContentEntry, { type: "publication" }> }) {
  return (
    <div className="space-y-8">
      <ManuscriptSection title="Abstract">
        <ManuscriptParagraph>{entry.abstract}</ManuscriptParagraph>
      </ManuscriptSection>

      <ManuscriptSection title="Research Question">
        <ManuscriptParagraph>{entry.researchQuestion}</ManuscriptParagraph>
      </ManuscriptSection>

      <ManuscriptSection title="Methodology">
        <ManuscriptParagraph>{entry.methodology}</ManuscriptParagraph>
      </ManuscriptSection>

      <ManuscriptSection title="Findings">
        <ManuscriptParagraph>{entry.findings}</ManuscriptParagraph>
      </ManuscriptSection>

      <ManuscriptSection title="Implications">
        <ManuscriptParagraph>{entry.implications}</ManuscriptParagraph>
      </ManuscriptSection>

      {entry.fullPaper ? (
        <ManuscriptSection title="Full Paper">
          <ManuscriptParagraph>{entry.fullPaper}</ManuscriptParagraph>
        </ManuscriptSection>
      ) : null}

      {entry.link ? (
        <ManuscriptSection title="Resources">
          <ResourceLinks links={[entry.link]} />
        </ManuscriptSection>
      ) : null}
    </div>
  )
}

function NoteBody({ entry }: { entry: Extract<ContentEntry, { type: "note" }> }) {
  return (
    <div className="space-y-8">
      <ManuscriptSection title="Opening Note">
        <ManuscriptParagraph>{entry.excerpt}</ManuscriptParagraph>
      </ManuscriptSection>

      <ManuscriptSection title="Full Entry">
        {entry.body.map((paragraph) => (
          <ManuscriptParagraph key={paragraph}>{paragraph}</ManuscriptParagraph>
        ))}
      </ManuscriptSection>
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

export default function ItemPageContent({
  entry,
  presentation = "page",
}: {
  entry: ContentEntry
  presentation?: "page" | "modal"
}) {
  const router = useRouter()
  const isModal = presentation === "modal"
  const [isLeaving, setIsLeaving] = useState(false)
  const isLeavingRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const scrollSaveFrameRef = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [initialItemScrollState] = useState(() => readItemScrollState(entry.slug))
  const originStateRef = useRef(readEntryOriginState(entry.slug))
  const restoredItemScrollRef = useRef(initialItemScrollState)
  const lastKnownItemScrollRef = useRef(initialItemScrollState?.itemInternalScroll ?? 0)

  const saveCurrentItemScrollState = useCallback(() => {
    const nextScrollTop = scrollContainerRef.current?.scrollTop ?? lastKnownItemScrollRef.current
    lastKnownItemScrollRef.current = nextScrollTop

    saveItemScrollState({
      itemSlug: entry.slug,
      itemInternalScroll: nextScrollTop,
      origin: originStateRef.current ?? undefined,
    })
  }, [entry.slug])

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    lastKnownItemScrollRef.current = event.currentTarget.scrollTop

    if (scrollSaveFrameRef.current !== null) return

    scrollSaveFrameRef.current = window.requestAnimationFrame(() => {
      scrollSaveFrameRef.current = null
      saveCurrentItemScrollState()
    })
  }, [saveCurrentItemScrollState])

  const handleClose = useCallback(() => {
    if (isLeavingRef.current) return

    isLeavingRef.current = true
    saveCurrentItemScrollState()
    setIsLeaving(true)

    timerRef.current = window.setTimeout(() => {
      const originState = originStateRef.current

      if (isModal) {
        if (window.history.length > 1) {
          router.back()
          return
        }

        router.replace(originState?.sourceRoute ?? "/")
        return
      }

      if (originState) {
        savePendingReturnState(originState)

        if (window.history.length > 1) {
          router.back()
          return
        }

        router.replace(originState.sourceRoute)
        return
      }

      router.replace("/")
    }, 220)
  }, [isModal, router, saveCurrentItemScrollState])

  useLayoutEffect(() => {
    const savedScrollState = restoredItemScrollRef.current
    const scrollContainer = scrollContainerRef.current
    if (!savedScrollState || !scrollContainer) return

    scrollContainer.scrollTop = savedScrollState.itemInternalScroll
    lastKnownItemScrollRef.current = savedScrollState.itemInternalScroll
  }, [])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    const originalOverscrollBehavior = document.body.style.overscrollBehavior
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      handleClose()
    }
    const handlePageHide = () => {
      saveCurrentItemScrollState()
    }

    document.body.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "contain"
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscrollBehavior
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("pagehide", handlePageHide)

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }

      if (scrollSaveFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollSaveFrameRef.current)
      }

      saveCurrentItemScrollState()
      clearEntryOriginState(entry.slug)
    }
  }, [entry.slug, handleClose, saveCurrentItemScrollState])

  const metaItems = getEntryMetaItems(entry)
  const rootClassName = isModal ? "fixed inset-0 z-[90] overflow-hidden" : "relative h-dvh overflow-hidden forest-campfire"
  const backdropClassName = isModal
    ? "absolute inset-0 bg-slate-950/76 backdrop-blur-[3px]"
    : "absolute inset-0 bg-gradient-to-b from-black/52 via-black/28 to-black/56"

  return (
    <div className={`${rootClassName} item-page-outer`} onWheelCapture={(event) => event.stopPropagation()}>
      <div className={backdropClassName} />

      <div className="relative z-10 flex h-full items-center justify-center p-4 md:p-6" onClick={handleClose}>
        <article
          role={isModal ? "dialog" : undefined}
          aria-modal={isModal ? true : undefined}
          className={`item-manuscript-surface relative flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2.4rem] border border-amber-200/25 md:h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] ${
            isLeaving
              ? "animate-out fade-out zoom-out-95 duration-200 fill-mode-both"
              : "animate-in fade-in zoom-in-95 duration-500"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="item-manuscript-overlay pointer-events-none absolute inset-0 scholar-parchment" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close entry"
            className="item-manuscript-ink absolute right-4 top-4 z-20 rounded-full border border-amber-700/20 bg-[#f5eadc]/96 p-2.5 transition-all duration-200 hover:bg-white/95 hover:text-orange-800 md:right-6 md:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="item-manuscript-scroll relative z-10 min-h-0 flex-1 overflow-y-auto px-6 py-10 md:px-10 md:py-14"
            onScroll={handleScroll}
          >
            <div className="mx-auto max-w-[46rem]">
              <header className="item-manuscript-rule border-b pb-10 pr-12 md:pr-16">
                <p className="item-manuscript-ink-soft font-cinzel text-[0.72rem] font-semibold uppercase tracking-[0.26em]">
                  {getEntryCollectionLabel(entry)}
                </p>

                <h1 className="item-manuscript-heading mt-5 font-cinzel text-[2rem] font-bold leading-tight md:text-6xl">
                  {entry.title}
                </h1>

                {entry.subtitle ? (
                  <p className="item-manuscript-ink-soft mt-3 font-garamond text-[1.08rem] italic leading-relaxed md:mt-4 md:text-[1.65rem]">
                    {entry.subtitle}
                  </p>
                ) : null}

                <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {metaItems.map((item) => (
                    <p key={item.label} className="item-manuscript-ink font-garamond text-base md:text-lg">
                      <span className="item-manuscript-ink-soft font-cinzel text-[0.72rem] font-semibold uppercase tracking-[0.18em]">
                        {item.label}
                      </span>
                      <span className="ml-3">{item.value}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="item-manuscript-ink font-garamond text-xl italic leading-relaxed md:text-[1.45rem]">
                    {entry.summary}
                  </p>
                </div>

                {entry.tags.length > 0 ? (
                  <p className="item-manuscript-ink-soft mt-6 font-garamond text-sm uppercase tracking-[0.1em] md:text-[0.92rem]">
                    <span className="font-cinzel tracking-[0.18em]">Tags</span>
                    <span className="item-manuscript-ink ml-3 normal-case tracking-normal">{entry.tags.join(" / ")}</span>
                  </p>
                ) : null}
              </header>

              <div className="pt-10">
                <EntryBody entry={entry} />
              </div>
            </div>
          </div>
        </article>
      </div>
      <AmbientPlayer />
    </div>
  )
}
