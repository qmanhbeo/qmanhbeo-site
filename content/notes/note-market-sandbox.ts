import type { NoteEntry } from "@/content/entries"

const noteMarketSandbox: NoteEntry = {
  slug: "note-market-sandbox",
  type: "note",
  order: 1,
  title: "Notes from a Vietnamese Market Sandbox",
  subtitle: "Why trading agents should have to live with friction",
  dateLabel: "Jan 2026 - Present",
  noteLabel: "Project note",
  summary:
    "Building a market world for reinforcement learning meant teaching agents to live with delay, friction, transaction costs, taxes, and the ordinary consequences of acting too early or too late.",
  body: [
    "The market sandbox became interesting only when it stopped behaving like a laboratory vacuum. Delay, taxes, settlement, and imperfect execution turned out to be the parts that gave the environment moral and strategic texture.",
    "A cleaner benchmark can make an agent look impressive very quickly. A rougher market asks a more useful question: what survives once the world starts charging for every confident mistake?",
    "That shift is why the sandbox matters to me. It is not just about better trading behavior. It is about building environments where learning has to negotiate with reality instead of floating above it.",
  ],
  tags: ["Reinforcement Learning", "Markets", "Simulation", "Vietnam"],
}

export default noteMarketSandbox
