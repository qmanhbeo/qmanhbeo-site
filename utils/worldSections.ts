export type WorldSectionId = "projects" | "publications" | "blog" | "letter"
export type SectionSurface = "home" | "world-panel"

export type CanonicalEntryOriginSection =
  | "archive"
  | "blog"
  | "letter"
  | "map"
  | "projects"
  | "publications"

export type LegacyEntryOriginSection = "notes" | "scrolls"

export type EntryOriginSectionLike =
  | CanonicalEntryOriginSection
  | LegacyEntryOriginSection
  | null
  | undefined

export const WORLD_SECTION_LABELS: Record<WorldSectionId, string> = {
  projects: "Workshop / Projects",
  publications: "Library / Publications",
  blog: "Tavern / Notes",
  letter: "Post Office / Letter",
}

export const LEGACY_ENTRY_SECTION_ALIASES: Record<LegacyEntryOriginSection, CanonicalEntryOriginSection> = {
  notes: "blog",
  scrolls: "publications",
}

export function normalizeEntryOriginSection(
  section: EntryOriginSectionLike,
): CanonicalEntryOriginSection | undefined {
  if (!section) return undefined
  if (section in LEGACY_ENTRY_SECTION_ALIASES) {
    return LEGACY_ENTRY_SECTION_ALIASES[section as LegacyEntryOriginSection]
  }
  return section as CanonicalEntryOriginSection
}
