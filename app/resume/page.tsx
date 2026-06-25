import type { Metadata } from "next"
import { getEntriesByType } from "@/content/entries"
import ResumePageContent from "./ResumePageContent"

export const metadata: Metadata = {
  title: "Resume",
}

export default function ResumePage() {
  const publications = getEntriesByType("publication").filter((p) =>
    ["paper-renewable-delay-vietnam", "paper-urban-rural-energy-burden-vietnam"].includes(p.slug),
  )
  const projects = getEntriesByType("project").filter((p) => !p.excludeFromResume)
  const arcs = getEntriesByType("arc")

  return (
    <ResumePageContent
      publications={publications}
      projects={projects}
      arcs={arcs}
    />
  )
}
