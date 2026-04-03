import type { ProjectEntry } from "@/content/entries"

const projectVnStockRlSandbox: ProjectEntry = {
  slug: "project-vn-stock-rl-sandbox",
  type: "project",
  order: 1,
  title: "Vietnam Stock Reinforcement Learning Sandbox",
  subtitle: "A market world where agents must live with friction and timing",
  dateLabel: "Jan 2026 - Present",
  status: "In Progress",
  summary:
    "A trading sandbox built to feel less like a toy and more like a market, where reinforcement learning agents must live with costs, timing, settlement rules, and imperfect decisions.",
  description:
    "This project turns the Vietnamese market into an environment where reinforcement learning agents have to contend with delay, liquidity friction, transaction costs, and the practical messiness that cleaner benchmarks often smooth away.",
  detailSections: [
    {
      label: "Why Build It",
      content:
        "Most RL trading demos flatten the market until success becomes a function of unrealistic assumptions. This sandbox was built to reintroduce the parts of the world that usually get removed: waiting, penalties, timing mistakes, and microstructure that pushes back.",
    },
    {
      label: "System Shape",
      content:
        "The environment combines PPO and recurrent PPO experiments with sequence-aware models, rule-driven execution constraints, and market mechanics tuned to Vietnamese trading realities rather than generic global defaults.",
    },
    {
      label: "What It Supports",
      content:
        "The sandbox is designed as a research surface for studying policy, strategy, and behavior under non-ideal conditions, not just a benchmark for headline returns.",
    },
  ],
  links: [
    {
      label: "Alpha-learning momentum model",
      href: "https://github.com/qmanhbeo/VN-market-momentum-analysis",
      kind: "reference",
    },
  ],
  tags: ["Reinforcement Learning", "PPO / RecurrentPPO", "LSTM / CNN", "Trading Simulation"],
}

export default projectVnStockRlSandbox
