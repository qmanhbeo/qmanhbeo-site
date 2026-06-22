"use client"

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import dynamic from "next/dynamic"
import ExitButton from "@/app/world/_components/ExitButton"
import VirtualJoystick from "@/app/world/_components/VirtualJoystick"
import WorldDialogueBox from "@/app/world/_components/WorldDialogueBox"
import WorldPromptOverlay, { useWorldPromptState } from "@/app/world/_components/WorldPromptOverlay"
import WorldSectionPanel from "@/app/world/_components/WorldSectionPanel"
import { useWorldOverlayLayout } from "@/app/world/_hooks/useWorldOverlayLayout"
import ArchiveCodexOverlay from "@/components/ui/ArchiveCodexOverlay"
import { useAudioContext } from "@/context/AudioContext"
import { useRouter } from "next/navigation"
import { useWorld, type DialogueChoiceOption, type WorldDialogueState } from "@/context/WorldContext"
import { gameBridge, type WorldSfxCue } from "@/game/GameBridge"
import type { JoystickInputState } from "@/game/types"

const INITIAL_JOYSTICK_STATE: JoystickInputState = {
  x: 0,
  y: 0,
  interact: false,
}

function WorldCanvasFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center font-cinzel text-sm uppercase tracking-[0.28em] text-amber-200/70">
      Loading world...
    </div>
  )
}

const WorldCanvas = dynamic(() => import("@/app/world/_components/WorldCanvas"), {
  ssr: false,
  loading: WorldCanvasFallback,
})

const WORLD_SFX_BY_CUE = {
  "dialogue-advance": "flip",
  "dialogue-open": "open",
  "panel-open": "open",
  "ui-close": "click",
} satisfies Record<WorldSfxCue, "click" | "transition" | "open" | "flip">

export default function WorldScreen() {
  const router = useRouter()
  const {
    activeSectionId,
    closeWorld,
    dialogueState,
    playerPosition,
    setActiveSectionId,
    setDialogueState,
    setPlayerPosition,
  } = useWorld()
  const { pauseAllAmbient, playBardMusic, playSfx, stopBardMusic, stopSfx, resumeAllAmbient } = useAudioContext()
  const joystickRef = useRef<JoystickInputState>(INITIAL_JOYSTICK_STATE)
  const lastSoundCueRef = useRef<string | null>(null)
  const pendingGuideChoiceRef = useRef<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [isArchiveOverlayOpen, setIsArchiveOverlayOpen] = useState(false)
  const [focusedChoiceIndex, setFocusedChoiceIndex] = useState(0)
  const choicesLengthRef = useRef(0)
  choicesLengthRef.current = dialogueState.choices?.length ?? 0
  const uiLocked = dialogueState.isOpen || activeSectionId !== null
  const promptState = useWorldPromptState({
    contextualPrompt: promptText,
    uiLocked,
  })
  const overlayLayout = useWorldOverlayLayout()

  const handleWorldSfx = useEffectEvent(({ cue }: { cue: WorldSfxCue }) => {
    playSfx(WORLD_SFX_BY_CUE[cue])
  })

  const handleOpenDialogue = useEffectEvent((nextDialogueState: WorldDialogueState) => {
    setDialogueState(nextDialogueState)
    if (nextDialogueState.soundCue) {
      playSfx(nextDialogueState.soundCue as "click" | "transition" | "open" | "flip")
      lastSoundCueRef.current = nextDialogueState.soundCue
    } else {
      lastSoundCueRef.current = null
    }
  })

  const handleDialogueClosed = useEffectEvent(() => {
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
    if (pendingGuideChoiceRef.current) {
      gameBridge.emit("manh-start-guide", { choiceId: pendingGuideChoiceRef.current })
      pendingGuideChoiceRef.current = null
    }
  }, [setDialogueState])

  const handleChoiceSelect = useCallback((option: DialogueChoiceOption) => {
    if (!dialogueState.isOpen) return

    if (dialogueState.npcId === "bard") {
      if (option.id === "bard-hear") {
        playBardMusic()
        gameBridge.emit("bard-started-playing", undefined)
      } else if (option.id === "bard-thanks") {
        stopBardMusic()
        gameBridge.emit("bard-stopped-playing", undefined)
      }
    }

    if (dialogueState.npcId === "manh" && option.id.startsWith("manh-guide-")) {
      pendingGuideChoiceRef.current = option.id
      setDialogueState({
        ...dialogueState,
        lines: option.nextLines,
        lineIndex: 0,
        choices: undefined,
      })
      return
    }

    if (option.nextLines.length === 0) {
      handleCloseDialogue()
      return
    }

    setDialogueState({
      ...dialogueState,
      lines: option.nextLines,
      lineIndex: 0,
      choices: undefined,
    })
  }, [dialogueState, playBardMusic, stopBardMusic, handleCloseDialogue, setDialogueState])

  const handleAdvanceDialogue = useCallback(() => {
    if (!dialogueState.isOpen || (dialogueState.choices && dialogueState.choices.length > 0)) return
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

  const handleDialogueInteract = useEffectEvent(() => {
    if (!dialogueState.isOpen) return
    const hasChoices = dialogueState.choices && dialogueState.choices.length > 0
    if (hasChoices) {
      const option = dialogueState.choices![focusedChoiceIndex]
      if (option) handleChoiceSelect(option)
      return
    }
    handleAdvanceDialogue()
  })

  const handleWorldKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (document.querySelector('[aria-modal="true"]')) return

    if (event.key === "Escape") {
      event.preventDefault()
      handleEscape()
      return
    }

    const hasChoices = dialogueState.choices && dialogueState.choices.length > 0

    // Choice navigation: W/S or up/down arrows
    if ((event.key === "w" || event.key === "W" || event.key === "ArrowUp") && hasChoices) {
      event.preventDefault()
      setFocusedChoiceIndex((prev) => (prev - 1 + dialogueState.choices!.length) % dialogueState.choices!.length)
      return
    }

    if ((event.key === "s" || event.key === "S" || event.key === "ArrowDown") && hasChoices) {
      event.preventDefault()
      setFocusedChoiceIndex((prev) => (prev + 1) % dialogueState.choices!.length)
      return
    }

    // E / Enter confirms focused choice or advances dialogue
    if (event.key === "e" || event.key === "E" || event.key === "Enter") {
      if (dialogueState.isOpen) {
        event.preventDefault()
        if (hasChoices) {
          const option = dialogueState.choices![focusedChoiceIndex]
          if (option) handleChoiceSelect(option)
        } else {
          handleAdvanceDialogue()
        }
      }
    }
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
      if (sectionId === "paths-untold") {
        router.push("/paths-untold")
        return
      }
      setActiveSectionId(sectionId)
    })
    const offSectionClosed = gameBridge.on("section-closed", () => {
      setActiveSectionId(null)
    })
    const offOpenDialogue = gameBridge.on("open-dialogue", handleOpenDialogue)
    const offDialogueClosed = gameBridge.on("dialogue-closed", handleDialogueClosed)
    const offPlayerPosition = gameBridge.on("player-position", (nextPosition) => {
      setPlayerPosition(nextPosition)
    })
    const offPromptChanged = gameBridge.on("prompt-changed", ({ prompt }) => {
      setPromptText(prompt)
    })
    const offWorldSfx = gameBridge.on("world-sfx", handleWorldSfx)
    const offDialogueInteract = gameBridge.on("dialogue-interact", handleDialogueInteract)
    const offChoiceNavigate = gameBridge.on("choice-navigate", ({ direction }) => {
      const len = choicesLengthRef.current
      if (len === 0) return
      setFocusedChoiceIndex((prev) => (direction === "up" ? (prev - 1 + len) % len : (prev + 1) % len))
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      handleWorldKeyDown(event)
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
      offDialogueInteract()
      offChoiceNavigate()
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
    setPlayerPosition,
  ])

  useEffect(() => {
    setFocusedChoiceIndex(0)
  }, [dialogueState.isOpen, dialogueState.choices, dialogueState.lineIndex])

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
    <main
      id="world-route"
      className="fixed inset-0 z-40 h-[100dvh] w-screen overflow-hidden bg-[#0a0604] text-amber-50"
      style={{
        height: "100dvh",
        minHeight: "-webkit-fill-available",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.2),_transparent_28%),linear-gradient(180deg,_rgba(23,12,8,0.96),_rgba(6,4,3,1))]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,_rgba(248,195,92,0.12),_transparent)]" />

      <WorldCanvas
        initialPlayerPosition={playerPosition}
        initialUiLocked={uiLocked}
        joystickRef={joystickRef}
        topBand={overlayLayout?.topBand}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <header
          className="pointer-events-auto absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:top-6"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div>
            <h1 className="font-cinzel text-2xl font-semibold text-amber-50 sm:text-3xl">By the Hearth</h1>
          </div>
          <ExitButton onClick={handleExitWorld} />
        </header>

        <WorldPromptOverlay
          promptState={promptState}
          bottomBand={overlayLayout?.bottomBand}
        />
        <WorldDialogueBox
          bottomBand={overlayLayout?.bottomBand}
          onChoiceSelect={handleChoiceSelect}
          focusedChoiceIndex={focusedChoiceIndex}
        />
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
