import type { PublicationEntry } from "@/content/entries"

const paperAinsdFoodRouting: PublicationEntry = {
  slug: "paper-ainsd-food-routing",
  type: "publication",
  order: 7,
  title: "AI-Enhanced Routing for Equitable Food Distribution: A Vietnam Case Study",
  subtitle: "AI & Sustainable Development Assignment 1 — Research proposal",
  journal: "AI & Sustainable Development — University of Birmingham",
  yearLabel: "2025",
  status: "MSc Assignment",
  summary:
    "A research proposal comparing cost-minimising heuristics with reinforcement learning for equitable emergency food distribution in Vietnam, motivated by the November 2025 floods.",
  abstract:
    "Compares RL-based routing against cost-minimising heuristics for equitable emergency food distribution in Vietnam's flood-prone regions.",
  researchQuestion:
    "Can RL-based routing improve equity of emergency food distribution compared to conventional cost-minimising heuristics?",
  methodology:
    "Simulated two-route comparison using WFP HungerMap data and OpenStreetMap networks with two national depots.",
  findings:
    "RL reduces unmet demand in high-hunger provinces at the cost of longer routes, but provincial-level abstraction masks within-province inequality.",
  implications:
    "AI-based allocation in public food systems must pair optimisation with ethical safeguards and human oversight.",
  link: {
    label: "Read full report",
    href: "/papers/ainsd-1-food-routing.pdf",
    kind: "reference",
  },
  tags: ["Reinforcement Learning", "Food Security", "Humanitarian Logistics", "Vietnam", "AI for Development", "UoBrum"],
}

export default paperAinsdFoodRouting
