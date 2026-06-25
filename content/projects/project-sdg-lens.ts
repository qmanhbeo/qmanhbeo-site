import type { ProjectEntry } from "@/content/entries"

const projectSdgLens: ProjectEntry = {
  slug: "project-sdg-lens",
  type: "project",
  title: "SDG Lens: Explainable NLP for Sustainability Text Classification",
  subtitle: "Multi-label classification with attention-based interpretability for policy documents",
  dateLabel: "May 2026",
  status: "Completed",
  summary:
    "A PyTorch-based explainable NLP pipeline that classifies policy and sustainability texts into UN Sustainable Development Goal categories and surfaces which textual features drive each prediction through attention-weight analysis.",
  description:
    "SDG Lens is a multi-label text classification framework that applies attention mechanisms to interpret how policy and sustainability documents map onto UN SDG categories. The pipeline combines structured label encoding, transformer-based feature extraction, and attention-weight visualisation to support systematic content analysis and codebook-style classification logic.",
  detailSections: [
    {
      label: "Pipeline",
      content:
        "Built a PyTorch-based explainable NLP pipeline to classify policy and sustainability text into UN SDG categories.",
    },
    {
      label: "Interpretability",
      content:
        "Utilized multi-label classification and attention mechanisms to mathematically isolate and visualize key driving textual features.",
    },
    {
      label: "Validation",
      content:
        "Applied systematic content analysis and codebook-development logic to validate classification boundaries and align model outputs with expert expectations.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/SDG-Lens",
      kind: "repository",
      showOnCard: true,
    },
  ],
  tags: ["PyTorch", "NLP", "Text Classification", "Attention Mechanism", "Explainable AI", "Sustainable Development Goals"],
}

export default projectSdgLens
