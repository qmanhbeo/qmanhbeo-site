import type { ProjectEntry } from "@/content/entries"

const projectDigitalTwin: ProjectEntry = {
  slug: "project-digital-twin",
  type: "project",
  title: "Digital Twin — Manh NPC",
  subtitle: "An AI-powered 2D pixel-world guide that lives in the Phaser RPG map",
  dateLabel: "Jun 2025 - Present",
  status: "In Progress",
  excludeFromResume: true,
  summary:
    "A Cohere LLM-powered digital twin embedded as a wanderable NPC in the Phaser 3 world mode. The Manh NPC can guide visitors on 4 curated tours, engage in free-text conversation with structured JSON actions, participate in campfire gatherings, respond to entry references, and offer ambient personality snippets.",
  description:
    "The Manh NPC is a digital-twin integration that turns the portfolio's Phaser world into an inhabited space. Powered by Cohere's command-r-plus model, the NPC responds to free-text chat with structured JSON actions (moveTo, emote, showEntry) and maintains conversation history across sessions.",
  detailSections: [
    {
      label: "Guided Tours",
      content:
        "Manh offers 4 walking tours (Workshop, Library, Yard, Post Office) using the leadTo navigation system. Each destination has a custom arrival description and a 30-second wandering timeout.",
    },
    {
      label: "Free-Text Chat",
      content:
        "A Cohere LLM proxy generates natural replies with structured JSON output. Actions include moveTo (walk to a location), emote (flavor text), and showEntry (offer an archive scroll). A compact knowledge index of all 32 archive entries is injected into the system prompt.",
    },
    {
      label: "Campfire Gatherings",
      content:
        "From 19:00–19:30 local time, all NPCs walk to the campfire in a circle formation. Manh joins after completing any active guide. Ambient music, gathering-specific dialogue lines, and a Bard mute/unmute toggle accompany the event.",
    },
    {
      label: "Ambient Life",
      content:
        "NPCs display random text bubbles with personality-matching lines at 2–30 second intervals, creating a living atmosphere without requiring player interaction.",
    },
  ],
  links: [
    {
      label: "Visit the Hearth",
      href: "/world?chat-manh",
      kind: "demo",
      showOnCard: true,
    },
  ],
  tags: [
    "Digital Twin",
    "LLM Integration",
    "Cohere",
    "Phaser 3",
    "NPC AI",
    "World Mode",
    "Interactive Fiction",
    "Prompt Engineering",
  ],
}

export default projectDigitalTwin
