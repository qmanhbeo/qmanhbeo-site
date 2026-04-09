"use client"

import { useEffect } from "react"
import { Home, Sparkles, Swords } from "lucide-react"
import { useAudioContext } from "@/context/AudioContext"
import { useFunMode } from "@/context/FunModeContext"
import { gameBridge } from "./GameBridge"

const SECTION_LABELS = {
  projects: "Workshop / Projects",
  publications: "Library / Publications",
  blog: "Tavern / Notes",
  letter: "Post Office / Letter",
} as const

export default function GameScreen() {
  const {
    activeSectionId,
    closeFunMode,
    dialogueState,
    resetGameUi,
    setActiveSectionId,
    setDialogueState,
  } = useFunMode()
  const { pauseAllAmbient, resumeAllAmbient } = useAudioContext()

  useEffect(() => {
    pauseAllAmbient()

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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      closeFunMode()
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      offOpenSection()
      offSectionClosed()
      offOpenDialogue()
      offDialogueClosed()
      resetGameUi()
      resumeAllAmbient()
    }
  }, [closeFunMode, pauseAllAmbient, resetGameUi, resumeAllAmbient, setActiveSectionId, setDialogueState])

  const activeSectionLabel = activeSectionId ? SECTION_LABELS[activeSectionId] : "None yet"
  const currentDialogueLine = dialogueState.lines[dialogueState.lineIndex] ?? "No dialogue active"

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0a0604] text-amber-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.22),_transparent_28%),linear-gradient(180deg,_rgba(23,12,8,0.92),_rgba(6,4,3,0.98))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,_rgba(248,195,92,0.12),_transparent)]" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-cinzel text-[0.7rem] uppercase tracking-[0.35em] text-amber-300/70">
              Separate Route Mode
            </p>
            <h1 className="font-cinzel text-2xl font-semibold text-amber-50 sm:text-3xl">
              Village At Night
            </h1>
          </div>

          <button
            type="button"
            onClick={closeFunMode}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-[#1b110c]/90 px-4 py-2 font-cinzel text-sm text-amber-100 transition hover:border-amber-400/60 hover:bg-[#2a1810]"
          >
            <Home className="h-4 w-4" />
            Return Home
          </button>
        </header>

        <section className="flex flex-1 items-center justify-center px-4 pb-8 pt-2 sm:px-6">
          <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[#120b08]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,_rgba(255,178,70,0.18),_transparent_26%)]" />
              <div className="relative flex min-h-[26rem] flex-col justify-between rounded-[1.5rem] border border-dashed border-amber-400/25 bg-[#090606]/70 p-5 sm:min-h-[34rem] sm:p-8">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[0.72rem] uppercase tracking-[0.3em] text-amber-200/80">
                    <Swords className="h-3.5 w-3.5" />
                    Game Screen
                  </div>
                  <h2 className="font-cinzel text-3xl leading-tight text-amber-50 sm:text-5xl">
                    The game now lives on its own route, not on top of the home page.
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-amber-100/72 sm:text-lg">
                    This screen now owns the viewport, input, and audio lifecycle. Phaser wiring lands here next,
                    inside the dedicated canvas area below.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-amber-500/15 bg-black/25 p-4">
                    <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-amber-300/65">Route</p>
                    <p className="mt-2 text-lg text-amber-50">`/game`</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/15 bg-black/25 p-4">
                    <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-amber-300/65">Audio</p>
                    <p className="mt-2 text-lg text-amber-50">Ambient pauses on mount</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/15 bg-black/25 p-4">
                    <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-amber-300/65">Next</p>
                    <p className="mt-2 text-lg text-amber-50">Phaser bootstraps here</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.75rem] border border-amber-500/20 bg-[#140c08]/92 p-5">
                <div className="flex items-center gap-2 text-amber-200/80">
                  <Sparkles className="h-4 w-4" />
                  <p className="font-cinzel text-xs uppercase tracking-[0.28em]">Phase 1 state</p>
                </div>
                <dl className="mt-4 space-y-4 text-sm text-amber-100/80">
                  <div>
                    <dt className="font-cinzel text-[0.7rem] uppercase tracking-[0.24em] text-amber-300/60">
                      Active section
                    </dt>
                    <dd className="mt-1 text-base text-amber-50">{activeSectionLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-cinzel text-[0.7rem] uppercase tracking-[0.24em] text-amber-300/60">
                      Dialogue speaker
                    </dt>
                    <dd className="mt-1 text-base text-amber-50">
                      {dialogueState.isOpen ? dialogueState.speaker || "Unknown NPC" : "No dialogue active"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-cinzel text-[0.7rem] uppercase tracking-[0.24em] text-amber-300/60">
                      Dialogue preview
                    </dt>
                    <dd className="mt-1 leading-6 text-amber-100/75">{currentDialogueLine}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[1.75rem] border border-amber-500/20 bg-[#140c08]/92 p-5">
                <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-amber-300/65">What changed</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-100/78">
                  <li>The Game view no longer competes with the horizontal home-page scroll handlers.</li>
                  <li>Global site chrome can now be hidden when the Game route is active.</li>
                  <li>Future Phaser code will be code-split to the Game route instead of the main homepage bundle.</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
