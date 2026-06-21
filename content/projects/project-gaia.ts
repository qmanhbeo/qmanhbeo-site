import type { ProjectEntry } from "@/content/entries"

const projectGaia: ProjectEntry = {
  slug: "project-gaia",
  type: "project",
  title: "GAIA: Agent-based Economic Simulation for Reinforcement Learning Decision Making",
  subtitle: "Households, labor, food, water, and policy in one living system",
  dateLabel: "Apr 2025 - Present",
  status: "In Progress",
  summary:
    "Conceived and developed as a personal research initiative in computational philosophy and social science to model society's foundational challenge: optimal resource allocation.",
  description:
    "GAIA is a personal effort to do social science through simulation: building a world of households, scarcity, and ecological limits where questions of fairness, distribution, and collective survival can be probed rather than optimised into abstraction.",
  detailSections: [
    {
      label: "Premise",
      content:
        "Conceived and developed as a personal research initiative in computational philosophy and social science to model society's foundational challenge: optimal resource allocation.",
    },
    {
      label: "Design",
      content:
        "Represented households, labor, consumption, ecological limits, and policy choices as interconnected agents to observe how emergent behaviors surface before optimization claims are made.",
    },
    {
      label: "Purpose",
      content:
        "Designed the framework to stress-test institutional constraints, trade-offs, and delayed consequences in resource-scarce environments.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/gaia-ecogrid",
      kind: "repository",
      showOnCard: true,
    },
  ],
  tags: ["Agent-Based Modelling", "Simulation", "Reinforcement Learning", "Resource Allocation", "Social Science", "Fairness"],
}

export default projectGaia
