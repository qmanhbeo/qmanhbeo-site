"use client"

import { X } from "lucide-react"
import BlogSection from "@/components/BlogSection"
import LetterSection from "@/components/LetterSection"
import ProjectsSection from "@/components/ProjectsSection"
import PublicationsSection from "@/components/PublicationsSection"
import { useWorld } from "@/context/WorldContext"
import { gameBridge } from "@/game/GameBridge"
import { WORLD_SECTION_LABELS } from "@/utils/worldSections"

const WORLD_SECTION_COMPONENTS = {
  projects: ProjectsSection,
  publications: PublicationsSection,
  blog: BlogSection,
  letter: LetterSection,
} as const

export default function WorldSectionPanel() {
  const { activeSectionId, setActiveSectionId } = useWorld()

  if (!activeSectionId) return null

  const SectionComponent = WORLD_SECTION_COMPONENTS[activeSectionId]

  return (
    <div className="world-panel-overlay fixed inset-0 z-50 flex items-stretch justify-center bg-[#050302]/74 backdrop-blur-sm md:items-center">
      <div
        data-testid="world-section-panel"
        className="relative flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-amber-500/16 bg-[#0c0806]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:h-auto md:max-h-[92dvh] md:rounded-[2.2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-amber-200/8 bg-black/18 px-4 py-4 backdrop-blur-sm sm:px-5">
          <div>
            <p className="font-cinzel text-[0.72rem] uppercase tracking-[0.3em] text-amber-300/70">Inside The World</p>
            <p className="mt-1 font-cinzel text-base text-amber-50 sm:text-lg">{WORLD_SECTION_LABELS[activeSectionId]}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              gameBridge.emit("world-sfx", { cue: "ui-close" })
              setActiveSectionId(null)
              gameBridge.emit("section-closed", undefined)
            }}
            data-testid="world-section-panel-close"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-amber-400/18 bg-black/22 p-2.5 text-amber-100 transition hover:border-amber-300/40 hover:bg-black/35"
            aria-label="Close world panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div data-testid="world-section-panel-body" className="min-h-0 flex-1">
          <SectionComponent surface="world-panel" />
        </div>
      </div>
    </div>
  )
}
