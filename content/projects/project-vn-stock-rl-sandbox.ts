import type { ProjectEntry } from "@/content/entries"

const projectVnStockRlSandbox: ProjectEntry = {
  slug: "project-vn-stock-rl-sandbox",
  type: "project",
  title: "Stocks Ecosystem: Modular Alpha Research & RL Trading Framework",
  subtitle: "End-to-end ecosystem combining alpha research with realistic market microstructure friction",
  dateLabel: "Jan 2026 - Present",
  status: "In Progress",
  summary:
    "An end-to-end modular software ecosystem integrating an Alpha Research Lab with PPO/RecurrentPPO execution environments that model realistic market microstructure frictions including liquidity constraints, transaction latencies, and settlement rules.",
  description:
    "The Stocks Ecosystem is a modular framework that combines systematic alpha research with reinforcement learning trading agents. The Alpha Research Lab handles data ingestion, feature engineering, and signal discovery, while the RL execution layer models realistic market microstructure—liquidity constraints, transaction latencies, settlement rules—so agents learn under conditions that mirror actual trading environments.",
  detailSections: [
    {
      label: "Architecture",
      content:
        "Architected a modular software framework combining an Alpha Research Lab (data ingestion, feature engineering) with PPO/RecurrentPPO trading environments.",
    },
    {
      label: "Market Friction",
      content:
        "Modeled realistic market microstructure constraints directly into execution states, including bid-ask spreads, position tracking, and settlement delays.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/stocks-ecosystem",
      kind: "repository",
      showOnCard: true,
    },
  ],
  tags: ["Reinforcement Learning", "PPO / RecurrentPPO", "Market Microstructure", "Alpha Research", "Modular Architecture", "Trading Simulation"],
}

export default projectVnStockRlSandbox
