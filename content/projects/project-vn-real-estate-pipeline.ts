import type { ProjectEntry } from "@/content/entries"

const projectVnRealEstatePipeline: ProjectEntry = {
  slug: "project-vn-real-estate-pipeline",
  type: "project",
  order: 3,
  title: "Vietnamese Real Estate Data Pipeline",
  subtitle: "Cleaning scattered listings into something analysis can trust",
  dateLabel: "Mar 2025 - Sep 2025",
  status: "Completed",
  summary:
    "A long haul through messy housing listings, where scraping, cleaning, imputation, and bilingual outputs turned scattered records into something usable.",
  description:
    "This pipeline was built to pull Vietnamese housing listings out of inconsistent formats and into an analysis-ready dataset that could withstand actual inspection instead of only passing through a notebook once.",
  detailSections: [
    {
      label: "Collection Work",
      content:
        "The project gathered large volumes of listing data from fragmented sources, then tracked fields across inconsistent templates, formatting conventions, and duplicate records.",
    },
    {
      label: "Data Repair",
      content:
        "Regex parsing, cleaning, missing-value handling, and bilingual normalization turned noisy raw text into a pipeline that could support exploratory analysis without immediately collapsing under edge cases.",
    },
    {
      label: "Outcome",
      content:
        "What began as scattered market traces became a stable base for understanding patterns in price, geography, and listing behavior at scale.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/VN-real-estate-scraper",
      kind: "repository",
      showOnCard: true,
    },
  ],
  tags: ["Web Scraping", "Data Cleaning", "Regex Parsing", "Exploratory Analysis"],
}

export default projectVnRealEstatePipeline
