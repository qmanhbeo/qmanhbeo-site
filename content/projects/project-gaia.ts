import type { ProjectEntry } from "@/content/entries"

const projectGaia: ProjectEntry = {
  slug: "project-gaia",
  type: "project",
  title: "GAIA: An Agent-Based Sandbox for Society's Oldest Problem — Resource Allocation",
  subtitle: "Households, labour, food, water, and policy in one living system",
  dateLabel: "Apr 2025 - Present",
  status: "In Progress",
  summary:
    "A personal project exploring society's oldest problem — who gets what, under what constraints, and at whose cost — through agent-based simulation and reinforcement learning.",
  description:
    "GAIA is a personal effort to do social science through simulation: building a world of households, scarcity, and ecological limits where questions of fairness, distribution, and collective survival can be probed rather than optimised into abstraction.",
  detailSections: [
    {
      label: "Premise",
      content:
        "A personal project exploring society's oldest problem — who gets what, under what constraints, and at whose cost — through agent-based simulation.",
    },
    {
      label: "Design",
      content:
        "Households, labour, food, water, and policy are modelled as interdependent agents so that emergent distributional outcomes can be observed, stressed, and debated rather than hidden inside a reward function.",
    },
    {
      label: "Purpose",
      content:
        "A sandbox for social-science thinking: testing theories of fairness, institutional design, and allocation under ecological and institutional constraints before any claim of optimality is entertained.",
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
