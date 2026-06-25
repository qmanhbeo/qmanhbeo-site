import type { PublicationEntry } from "@/content/entries"

const paperAi4gcSdgLens: PublicationEntry = {
  slug: "paper-ai4gc-sdg-lens",
  type: "publication",
  order: 6,
  title: "SDG Lens: Explainable NLP for Sustainability Text Classification",
  subtitle: "AI for Global Challenges Assignment 2 — Full project report",
  journal: "AI for Global Challenges — University of Birmingham",
  yearLabel: "2026",
  status: "MSc Assignment",
  summary:
    "Full project report documenting the SDG Lens pipeline: a PyTorch-based multi-label text classifier with attention-based interpretability for mapping policy documents to UN SDG categories.",
  abstract:
    "A PyTorch multi-label classifier with attention visualisation that maps policy documents to UN SDG categories, achieving micro-F1 of 0.717.",
  researchQuestion:
    "Can attention-based interpretability provide both accurate SDG classification and inspectable evidence for human verification?",
  methodology:
    "Fine-tuned BERT-base-uncased across 17 SDG categories, compared against TF-IDF baseline, with attention-weight extraction for interpretability.",
  findings:
    "BERT outperforms TF-IDF (0.717 vs 0.700 micro-F1). Attention highlights align with human judgement but are proxy evidence, not causal explanation.",
  implications:
    "Attention visualisation is a viable trust-building mechanism for non-technical stakeholders — interpretability is an ethical mandate for policy AI.",
  link: {
    label: "Read full report",
    href: "/papers/ai4gc-2-sdg-lens.pdf",
    kind: "reference",
  },
  relatedEntries: [
    {
      slug: "project-sdg-lens",
      label: "See the project repository and code",
    },
  ],
  tags: ["SDG Lens", "NLP", "Text Classification", "Attention Mechanism", "Explainable AI", "Sustainable Development Goals", "UoBrum"],
}

export default paperAi4gcSdgLens
