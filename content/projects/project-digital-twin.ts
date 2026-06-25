import type { ProjectEntry } from "@/content/entries"

const projectDigitalTwin: ProjectEntry = {
  slug: "project-digital-twin",
  type: "project",
  title: "Personal Digital Twin — Manh NPC",
  subtitle: "A Cohere-driven NPC you can actually talk to, inside a 2D pixel RPG world",
  dateLabel: "June 2026",
  status: "Prototype",
  summary:
    "A chat NPC in the portfolio's pixel world that understands free-text conversation. Instead of picking dialogue options, you type what you want and Manh responds naturally — and can physically walk you to places, show you projects, or just chat about the site.",
  description:
    "An NPC powered by Cohere's LLM that lives in the Phaser 3 pixel world. Visitors can have actual conversations with it, ask about projects and publications, get guided to specific locations in the world, or browse archive entries — all through normal chat. The LLM returns structured instructions that the game executes as real actions: pathfinding, sprite animation, overlay navigation.",
  detailSections: [
    {
      label: "What it does",
      content:
        "A chat NPC you can actually have a real conversation with. Instead of picking from pre-written dialogue options, you type whatever you want and Manh responds naturally — and sometimes physically walks you to places in the world when it's relevant.",
    },
    {
      label: "How the LLM connects to the game",
      content:
        "Every chat response comes back as structured instructions — what Manh says, plus things like 'walk to the workshop' or 'show this project entry.' The game reads those and makes it happen: pathfinding, sprite animation, opening overlays. This means the LLM feels like it's actually in the world, not just a text box floating on top.",
    },
    {
      label: "What Manh knows about",
      content:
        "Manh has a compact summary of every project, publication, and note on the site baked into the prompt. If you mention something specific by name, the system automatically pulls in the full text so it can talk about details. No databases, no vector search — just simple word matching with a sanity gate to avoid false matches.",
    },
    {
      label: "Scripted + freeform, same NPC",
      content:
        "The same character can either follow a pre-written tour script (reliable, always works) or chat freely with the LLM (open-ended, unpredictable). Both paths share the same sprite, movement, and animations. The system makes sure they don't step on each other — the LLM doesn't walk while you're still typing, and the guide doesn't interrupt mid-conversation.",
    },
  ],
  links: [
    {
      label: "Chat with my digital twin",
      href: "/world",
      kind: "demo",
      showOnCard: true,
    },
  ],
  tags: [
    "Digital Twin",
    "LLM Agent",
    "NPC Chat",
    "Game Integration",
    "Phaser 3",
    "World Mode",
    "Cohere",
  ],
}

export default projectDigitalTwin
