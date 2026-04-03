import type { ProjectEntry } from "@/content/entries"

const projectGaia: ProjectEntry = {
  slug: "project-gaia",
  type: "project",
  order: 2,
  title: "GAIA: Agent-based Economic Simulation for Reinforcement Learning Decision Making",
  subtitle: "Households, labor, food, water, and policy in one living system",
  dateLabel: "Apr 2025 - Present",
  status: "In Progress",
  summary:
    "An agent-based world of households, labour, food, water, and environmental limits, built as a place where resource-allocation policies can be tested against something closer to life.",
  description:
    "GAIA is a simulated economy where reinforcement learning is forced to negotiate with households, scarcity, and environmental constraints rather than abstract reward surfaces detached from lived systems.",
  detailSections: [
    {
      label: "Core Premise",
      content:
        "The project starts from the belief that allocation problems should be tested in worlds with interdependence, trade-offs, and delayed consequences. GAIA turns those interactions into a simulation that can be probed, stressed, and revised.",
    },
    {
      label: "How It Works",
      content:
        "Households, labor, consumption, ecological limits, and policy choices are represented as connected agents and state transitions so emergent behavior can surface before any claim of optimization is taken seriously.",
    },
    {
      label: "Research Use",
      content:
        "GAIA is meant to support experiments on fairer resource allocation, policy stress-testing, and decision-making under ecological and institutional constraints.",
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
  tags: ["Agent-Based Modelling", "Simulation", "Reinforcement Learning", "Interactive Visualisation"],
}

export default projectGaia
