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
    "A research proposal comparing a traditional cost-minimising routing model with a reinforcement learning model that prioritises hunger-affected provinces for emergency food distribution in Vietnam. The study evaluates whether AI-driven routing can improve equity and efficiency under conditions of isolation, road disruption, and surge demand, using Vietnam as a testbed following the November 2025 floods that exposed gaps in manual food delivery systems.",
  researchQuestion:
    "Can reinforcement learning-based routing improve the equity and efficiency of emergency food distribution in Vietnam compared to conventional cost-minimising heuristics, particularly under conditions of isolation, road disruption, and surge demand?",
  methodology:
    "Two-route comparison: (1) a baseline cost-minimising greedy nearest-neighbour heuristic, and (2) a reinforcement learning agent trained with state information on location, unmet demand, and hunger severity. Demand modelled at the provincial level using WFP HungerMap data; routing network constructed from OpenStreetMap data with two national food reserve depots (Hanoi and Can Tho/HCMC).",
  findings:
    "Expected findings include that RL-based routing can reduce unmet demand in high-hunger provinces compared to cost-minimising heuristics, though with trade-offs in total distance travelled. The proposal identifies key limitations including provincial-level abstraction masking within-province inequality, and the need for ethical safeguards in algorithmic allocation of public resources.",
  implications:
    "National food distribution systems in low- and middle-income countries could benefit from AI-based optimisation that incorporates equity objectives alongside efficiency. However, implementation requires transparent accountability mechanisms, human oversight, and careful ethical evaluation to avoid reinforcing existing biases and governance challenges.",
  link: {
    label: "Read full report",
    href: "/papers/ainsd-1-food-routing.pdf",
    kind: "reference",
  },
  tags: ["Reinforcement Learning", "Food Security", "Humanitarian Logistics", "Vietnam", "AI for Development", "UoBrum"],
}

export default paperAinsdFoodRouting
