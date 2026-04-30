import { arcEntries } from "./arcs"
import { noteEntries } from "./notes"
import { projectEntries } from "./projects"
import { publicationEntries } from "./publications"

export type EntryType = "arc" | "project" | "publication" | "note"

export interface EntryImage {
  src: string
  alt: string
}

export interface EntryLink {
  label: string
  href: string
  kind: "repository" | "demo" | "reference"
  showOnCard?: boolean
}

interface BaseEntry {
  slug: string
  type: EntryType
  title: string
  summary: string
  tags: string[]
  subtitle?: string
  yearLabel?: string
  location?: string
  status?: string
  dateLabel?: string
  mood?: string
  order?: number
}

export interface ArcEntry extends BaseEntry {
  type: "arc"
  yearLabel: string
  location: string
  mood: string
  chapter: string
  images: EntryImage[]
  coordinates: {
    top: string
    left: string
  }
  whatIDid: string[]
  whomIMet: string[]
  whatILearned: string[]
  whatIAchieved: string[]
}

export interface ProjectEntry extends BaseEntry {
  type: "project"
  description: string
  detailSections: {
    label: string
    content: string
  }[]
  links: EntryLink[]
}

export interface PublicationEntry extends BaseEntry {
  type: "publication"
  journal: string
  yearLabel: string
  abstract: string
  researchQuestion: string
  methodology: string
  findings: string
  implications: string
  fullPaper?: string
  link?: EntryLink
}

export interface NoteEntry extends BaseEntry {
  type: "note"
  noteLabel: string
  body: string[]
}

export type ContentEntry = ArcEntry | ProjectEntry | PublicationEntry | NoteEntry

type EntryMap = {
  arc: ArcEntry
  project: ProjectEntry
  publication: PublicationEntry
  note: NoteEntry
}

const archiveTypeOrder: Record<EntryType, number> = {
  publication: 0,
  project: 1,
  note: 2,
  arc: 3,
}

const allEntries = [...publicationEntries, ...projectEntries, ...noteEntries, ...arcEntries].sort((left, right) => {
  const typeDelta = archiveTypeOrder[left.type] - archiveTypeOrder[right.type]
  if (typeDelta !== 0) return typeDelta
  return (left.order ?? 999) - (right.order ?? 999)
})

const entriesBySlug = new Map(allEntries.map((entry) => [entry.slug, entry]))

const typeLabels: Record<EntryType, { kind: string; collection: string; previewHeading: string }> = {
  arc: {
    kind: "Journey",
    collection: "Wanderer's Map",
    previewHeading: "Journey Notes",
  },
  project: {
    kind: "Spell Scroll",
    collection: "Spell Scrolls",
    previewHeading: "Spell Summary",
  },
  publication: {
    kind: "Publication",
    collection: "Scholar Scrolls",
    previewHeading: "Abstract",
  },
  note: {
    kind: "Campfire Note",
    collection: "Campfire Notes",
    previewHeading: "Note Preview",
  },
}

export function isArcEntry(entry: ContentEntry): entry is ArcEntry {
  return entry.type === "arc"
}

export function isProjectEntry(entry: ContentEntry): entry is ProjectEntry {
  return entry.type === "project"
}

export function isPublicationEntry(entry: ContentEntry): entry is PublicationEntry {
  return entry.type === "publication"
}

export function isNoteEntry(entry: ContentEntry): entry is NoteEntry {
  return entry.type === "note"
}

const entriesByType = {
  arc: arcEntries,
  project: projectEntries,
  publication: publicationEntries,
  note: noteEntries,
} satisfies { [K in EntryType]: EntryMap[K][] }

export { arcEntries, projectEntries, publicationEntries, noteEntries }

export function getAllEntries() {
  return allEntries
}

export function getEntriesByType<T extends EntryType>(type: T): EntryMap[T][] {
  return entriesByType[type] as EntryMap[T][]
}

export function getEntryBySlug(slug: string) {
  return entriesBySlug.get(slug)
}

export function getEntryKindLabel(entry: ContentEntry) {
  return typeLabels[entry.type].kind
}

export function getEntryCollectionLabel(entry: ContentEntry) {
  return typeLabels[entry.type].collection
}

export function getEntryPreviewHeading(entry: ContentEntry) {
  return typeLabels[entry.type].previewHeading
}

export function getEntryPeriodLabel(entry: ContentEntry) {
  if (entry.type === "publication") return `Anno Domini ${entry.yearLabel}`
  return entry.dateLabel ?? entry.yearLabel ?? entry.status ?? "Undated"
}

export function getEntryPreviewText(entry: ContentEntry) {
  switch (entry.type) {
    case "arc":
      return entry.chapter
    case "project":
      return entry.description
    case "publication":
      return entry.abstract
    case "note":
      return entry.summary
  }
}

function getEntrySearchText(entry: ContentEntry) {
  switch (entry.type) {
    case "arc":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.chapter,
        entry.location,
        entry.yearLabel,
        entry.mood,
        entry.tags.join(" "),
        entry.whatIDid.join(" "),
        entry.whomIMet.join(" "),
        entry.whatILearned.join(" "),
        entry.whatIAchieved.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    case "project":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.description,
        entry.status,
        entry.dateLabel,
        entry.tags.join(" "),
        entry.detailSections.map((section) => `${section.label} ${section.content}`).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    case "publication":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.abstract,
        entry.journal,
        entry.yearLabel,
        entry.status,
        entry.tags.join(" "),
        entry.researchQuestion,
        entry.methodology,
        entry.findings,
        entry.implications,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    case "note":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.noteLabel,
        entry.dateLabel,
        entry.tags.join(" "),
        entry.body.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
  }
}

export function searchEntries(query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery === "") return allEntries
  return allEntries.filter((entry) => getEntrySearchText(entry).includes(normalizedQuery))
}
