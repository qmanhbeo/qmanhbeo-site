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
    "This report documents the SDG Lens system, a multi-label text classification framework that applies attention mechanisms to interpret how policy and sustainability documents map onto UN Sustainable Development Goal categories. The pipeline combines structured label encoding, transformer-based feature extraction (BERT), and attention-weight visualisation to support systematic content analysis. Experiments demonstrate that BERT-based classifiers achieve micro-F1 of 0.717 at 4,000 training samples (vs TF-IDF baseline of 0.700), with significant per-label variance (SDG 11: 0.764 vs SDG 5: 0.637). Attention-weighted tokens provide plausible rationales for human verification, serving as inspectable proxy evidence for prediction transparency.",
  researchQuestion:
    "Can attention-based interpretability in a multi-label text classifier provide both accurate SDG classification and inspectable evidence for human verification of policy and sustainability documents?",
  methodology:
    "Built a PyTorch-based NLP pipeline with BERT-base-uncased as the encoder, fine-tuned for multi-label classification across 17 SDG categories. Used structured label encoding with train/test/validation splits. Compared against TF-IDF + linear SVM baseline. Applied attention-weight extraction to surface which textual features drive each prediction, with visualisation for human inspection.",
  findings:
    "BERT achieves micro-F1=0.717 at 4,000 samples versus TF-IDF's 0.700. Per-label performance varies substantially (SDG 11: 0.764, SDG 5: 0.637). Attention-weighted tokens provide inspectable rationales aligned with human coders' judgement in qualitative review, though they should be treated as proxy evidence rather than causal explanations.",
  implications:
    "Explainable NLP can bridge the gap between automated document classification and human oversight in policy settings. The SDG Lens demonstrates that attention visualisation is a viable mechanism for building trust with non-technical stakeholders such as NGOs and UN researchers. Interpretability is not merely a technical requirement but an ethical mandate for high-stakes policy applications.",
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
