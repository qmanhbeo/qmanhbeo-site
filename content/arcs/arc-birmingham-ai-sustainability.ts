import type { ArcEntry } from "@/content/entries"

const arcBirminghamAiSustainability: ArcEntry = {
  slug: "arc-birmingham-ai-sustainability",
  type: "arc",
  order: 4,
  title: "AI for Sustainable Development",
  subtitle: "Where reinforcement learning and sustainability converged",
  yearLabel: "2025-2026",
  location: "Birmingham, United Kingdom",
  mood: "driven",
  summary:
    "Birmingham brought reinforcement learning, public systems, and sustainability into the same line of work: allocation under real constraints.",
  chapter:
    "At Birmingham, reinforcement learning and sustainability stopped being separate interests. They became one line of work: resource allocation, public systems, and fairer decision-making under real constraints.",
  images: [
    {
      src: "/img/map/Birmingham-20251.webp",
      alt: "Birmingham memory one",
    },
    {
      src: "/img/map/Birmingham-20261.webp",
      alt: "Birmingham memory two",
    },
    {
      src: "/img/map/Birmingham-20262.webp",
      alt: "Birmingham memory three",
    },
  ],
  coordinates: { top: "31%", left: "47%" },
  whatIDid: [
    "MSc in AI and Sustainable Development at University of Birmingham",
    "Built reinforcement learning agents and simulations for resource-allocation research",
    "Constructed data pipelines for UK procurement and Vietnamese housing markets",
  ],
  whomIMet: [
    "A cohort from across the world who brought different constraints to the same problem",
    "Advisors who pushed back on my assumptions before I even knew I had them",
    "Peers who made the work feel less like a degree and more like a shared inquiry into what is fair",
  ],
  whatILearned: [
    "RL is a tool for navigating constraints, not just optimising outcomes",
    "Agent-based models surface emergent behaviour that equations miss",
    "Sustainability is a systems problem - metrics alone cannot solve it",
  ],
  whatIAchieved: [
    "[The Birmingham Award with Distinction — Postgraduate](/papers/award-birmingham.pdf)",
    "GAIA: agent-based economic simulation for RL research (ongoing)",
    "Vietnam RL market sandbox with full market microstructure (ongoing)",
    "Multiple research tools and pipelines made public",
  ],
  tags: ["AI", "Reinforcement Learning", "Sustainability", "Systems Thinking", "Agent-Based Modelling"],
}

export default arcBirminghamAiSustainability
