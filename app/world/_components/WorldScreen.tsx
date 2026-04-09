"use client"

import { useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react"
import { Sparkles, Swords } from "lucide-react"
import ExitButton from "@/app/world/_components/ExitButton"
import VirtualJoystick from "@/app/world/_components/VirtualJoystick"
import WorldCanvas from "@/app/world/_components/WorldCanvas"
import WorldDialogueBox from "@/app/world/_components/WorldDialogueBox"
import WorldSectionPanel from "@/app/world/_components/WorldSectionPanel"
import { useAudioContext } from "@/context/AudioContext"
import { useWorld } from "@/context/WorldContext"
import { gameBridge } from "@/game/GameBridge"
import type { JoystickInputState } from "@/game/types"
import { WORLD_SECTION_LABELS } from "@/utils/worldSections"

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

  const panelLabel = useMemo(() => {
    return activeSectionId ? WORLD_SECTION_LABELS[activeSectionId] : "No panel open"
  }, [activeSectionId])

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
          <div className="grid w-full max-w-7xl gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-6">
            <div
              data-testid="world-map-card"
              className="relative aspect-square min-w-0 w-full max-w-full rounded-[2rem] border border-amber-500/20 bg-[#120b08]/85 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-4 xl:aspect-auto xl:min-h-[32rem]"
            >
              <WorldCanvas
                initialPlayerPosition={playerPosition}
                initialUiLocked={dialogueState.isOpen || activeSectionId !== null}
                joystickRef={joystickRef}
              />
              <VirtualJoystick joystickRef={joystickRef} />
              <WorldDialogueBox />
            </div>

            <aside className="min-w-0 space-y-4">
              <div className="rounded-[1.75rem] border border-amber-500/20 bg-[#140c08]/92 p-5">
                <div className="flex items-center gap-2 text-amber-200/80">
                  <Swords className="h-4 w-4" />
                  <p className="font-cinzel text-xs uppercase tracking-[0.28em]">First playable</p>
                </div>
                <dl className="mt-4 space-y-4 text-sm text-amber-100/80">
                  <div>
                    <dt className="font-cinzel text-[0.7rem] uppercase tracking-[0.24em] text-amber-300/60">Route</dt>
                    <dd className="mt-1 text-base text-amber-50">/world</dd>
                  </div>
                  <div>
                    <dt className="font-cinzel text-[0.7rem] uppercase tracking-[0.24em] text-amber-300/60">Player position</dt>
                    <dd className="mt-1 text-base text-amber-50">
                      {playerPosition.x}, {playerPosition.y}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-cinzel text-[0.7rem] uppercase tracking-[0.24em] text-amber-300/60">Active panel</dt>
                    <dd className="mt-1 text-base text-amber-50">{panelLabel}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[1.75rem] border border-amber-500/20 bg-[#140c08]/92 p-5">
                <div className="flex items-center gap-2 text-amber-200/80">
                  <Sparkles className="h-4 w-4" />
                  <p className="font-cinzel text-xs uppercase tracking-[0.28em]">What works now</p>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-100/78">
                  <li>The world owns its own route, audio lifecycle, and viewport.</li>
                  <li>Player position and world UI state persist in session storage.</li>
                  <li>Shared site sections render inside world panels with a dedicated `world-panel` surface.</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <WorldSectionPanel />
      </div>
    </main>
  )
}
