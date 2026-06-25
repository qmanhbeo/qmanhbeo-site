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
    "This review frames sentiment toward healthcare AI not as trust or acceptance, but as a judgment of legitimacy: about how AI involvement is authorised and governed. Evidence across health policy and AI governance shows that negative sentiment arises when AI overrides clinical judgment, is used without clear notice or choice, or affects decisions that deny care without a clear route for appeal. Institutional history matters: where patients have faced discrimination or unaccountable bureaucracy, AI is often seen as a continuation of those harms. The review concludes by proposing a research agenda that treats legitimacy as measurable through complaint data, appeals, and discourse, and examines it at scale using computational methods.",
  researchQuestion:
    "Why does public unease toward healthcare AI persist even when systems appear accurate, transparent, and legally compliant, and how can this be better understood through a legitimacy rather than trust/acceptance framework?",
  methodology:
    "Concept-focused systematic mapping review of peer-reviewed health policy, medical ethics, and AI governance literature. Iterative keyword searching supplemented by backward and forward snowballing from high-relevance systematic reviews. Evidence synthesised analytically around three identified governance frictions: authority conflicts, weak notice and consent, and AI-linked denial of care.",
  findings:
    "Negative sentiment concentrates where governance arrangements are experienced as misaligned: when AI displaces clinical authority, enters decisions without meaningful notice, or becomes entangled with care denial without clear challenge routes. AI inherits institutional reputation — in settings with prior discrimination, transparency alone cannot repair legitimacy deficits. Existing attitude scales foreground optimism and perceived usefulness but lack purchase on moral unease, consent, or accountability.",
  implications:
    "Policymakers should treat sentiment as a governance signal rather than a communication problem. Effective responses include clear role allocation, mandatory disclosure, contestability mechanisms, and institutional responsiveness. The paper proposes five computationally actionable research directions using NLP and interrupted time-series methods to measure legitimacy at scale.",
  link: {
    label: "Read full report",
    href: "/papers/ainsd-2-healthcare-ai.pdf",
    kind: "reference",
  },
  tags: ["Healthcare AI", "Legitimacy", "AI Governance", "Health Policy", "Systematic Review", "Trust", "UoBrum"],
}

export default paperAinsdHealthcareAi
