"use client"

import { MessageCircle } from "lucide-react"
import { useWorld } from "@/context/WorldContext"
import type { OverlayLayoutMetrics } from "@/app/world/_hooks/useWorldOverlayLayout"

interface WorldDialogueBoxProps {
  bottomBand?: OverlayLayoutMetrics["bottomBand"]
}

export default function WorldDialogueBox({ bottomBand }: WorldDialogueBoxProps) {
  const { dialogueState } = useWorld()

  if (!dialogueState.isOpen) return null

  const activeLine = dialogueState.lines[dialogueState.lineIndex] ?? ""

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
        </div>

        <p className="font-garamond text-lg leading-8 text-amber-50/92">{activeLine}</p>
      </div>
    </div>
  )
}
