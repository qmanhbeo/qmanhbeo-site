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
    <div className="absolute inset-0 z-35 flex items-center justify-center bg-[#050302]/68 p-4 backdrop-blur-sm">
      <div
        className="relative flex h-full max-h-[92dvh] w-full max-w-6xl overflow-hidden rounded-[2.2rem] border border-amber-500/16 bg-[#0c0806]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-amber-200/8 bg-black/18 px-5 py-4 backdrop-blur-sm">
          <div>
            <p className="font-cinzel text-[0.72rem] uppercase tracking-[0.3em] text-amber-300/70">Inside The World</p>
            <p className="mt-1 font-cinzel text-lg text-amber-50">{WORLD_SECTION_LABELS[activeSectionId]}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveSectionId(null)
              gameBridge.emit("section-closed", undefined)
            }}
            className="rounded-full border border-amber-400/18 bg-black/22 p-2 text-amber-100 transition hover:border-amber-300/40 hover:bg-black/35"
            aria-label="Close world panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-full w-full pt-[5.1rem]">
          <SectionComponent surface="world-panel" />
        </div>
      </div>
    </div>
  )
}
