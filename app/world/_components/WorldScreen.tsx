"use client"

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import ExitButton from "@/app/world/_components/ExitButton"
import VirtualJoystick from "@/app/world/_components/VirtualJoystick"
import WorldCanvas from "@/app/world/_components/WorldCanvas"
import WorldDialogueBox from "@/app/world/_components/WorldDialogueBox"
import WorldPromptOverlay, { useWorldPromptState } from "@/app/world/_components/WorldPromptOverlay"
import WorldSectionPanel from "@/app/world/_components/WorldSectionPanel"
import ArchiveCodexOverlay from "@/components/ui/ArchiveCodexOverlay"
import { useAudioContext } from "@/context/AudioContext"
import { useWorld } from "@/context/WorldContext"
import { gameBridge, type WorldSfxCue } from "@/game/GameBridge"
import type { JoystickInputState } from "@/game/types"

const INITIAL_JOYSTICK_STATE: JoystickInputState = {
  x: 0,
  y: 0,
  interact: false,
}

const WORLD_SFX_BY_CUE = {
  "dialogue-advance": "flip",
  "dialogue-open": "open",
  "panel-open": "open",
  "ui-close": "click",
} satisfies Record<WorldSfxCue, "click" | "transition" | "open" | "flip">

export default function WorldScreen() {
  const {
    activeSectionId,
    closeWorld,
    dialogueState,
    playerPosition,
    setActiveSectionId,
    setDialogueState,
    setPlayerPosition,
  } = useWorld()
  const { pauseAllAmbient, playSfx, stopSfx, resumeAllAmbient } = useAudioContext()
  const joystickRef = useRef<JoystickInputState>(INITIAL_JOYSTICK_STATE)
  const lastSoundCueRef = useRef<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [isArchiveOverlayOpen, setIsArchiveOverlayOpen] = useState(false)
  const uiLocked = dialogueState.isOpen || activeSectionId !== null
  const promptState = useWorldPromptState({
    contextualPrompt: promptText,
    uiLocked,
  })

  const handleWorldSfx = useEffectEvent(({ cue }: { cue: WorldSfxCue }) => {
    playSfx(WORLD_SFX_BY_CUE[cue])
  })

  const handleExitWorld = useCallback(() => {
    gameBridge.emit("world-sfx", { cue: "ui-close" })
    closeWorld()
  }, [closeWorld])

  const handleCloseDialogue = useCallback(() => {
    gameBridge.emit("world-sfx", { cue: "ui-close" })
    gameBridge.emit("dialogue-closed", undefined)
    setDialogueState({
      isOpen: false,
      npcId: null,
      speaker: "",
      lines: [],
      lineIndex: 0,
    })
  }, [setDialogueState])

  const handleAdvanceDialogue = useCallback(() => {
    if (!dialogueState.isOpen) return
    const isLastLine = dialogueState.lineIndex >= dialogueState.lines.length - 1
    if (isLastLine) {
      handleCloseDialogue()
      return
    }
    gameBridge.emit("world-sfx", { cue: "dialogue-advance" })
    setDialogueState({
      ...dialogueState,
      lineIndex: dialogueState.lineIndex + 1,
    })
  }, [dialogueState, setDialogueState, handleCloseDialogue])

  const handleCloseSection = useCallback(() => {
    gameBridge.emit("world-sfx", { cue: "ui-close" })
    gameBridge.emit("section-closed", undefined)
    setActiveSectionId(null)
  }, [setActiveSectionId])

  const handleEscape = useEffectEvent(() => {
    if (document.querySelector('[aria-modal="true"]')) {
      return
    }

    if (dialogueState.isOpen) {
      handleCloseDialogue()
      return
    }

    if (activeSectionId) {
      handleCloseSection()
      return
    }

    handleExitWorld()
  })

  useEffect(() => {
    pauseAllAmbient()

    const originalOverflow = document.body.style.overflow
    const originalOverscrollBehavior = document.body.style.overscrollBehavior
    const originalOverlayLock = document.body.dataset.overlayLock

    document.body.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "contain"
    document.body.dataset.overlayLock = "true"

    const offOpenSection = gameBridge.on("open-section", ({ sectionId }) => {
      if (sectionId === "publications") {
        setIsArchiveOverlayOpen(true)
        return
      }
      setActiveSectionId(sectionId)
    })
    const offSectionClosed = gameBridge.on("section-closed", () => {
      setActiveSectionId(null)
    })
    const offOpenDialogue = gameBridge.on("open-dialogue", (nextDialogueState) => {
      setDialogueState(nextDialogueState)
      if (nextDialogueState.soundCue) {
        playSfx(nextDialogueState.soundCue as "click" | "transition" | "open" | "flip")
        lastSoundCueRef.current = nextDialogueState.soundCue
      } else {
        lastSoundCueRef.current = null
      }
    })
    const offDialogueClosed = gameBridge.on("dialogue-closed", () => {
      if (lastSoundCueRef.current) {
        stopSfx(lastSoundCueRef.current)
        lastSoundCueRef.current = null
      }
      setDialogueState({
        isOpen: false,
        npcId: null,
        speaker: "",
        lines: [],
        lineIndex: 0,
      })
    })
    const offPlayerPosition = gameBridge.on("player-position", (nextPosition) => {
      setPlayerPosition(nextPosition)
    })
    const offPromptChanged = gameBridge.on("prompt-changed", ({ prompt }) => {
      setPromptText(prompt)
    })
    const offWorldSfx = gameBridge.on("world-sfx", handleWorldSfx)
    const offDialogueInteract = gameBridge.on("dialogue-interact", () => {
      if (dialogueState.isOpen) {
        handleAdvanceDialogue()
      }
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        handleEscape()
        return
      }

      // E key advances dialogue when open, otherwise ignored (interact is handled in Phaser)
      if (event.key === "e" || event.key === "E") {
        if (dialogueState.isOpen) {
          event.preventDefault()
          handleAdvanceDialogue()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true })
      offOpenSection()
      offSectionClosed()
      offOpenDialogue()
      offDialogueClosed()
      offPlayerPosition()
      offPromptChanged()
      offWorldSfx()
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscrollBehavior
      if (originalOverlayLock) {
        document.body.dataset.overlayLock = originalOverlayLock
      } else {
        delete document.body.dataset.overlayLock
      }
      resumeAllAmbient()
    }
  }, [
    pauseAllAmbient,
    resumeAllAmbient,
    setActiveSectionId,
    setDialogueState,
    setPlayerPosition,
    handleAdvanceDialogue,
    handleCloseDialogue,
  ])

  useEffect(() => {
    const shouldLock = dialogueState.isOpen || isArchiveOverlayOpen || activeSectionId || promptState.isVisible
    if (shouldLock) {
      document.body.dataset.overlayLock = "true"
    } else {
      delete document.body.dataset.overlayLock
    }
  }, [dialogueState.isOpen, isArchiveOverlayOpen, promptState.isVisible, activeSectionId])

  useEffect(() => {
    const renderGameToText = () => JSON.stringify({
      activeSectionId,
      dialogueOpen: dialogueState.isOpen,
      playerPosition,
      prompt: promptState.isVisible ? promptState.renderedPrompt : "",
      promptKind: promptState.isVisible ? promptState.renderedKind : null,
      contextualPrompt: promptText,
    })
    const targetWindow = window as typeof window & { render_game_to_text?: () => string }
    targetWindow.render_game_to_text = renderGameToText

    return () => {
      if (targetWindow.render_game_to_text === renderGameToText) {
        delete targetWindow.render_game_to_text
      }
    }
  }, [
    activeSectionId,
    dialogueState.isOpen,
    playerPosition,
    promptState.isVisible,
    promptState.renderedKind,
    promptState.renderedPrompt,
    promptText,
  ])

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0a0604] text-amber-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.2),_transparent_28%),linear-gradient(180deg,_rgba(23,12,8,0.96),_rgba(6,4,3,1))]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,_rgba(248,195,92,0.12),_transparent)]" />

      <WorldCanvas
        initialPlayerPosition={playerPosition}
        initialUiLocked={uiLocked}
        joystickRef={joystickRef}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <header className="pointer-events-auto absolute left-4 top-4 sm:left-6 sm:top-6">
          <p className="font-cinzel text-[0.7rem] uppercase tracking-[0.35em] text-amber-300/70">World Route</p>
          <h1 className="font-cinzel text-2xl font-semibold text-amber-50 sm:text-3xl">Village At Night</h1>
        </header>

        <div className="pointer-events-auto absolute right-4 top-4 sm:right-6 sm:top-6">
          <ExitButton onClick={handleExitWorld} />
        </div>

        <WorldPromptOverlay promptState={promptState} />
        <WorldDialogueBox />
        <VirtualJoystick joystickRef={joystickRef} placement="overlay" />
      </div>

      <WorldSectionPanel />
      <ArchiveCodexOverlay
        isOpen={isArchiveOverlayOpen}
        onClose={() => {
          setIsArchiveOverlayOpen(false)
          gameBridge.emit("section-closed", undefined)
        }}
      />
    </main>
  )
}
