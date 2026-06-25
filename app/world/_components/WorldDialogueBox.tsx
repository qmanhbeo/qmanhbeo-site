"use client"

import { MessageCircle } from "lucide-react"
import { useWorld, type DialogueChoiceOption } from "@/context/WorldContext"
import type { OverlayLayoutMetrics } from "@/app/world/_hooks/useWorldOverlayLayout"

interface WorldDialogueBoxProps {
  layout?: OverlayLayoutMetrics | null
  onChoiceSelect?: (option: DialogueChoiceOption) => void
  focusedChoiceIndex?: number
}

export default function WorldDialogueBox({ layout, onChoiceSelect, focusedChoiceIndex = 0 }: WorldDialogueBoxProps) {
  const { dialogueState } = useWorld()

  if (!dialogueState.isOpen) return null

  const activeLine = dialogueState.lines[dialogueState.lineIndex] ?? ""
  const hasChoices = dialogueState.choices && dialogueState.choices.length > 0

  const topSafe = layout?.topBand?.start ?? 80
  const bottomSafe = layout?.bottomBand?.start ?? 200
  const freeHeight = bottomSafe - topSafe

  const idealHeight = hasChoices ? 360 : 280
  const dialogueHeight = Math.min(idealHeight, Math.max(freeHeight * 0.75, 80))
  const topY = Math.max(bottomSafe - dialogueHeight, topSafe)

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

        <p className="font-garamond text-lg leading-8 text-amber-50/92 whitespace-pre-line">{activeLine}</p>

        {hasChoices && (
          <div className="mt-4 flex flex-col gap-2">
            {dialogueState.choices!.map((choice, index) => (
              <button
                key={choice.id}
                className={`medieval-button w-full rounded px-4 py-2.5 text-left font-garamond text-base transition-all ${
                  index === focusedChoiceIndex ? "medieval-button-active" : ""
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
