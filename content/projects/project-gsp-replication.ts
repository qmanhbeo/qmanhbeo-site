import type { ProjectEntry } from "@/content/entries"

const projectGspReplication: ProjectEntry = {
  slug: "project-gsp-replication",
  type: "project",
  title: "GSP Replication: Critical Assessment of SDG Clustering Research",
  subtitle: "Replication study revealing hidden hyperparameter sensitivity in sustainability clustering",
  dateLabel: "March 2026",
  status: "Completed",
  summary:
    "A replication and critical assessment of a published K-Means clustering study on the SDG Index, revealing that the five-cluster result depends on an undocumented hyperparameter choice.",
  description:
    "A thorough replication of Celik et al. (2025) that rebuilt the computational pipeline from the released repository, identified missing dependencies and state-dependent execution, and systematically tested K-Means initialization sensitivity. The study found that the paper's five-cluster result is only reproducible under n_init=1, with n_init=5 favouring k=6 and n_init=10 favouring k=4.",
  detailSections: [
    {
      label: "Replication",
      content:
        "Rebuilt the full K-Means + PCA clustering pipeline from the authors' GitHub repository, working through missing dependencies, syntax errors, and state-dependent execution blocks.",
    },
    {
      label: "Sensitivity Analysis",
      content:
        "Systematically tested K-Means with varying n_init values (1, 5, 10) and found the published five-cluster result is uniquely tied to the undocumented n_init=1 setting — under standard defaults, the optimal cluster count shifts to 4 or 6.",
    },
    {
      label: "Validation Audit",
      content:
        "Identified that ANOVA and MANOVA tables were manually hard-coded rather than computed, sample reporting was inconsistent (143 effective vs 166 implied), and Random Forest classification results did not fully match.",
    },
    {
      label: "Next Steps",
      content:
        "Plan to submit a pull request to the original author streamlining their repository with a clean pipeline, pinned dependencies, and computed validation tables.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/AI4GC-1-submission-Leo",
      kind: "repository",
      showOnCard: true,
    },
  ],
  relatedEntries: [
    {
      slug: "paper-ai4gc-gsp",
      label: "Read the accompanying publication",
    },
  ],
  tags: ["Reproducibility", "K-Means", "SDG Index", "Sustainability", "Machine Learning", "Critical Assessment", "UoBrum"],
}

export default projectGspReplication
