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
    "This report replicates and critically appraises Çelik et al. (2025), a study using K-Means clustering on the 2025 SDG Index to group countries by sustainability performance. The main finding is that the paper's central five-cluster result is only partly reproducible: the clustering pattern can be recovered, but only after reconstructing missing implementation details. The key issue is that k=5 depends on an undocumented K-Means setting (n_init=1); under standard settings, k=4 or k=6 are preferred, making the five-cluster result unstable. The released repository lacks a clean one-command pipeline, results are partially hard-coded rather than computed, and validation sections are unverifiable.",
  researchQuestion:
    "How reproducible is the five-cluster sustainability classification published in Çelik et al. (2025), and how sensitive is its clustering result to K-Means initialization settings?",
  methodology:
    "Worked solely from the authors' released repository. Rebuilt the computational workflow step-by-step after identifying missing dependencies, syntax errors, and state-dependent execution blocks. Systematically tested K-Means with varying n_init values (1, 5, 10) and compared resulting cluster counts. Cross-checked sample sizes, preprocessing steps, and validation outputs against the paper's reported results.",
  findings:
    "The five-cluster result reproduces only under n_init=1; with n_init=5 the optimal k shifts to 6, and with n_init=10 to 4. The effective sample is 143 countries (not 166 as implied). ANOVA and MANOVA tables are manually hard-coded rather than computed. The Random Forest classification results do not fully match. Preprocessing in the code differs from the paper's method description.",
  implications:
    "Published clustering results in sustainability research may be less stable than they appear when key hyperparameters are undocumented. The study highlights the need for clean release pipelines with pinned environments, explicit hyperparameters, consistent sample reporting, and computed (rather than hard-coded) validation tables. Reproducibility standards in AI-for-development research require stronger computational transparency.",
  link: {
    label: "Read full report",
    href: "/papers/ai4gc-1-gsp.pdf",
    kind: "reference",
  },
  relatedEntries: [
    {
      slug: "project-gsp-replication",
      label: "See the replication repository",
    },
  ],
  tags: ["Reproducibility", "K-Means", "SDG Index", "Sustainability", "Machine Learning", "Critical Assessment", "UoBrum"],
}

export default paperAi4gcGsp
