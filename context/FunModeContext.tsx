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

export type GameSectionId = "projects" | "publications" | "blog" | "letter"

export interface DialogueState {
  isOpen: boolean
  npcId: string | null
  speaker: string
  lines: string[]
  lineIndex: number
}

interface FunModeContextValue {
  isFunModeActive: boolean
  openFunMode: () => void
  closeFunMode: () => void
  activeSectionId: GameSectionId | null
  setActiveSectionId: (sectionId: GameSectionId | null) => void
  dialogueState: DialogueState
  setDialogueState: (state: DialogueState) => void
  resetGameUi: () => void
}

const DEFAULT_DIALOGUE_STATE: DialogueState = {
  isOpen: false,
  npcId: null,
  speaker: "",
  lines: [],
  lineIndex: 0,
}

const FunModeContext = createContext<FunModeContextValue | null>(null)

export function FunModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeSectionId, setActiveSectionId] = useState<GameSectionId | null>(null)
  const [dialogueState, setDialogueState] = useState<DialogueState>(DEFAULT_DIALOGUE_STATE)

  const isFunModeActive = pathname === "/game"

  const resetGameUi = useCallback(() => {
    setActiveSectionId(null)
    setDialogueState(DEFAULT_DIALOGUE_STATE)
  }, [])

  const openFunMode = useCallback(() => {
    resetGameUi()
    startTransition(() => {
      router.push("/game")
    })
  }, [resetGameUi, router])

  const closeFunMode = useCallback(() => {
    resetGameUi()
    startTransition(() => {
      router.push("/")
    })
  }, [resetGameUi, router])

  useEffect(() => {
    router.prefetch("/game")
  }, [router])

  const value = useMemo<FunModeContextValue>(() => ({
    isFunModeActive,
    openFunMode,
    closeFunMode,
    activeSectionId,
    setActiveSectionId,
    dialogueState,
    setDialogueState,
    resetGameUi,
  }), [activeSectionId, closeFunMode, dialogueState, isFunModeActive, openFunMode, resetGameUi])

  return <FunModeContext.Provider value={value}>{children}</FunModeContext.Provider>
}

export function useFunMode() {
  const context = useContext(FunModeContext)
  if (!context) throw new Error("useFunMode must be used within a FunModeProvider")
  return context
}
