import type { ProjectEntry } from "@/content/entries"

const projectVnRealEstatePipeline: ProjectEntry = {
  slug: "project-vn-real-estate-pipeline",
  type: "project",
  title: "Vietnamese Real Estate Data Pipeline",
  subtitle: "Published on Kaggle with organic community adoption and external citations",
  dateLabel: "Mar 2025 - Sep 2025",
  status: "Completed",
  summary:
    "A large-scale data pipeline that collects, cleans, and normalises Vietnamese housing listings from fragmented sources. Published openly on Kaggle, where it has received organic community adoption, credits, and citations for its data integrity and systematic collection rigour.",
  description:
    "This pipeline transforms scattered Vietnamese housing listings into an analysis-ready structured dataset. The project was published publicly on Kaggle and has attracted organic community adoption, with external users crediting and citing the dataset for its systematic collection methodology, data integrity, and comprehensive validation.",
  detailSections: [
    {
      label: "Pipeline",
      content:
        "Developed an end-to-end data pipeline using regex parsing, missing-value imputation, and deduplication to aggregate unstructured housing data.",
    },
    {
      label: "Publication",
      content:
        "Published the cleaned dataset openly on Kaggle, earning organic community adoption and external independent citations.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/VN-real-estate-scraper",
      kind: "repository",
      showOnCard: true,
    },
    {
      label: "Kaggle Dataset",
      href: "https://www.kaggle.com/datasets/qmanhbeo/vietnamese-real-estate-listings-may-2024",
      kind: "kaggle",
      showOnCard: true,
    },
    {
      label: "Organic citation (forked dataset)",
      href: "https://www.kaggle.com/datasets/cnglmph/ho-chi-minh-city-real-estate-data-2025",
      kind: "reference",
    },
    {
      label: "Organic citation (Tableau viz)",
      href: "https://public.tableau.com/app/profile/bluetail.zacky/viz/SaigonRealEstate2025/Overview",
      kind: "reference",
    },
  ],
  tags: ["Web Scraping", "Data Cleaning", "Regex Parsing", "Kaggle Publication", "Data Validation", "Exploratory Analysis"],
}

export default projectVnRealEstatePipeline
