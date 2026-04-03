import type { EntryType } from "@/content/entries"

export type EntryOriginSection = "map" | "projects" | "publications" | "notes" | "archive"

export interface EntryOriginState {
  sourceRoute: string
  sourceSection?: EntryOriginSection
  homeSectionIndex?: number
  sourceScrollY?: number
  sourceInternalScroll?: number
  sourceQuery?: string
  sourceFilterType?: EntryType | "all"
  sourceSelectedSlug?: string
  sourceCarouselIndex?: number
  sourceChapterIndex?: number
  sourceLeftPaneScrollTop?: number
  sourceRightPaneScrollTop?: number
  sourceListScrollTop?: number
  codexWasOpen?: boolean
  itemSlug: string
  updatedAt: number
}

export interface EntryScrollState {
  itemSlug: string
  itemInternalScroll: number
  origin?: EntryOriginState
  updatedAt: number
}

export type ArchiveCodexMobileView = "list" | "detail"

export interface ArchiveCodexState {
  isOpen: boolean
  searchQuery: string
  selectedEntrySlug: string
  leftPaneScrollTop: number
  rightPaneScrollTop: number
  mobileView?: ArchiveCodexMobileView
  updatedAt: number
}

const MAX_STATE_AGE_MS = 1000 * 60 * 60 * 6

const ENTRY_ORIGIN_STATE_KEY = "entry-origin-state"
const PENDING_RETURN_STATE_KEY = "entry-pending-return-state"
const ARCHIVE_CODEX_STATE_KEY = "archive-codex-state"
const RETURN_SECTION_KEY = "returnSection"
const ITEM_SCROLL_STATE_PREFIX = "entry-scroll-state:"

const HOME_SECTION_INDEX_BY_SOURCE: Record<EntryOriginSection, number> = {
  archive: 0,
  map: 2,
  projects: 3,
  publications: 4,
  notes: 5,
}

function isBrowser() {
  return typeof window !== "undefined"
}

function isFresh(updatedAt: number) {
  return Date.now() - updatedAt <= MAX_STATE_AGE_MS
}

function readFreshState<T extends { updatedAt: number }>(key: string): T | null {
  if (!isBrowser()) return null

  const raw = window.sessionStorage.getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as T
    if (!Number.isFinite(parsed.updatedAt) || !isFresh(parsed.updatedAt)) {
      window.sessionStorage.removeItem(key)
      return null
    }

    return parsed
  } catch {
    window.sessionStorage.removeItem(key)
    return null
  }
}

function writeState(key: string, value: unknown) {
  if (!isBrowser()) return
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

function removeState(key: string) {
  if (!isBrowser()) return
  window.sessionStorage.removeItem(key)
}

export function getHomeSectionIndexForOrigin(sourceSection?: EntryOriginSection) {
  if (!sourceSection) return 0
  return HOME_SECTION_INDEX_BY_SOURCE[sourceSection]
}

export function readReturnSection(maxSectionCount?: number) {
  if (!isBrowser()) return 0

  const saved = window.sessionStorage.getItem(RETURN_SECTION_KEY)
  if (!saved) return 0

  const parsed = Number.parseInt(saved, 10)
  if (Number.isNaN(parsed) || parsed < 0) return 0
  if (typeof maxSectionCount === "number" && parsed >= maxSectionCount) return 0
  return parsed
}

export function saveReturnSection(sectionIndex: number) {
  if (!isBrowser()) return
  window.sessionStorage.setItem(RETURN_SECTION_KEY, String(sectionIndex))
}

export function saveEntryOriginState(state: Omit<EntryOriginState, "updatedAt">) {
  const nextState: EntryOriginState = {
    ...state,
    updatedAt: Date.now(),
  }

  writeState(ENTRY_ORIGIN_STATE_KEY, nextState)

  if (typeof nextState.homeSectionIndex === "number") {
    saveReturnSection(nextState.homeSectionIndex)
  }

  return nextState
}

export function readEntryOriginState(itemSlug?: string) {
  const state = readFreshState<EntryOriginState>(ENTRY_ORIGIN_STATE_KEY)
  if (!state) return null
  if (itemSlug && state.itemSlug !== itemSlug) return null
  return state
}

export function clearEntryOriginState(itemSlug?: string) {
  const state = readFreshState<EntryOriginState>(ENTRY_ORIGIN_STATE_KEY)
  if (!state) return
  if (itemSlug && state.itemSlug !== itemSlug) return
  removeState(ENTRY_ORIGIN_STATE_KEY)
}

export function savePendingReturnState(state: Omit<EntryOriginState, "updatedAt"> | EntryOriginState) {
  const nextState: EntryOriginState = {
    ...state,
    updatedAt: Date.now(),
  }

  writeState(PENDING_RETURN_STATE_KEY, nextState)

  if (typeof nextState.homeSectionIndex === "number") {
    saveReturnSection(nextState.homeSectionIndex)
  }

  return nextState
}

export function readPendingReturnState(sourceRoute?: string) {
  const state = readFreshState<EntryOriginState>(PENDING_RETURN_STATE_KEY)
  if (!state) return null
  if (sourceRoute && state.sourceRoute !== sourceRoute) return null
  return state
}

export function clearPendingReturnState(sourceRoute?: string) {
  const state = readFreshState<EntryOriginState>(PENDING_RETURN_STATE_KEY)
  if (!state) return
  if (sourceRoute && state.sourceRoute !== sourceRoute) return
  removeState(PENDING_RETURN_STATE_KEY)
}

export function saveItemScrollState(state: Omit<EntryScrollState, "updatedAt">) {
  const nextState: EntryScrollState = {
    ...state,
    updatedAt: Date.now(),
  }

  writeState(`${ITEM_SCROLL_STATE_PREFIX}${state.itemSlug}`, nextState)
  return nextState
}

export function readItemScrollState(itemSlug: string) {
  return readFreshState<EntryScrollState>(`${ITEM_SCROLL_STATE_PREFIX}${itemSlug}`)
}

export function saveArchiveCodexState(state: Omit<ArchiveCodexState, "updatedAt">) {
  const nextState: ArchiveCodexState = {
    ...state,
    updatedAt: Date.now(),
  }

  writeState(ARCHIVE_CODEX_STATE_KEY, nextState)
  return nextState
}

export function readArchiveCodexState() {
  return readFreshState<ArchiveCodexState>(ARCHIVE_CODEX_STATE_KEY)
}
