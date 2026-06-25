import type { PublicationEntry } from "@/content/entries"

const paperAinsdHealthcareAi: PublicationEntry = {
  slug: "paper-ainsd-healthcare-ai",
  type: "publication",
  order: 8,
  title: "Beyond Trust and Acceptance: Sentiment as Judgments of Legitimacy in Healthcare AI Policy",
  subtitle: "AI & Sustainable Development Group Project — Systematic review",
  journal: "AI & Sustainable Development — University of Birmingham",
  yearLabel: "2026",
  status: "MSc Assignment",
  summary:
    "A systematic review arguing that public sentiment toward healthcare AI is better understood as a judgment of institutional legitimacy rather than as trust or acceptance of the technology itself.",
  abstract:
    "Argues that unease toward healthcare AI is about institutional legitimacy — who decides, who is accountable — not about trust in the technology.",
  researchQuestion:
    "Why does unease persist even when AI systems are accurate and transparent, and how can a legitimacy framework better explain it?",
  methodology:
    "Systematic mapping review of health policy, medical ethics, and AI governance literature, synthesised around three governance frictions.",
  findings:
    "Negative sentiment concentrates where AI displaces clinical authority, lacks meaningful consent, or denies care without appeal — especially where prior discrimination exists.",
  implications:
    "Treat sentiment as a governance signal. Responses need disclosure, contestability, and institutional accountability, not just explainability.",
  links: [
    {
      label: "Read full report",
      href: "/papers/ainsd-2-healthcare-ai.pdf",
      kind: "reference",
    },
  ],
  tags: ["Healthcare AI", "Legitimacy", "AI Governance", "Health Policy", "Systematic Review", "Trust", "UoBrum"],
}

export default paperAinsdHealthcareAi
