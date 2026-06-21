import type { ProjectEntry } from "@/content/entries"

const projectPathsUntold: ProjectEntry = {
  slug: "project-paths-untold",
  type: "project",
  title: "Paths Untold: LLM-Powered Narrative Engine with State Management",
  subtitle: "Controlling non-deterministic LLM outputs through prompt engineering, parsing, and context tracking",
  dateLabel: "Mar 2025 - Jul 2025",
  status: "Prototype",
  summary:
    "A generative narrative system that uses the OpenAI API with custom prompt engineering, context-window management, and structured output parsing to maintain character memory, emotional continuity, and coherent storytelling across generated scenes.",
  description:
    "Paths Untold engineers non-deterministic LLM outputs into a playable interactive fiction engine. The system manages context windows, tracks narrative state across scenes, and applies regex-based validation schemas to parse and restructure freeform LLM responses into structured game-state representations.",
  detailSections: [
    {
      label: "LLM Engine",
      content:
        "Engineered a generative narrative engine using the OpenAI API with custom prompt engineering, context-window management, and state tracking.",
    },
    {
      label: "Output Parsing",
      content:
        "Developed regex-based validation pipelines to parse and restructure non-deterministic LLM text responses into structured application states.",
    },
    {
      label: "Defensive Architecture",
      content:
        "Implemented defensive prompt architectures to handle variable-format semi-structured text output at inference time.",
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
  tags: ["OpenAI API", "Prompt Engineering", "Context Management", "State Tracking", "Regex Validation", "LLM Output Parsing"],
}

export default projectPathsUntold
