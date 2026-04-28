"use client"

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import type { WorldSectionId } from "@/utils/worldSections"

export interface WorldDialogueState {
  isOpen: boolean
  npcId: string | null
  speaker: string
  lines: string[]
  lineIndex: number
  soundCue?: string
  isMusic?: boolean
}

export interface WorldPlayerPosition {
  x: number
  y: number
}

interface WorldSessionState {
  activeSectionId: WorldSectionId | null
  dialogueState: WorldDialogueState
  playerPosition: WorldPlayerPosition
}

interface WorldContextValue extends WorldSessionState {
  isWorldActive: boolean
  openWorld: () => void
  closeWorld: () => void
  closeActiveWorldUi: () => boolean
  clearWorldUi: () => void
  setActiveSectionId: (sectionId: WorldSectionId | null) => void
  setDialogueState: (state: WorldDialogueState) => void
  setPlayerPosition: (position: WorldPlayerPosition) => void
}

const WORLD_SESSION_STORAGE_KEY = "world:session:v1"

const DEFAULT_DIALOGUE_STATE: WorldDialogueState = {
  isOpen: false,
  npcId: null,
  speaker: "",
  lines: [],
  lineIndex: 0,
}

const DEFAULT_PLAYER_POSITION: WorldPlayerPosition = {
  x: 1200,
  y: 900,
}

function isBrowser() {
  return typeof window !== "undefined"
}

function loadWorldSession(): WorldSessionState {
  if (!isBrowser()) {
    return {
      activeSectionId: null,
      dialogueState: DEFAULT_DIALOGUE_STATE,
      playerPosition: DEFAULT_PLAYER_POSITION,
    }
  }

  try {
    const raw = window.sessionStorage.getItem(WORLD_SESSION_STORAGE_KEY)
    if (!raw) {
      return {
        activeSectionId: null,
        dialogueState: DEFAULT_DIALOGUE_STATE,
        playerPosition: DEFAULT_PLAYER_POSITION,
      }
    }

    const parsed = JSON.parse(raw) as Partial<WorldSessionState>
    return {
      activeSectionId: parsed.activeSectionId ?? null,
      dialogueState: {
        isOpen: parsed.dialogueState?.isOpen ?? false,
        npcId: parsed.dialogueState?.npcId ?? null,
        speaker: parsed.dialogueState?.speaker ?? "",
        lines: Array.isArray(parsed.dialogueState?.lines) ? parsed.dialogueState?.lines : [],
        lineIndex: parsed.dialogueState?.lineIndex ?? 0,
      },
      playerPosition: {
        x: parsed.playerPosition?.x ?? DEFAULT_PLAYER_POSITION.x,
        y: parsed.playerPosition?.y ?? DEFAULT_PLAYER_POSITION.y,
      },
    }
  } catch {
    return {
      activeSectionId: null,
      dialogueState: DEFAULT_DIALOGUE_STATE,
      playerPosition: DEFAULT_PLAYER_POSITION,
    }
  }
}

function saveWorldSession(sessionState: WorldSessionState) {
  if (!isBrowser()) return
  window.sessionStorage.setItem(WORLD_SESSION_STORAGE_KEY, JSON.stringify(sessionState))
}

const WorldContext = createContext<WorldContextValue | null>(null)

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeSectionId, setActiveSectionId] = useState<WorldSectionId | null>(() => loadWorldSession().activeSectionId)
  const [dialogueState, setDialogueState] = useState<WorldDialogueState>(() => loadWorldSession().dialogueState)
  const [playerPosition, setPlayerPosition] = useState<WorldPlayerPosition>(() => loadWorldSession().playerPosition)

  const isWorldActive = pathname === "/world"

  useEffect(() => {
    saveWorldSession({
      activeSectionId,
      dialogueState,
      playerPosition,
    })
  }, [activeSectionId, dialogueState, playerPosition])

  const openWorld = useCallback(() => {
    startTransition(() => {
      router.push("/world")
    })
  }, [router])

  const closeWorld = useCallback(() => {
    startTransition(() => {
      router.push("/")
    })
  }, [router])

  const clearWorldUi = useCallback(() => {
    setActiveSectionId(null)
    setDialogueState(DEFAULT_DIALOGUE_STATE)
  }, [])

  const closeActiveWorldUi = useCallback(() => {
    if (dialogueState.isOpen) {
      setDialogueState(DEFAULT_DIALOGUE_STATE)
      return true
    }

    if (activeSectionId) {
      setActiveSectionId(null)
      return true
    }

    return false
  }, [activeSectionId, dialogueState.isOpen])

  useEffect(() => {
    router.prefetch("/world")
  }, [router])

  const value = useMemo<WorldContextValue>(() => ({
    isWorldActive,
    openWorld,
    closeWorld,
    closeActiveWorldUi,
    clearWorldUi,
    activeSectionId,
    setActiveSectionId,
    dialogueState,
    setDialogueState,
    playerPosition,
    setPlayerPosition,
  }), [
    activeSectionId,
    clearWorldUi,
    closeActiveWorldUi,
    closeWorld,
    dialogueState,
    isWorldActive,
    openWorld,
    playerPosition,
  ])

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
}

export function useWorld() {
  const context = useContext(WorldContext)
  if (!context) throw new Error("useWorld must be used within a WorldProvider")
  return context
}
