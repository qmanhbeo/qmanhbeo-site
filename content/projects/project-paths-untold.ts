import type { ProjectEntry } from "@/content/entries"

const projectPathsUntold: ProjectEntry = {
  slug: "project-paths-untold",
  type: "project",
  title: "Paths Untold: AI-Generated Interactive Story Game",
  subtitle: "Generated scenes with memory, persistence, and emotional weather",
  dateLabel: "Mar 2025 - Jul 2025",
  status: "Prototype",
  summary:
    "A story game where scenes are generated on the fly, memory lingers, emotions shift, and the world remembers enough to make choices feel like they matter.",
  description:
    "Paths Untold explores what interactive fiction becomes when generated scenes are anchored by memory, emotional state, and enough continuity for the player to feel that the world has actually noticed them.",
  detailSections: [
    {
      label: "Narrative Goal",
      content:
        "The project set out to make AI-generated storytelling feel less disposable by preserving state, tone, and consequences across scenes instead of resetting after each prompt.",
    },
    {
      label: "Technical Shape",
      content:
        "OpenAI-powered generation, state tracking, and save-load flows were combined so narrative branches could carry forward character context and emotional residue.",
    },
    {
      label: "What It Tested",
      content:
        "More than a game, it was a design experiment in whether generative systems can sustain continuity well enough for players to invest in their choices.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/paths-untold",
      kind: "repository",
      showOnCard: true,
    },
  ],
  tags: ["OpenAI API", "Narrative Systems", "State Tracking", "Save / Load"],
}

export default projectPathsUntold
