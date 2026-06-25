import type { PublicationEntry } from "@/content/entries"

const paperAi4gcGsp: PublicationEntry = {
  slug: "paper-ai4gc-gsp",
  type: "publication",
  order: 5,
  title: "Replication and Critical Assessment: Global Sustainability Performance and Regional Disparities",
  subtitle: "AI for Global Challenges Assignment 1 — Replication of Çelik et al. (2025)",
  journal: "AI for Global Challenges — University of Birmingham",
  yearLabel: "2026",
  status: "MSc Assignment",
  summary:
    "A replication and critical assessment of a K-Means clustering study on the 2025 SDG Index, finding that the paper's five-cluster result depends on an undocumented hyperparameter choice.",
  abstract:
    "Replicates and critiques a K-Means study on the SDG Index, finding the five-cluster result collapses under standard hyperparameter settings.",
  researchQuestion:
    "How reproducible is the five-cluster SDG classification, and how sensitive is it to K-Means initialization?",
  methodology:
    "Rebuilt the pipeline from the authors' repository, tested K-Means with n_init=1, 5, and 10, and cross-checked sample sizes and validation tables.",
  findings:
    "The five-cluster result only holds at n_init=1 — at n_init=5 it becomes 6, at n_init=10 it becomes 4. Sample reporting and validation tables are inconsistent.",
  implications:
    "Published clustering results may be less stable than they appear when hyperparameters stay undocumented.",
  links: [
    {
      label: "Read full report",
      href: "/papers/ai4gc-1-gsp.pdf",
      kind: "reference",
    },
  ],
  relatedEntries: [
    {
      slug: "project-gsp-replication",
      label: "See the replication repository",
    },
  ],
  tags: ["Reproducibility", "K-Means", "SDG Index", "Sustainability", "Machine Learning", "Critical Assessment", "UoBrum"],
}

export default paperAi4gcGsp
