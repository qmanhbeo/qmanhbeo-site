"use client"

import { useCallback } from "react"
import { MessageCircle, X } from "lucide-react"
import { useWorld } from "@/context/WorldContext"
import { gameBridge } from "@/game/GameBridge"
import type { OverlayLayoutMetrics } from "@/app/world/_hooks/useWorldOverlayLayout"

interface WorldDialogueBoxProps {
  bottomBand?: OverlayLayoutMetrics["bottomBand"]
}

export default function WorldDialogueBox({ bottomBand }: WorldDialogueBoxProps) {
  const { dialogueState, setDialogueState } = useWorld()

  const handleClose = useCallback(() => {
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

  if (!dialogueState.isOpen) return null

  const activeLine = dialogueState.lines[dialogueState.lineIndex] ?? ""
  const isLastLine = dialogueState.lineIndex >= dialogueState.lines.length - 1

  const bottomY = bottomBand?.start ?? 200
  const topY = bottomY - 280

  return (
    <div
      className="absolute z-40 flex justify-center px-4"
      style={{
        left: 0,
        right: 0,
        top: `${topY}px`,
      }}
    >
      <div className="w-full max-w-3xl rounded-[1.8rem] border border-amber-400/18 bg-[#120a08]/92 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-100">
            <MessageCircle className="h-4 w-4" />
            <span className="font-cinzel text-sm uppercase tracking-[0.24em]">{dialogueState.speaker}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-amber-200/70 transition hover:text-amber-50"
            aria-label="Close dialogue"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="font-garamond text-lg leading-8 text-amber-50/92">{activeLine}</p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (isLastLine) {
                handleClose()
                return
              }

              gameBridge.emit("world-sfx", { cue: "dialogue-advance" })
              setDialogueState({
                ...dialogueState,
                lineIndex: dialogueState.lineIndex + 1,
              })
            }}
            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-cinzel text-sm text-amber-50 transition hover:border-amber-300/55 hover:bg-amber-400/14"
          >
            {isLastLine ? "Close" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
