"use client"

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import ExitButton from "@/app/world/_components/ExitButton"
import VirtualJoystick from "@/app/world/_components/VirtualJoystick"
import WorldCanvas from "@/app/world/_components/WorldCanvas"
import WorldDialogueBox from "@/app/world/_components/WorldDialogueBox"
import WorldSectionPanel from "@/app/world/_components/WorldSectionPanel"
import { useAudioContext } from "@/context/AudioContext"
import { useWorld } from "@/context/WorldContext"
import { gameBridge } from "@/game/GameBridge"
import type { JoystickInputState } from "@/game/types"

const INITIAL_JOYSTICK_STATE: JoystickInputState = {
  x: 0,
  y: 0,
  interact: false,
}

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
  const { pauseAllAmbient, resumeAllAmbient } = useAudioContext()
  const joystickRef = useRef<JoystickInputState>(INITIAL_JOYSTICK_STATE)
  const [promptText, setPromptText] = useState("")

  const handleCloseDialogue = useCallback(() => {
    gameBridge.emit("dialogue-closed", undefined)
    setDialogueState({
      isOpen: false,
      npcId: null,
      speaker: "",
      lines: [],
      lineIndex: 0,
    })
  }, [setDialogueState])

  const handleCloseSection = useCallback(() => {
    gameBridge.emit("section-closed", undefined)
    setActiveSectionId(null)
  }, [setActiveSectionId])

  const handleEscape = useEffectEvent(() => {
    if (dialogueState.isOpen) {
      handleCloseDialogue()
      return
    }

    if (activeSectionId) {
      handleCloseSection()
      return
    }

    closeWorld()
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
      setActiveSectionId(sectionId)
    })
    const offSectionClosed = gameBridge.on("section-closed", () => {
      setActiveSectionId(null)
    })
    const offOpenDialogue = gameBridge.on("open-dialogue", (nextDialogueState) => {
      setDialogueState(nextDialogueState)
    })
    const offDialogueClosed = gameBridge.on("dialogue-closed", () => {
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      handleEscape()
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
  ])

  useEffect(() => {
    const renderGameToText = () => JSON.stringify({
      activeSectionId,
      dialogueOpen: dialogueState.isOpen,
      playerPosition,
      prompt: promptText,
    })
    const targetWindow = window as typeof window & { render_game_to_text?: () => string }
    targetWindow.render_game_to_text = renderGameToText

    return () => {
      if (targetWindow.render_game_to_text === renderGameToText) {
        delete targetWindow.render_game_to_text
      }
    }
  }, [activeSectionId, dialogueState.isOpen, playerPosition, promptText])

  return (
    <main className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-[#0a0604] text-amber-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.2),_transparent_28%),linear-gradient(180deg,_rgba(23,12,8,0.96),_rgba(6,4,3,1))]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,_rgba(248,195,92,0.12),_transparent)]" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-cinzel text-[0.7rem] uppercase tracking-[0.35em] text-amber-300/70">World Route</p>
            <h1 className="font-cinzel text-2xl font-semibold text-amber-50 sm:text-3xl">Village At Night</h1>
          </div>

          <ExitButton onClick={closeWorld} />
        </header>

        <section className="flex flex-1 items-start justify-center px-4 pb-6 pt-2 sm:px-6 sm:pb-8 xl:items-center">
          <div className="flex w-full max-w-[43rem] flex-col gap-4">
            <div
              data-testid="world-map-card"
              className="relative aspect-square min-w-0 w-full max-w-full rounded-[2rem] border border-amber-500/20 bg-[#120b08]/85 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-4"
            >
              <WorldCanvas
                initialPlayerPosition={playerPosition}
                initialUiLocked={dialogueState.isOpen || activeSectionId !== null}
                joystickRef={joystickRef}
              />
              {promptText ? (
                <div className="pointer-events-none absolute inset-x-4 bottom-5 z-20 flex justify-center">
                  <div
                    data-testid="world-prompt"
                    className="max-w-[min(92%,34rem)] rounded-full border border-amber-300/26 bg-[#090504]/78 px-4 py-2 text-center font-cinzel text-[0.72rem] leading-5 text-amber-100 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:text-sm"
                  >
                    {promptText}
                  </div>
                </div>
              ) : null}
              <WorldDialogueBox />
            </div>

            <VirtualJoystick joystickRef={joystickRef} placement="docked" />
          </div>
        </section>

        <WorldSectionPanel />
      </div>
    </main>
  )
}
