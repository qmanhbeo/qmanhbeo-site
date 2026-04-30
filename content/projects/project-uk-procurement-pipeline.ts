import type { ProjectEntry } from "@/content/entries"

const projectUkProcurementPipeline: ProjectEntry = {
  slug: "project-uk-procurement-pipeline",
  type: "project",
  title: "UK Public Procurement Data Collection and Analysis Pipeline",
  subtitle: "Following public records until they become policy-ready evidence",
  dateLabel: "Nov 2025",
  status: "Active Analysis",
  summary:
    "A procurement data pipeline built from years of UK records, gathering scattered public traces into a form that policy questions can actually lean on.",
  description:
    "This project follows procurement records across messy public sources and stitches them into a cleaner analytical surface so public spending can be examined as a system rather than as isolated files.",
  detailSections: [
    {
      label: "Problem",
      content:
        "Procurement data is public, but rarely structured for real use. The friction lives in the links, formats, and inconsistent metadata that make systematic analysis harder than it should be.",
    },
    {
      label: "Pipeline Design",
      content:
        "Collection, preprocessing, and schema repair were built to handle long time spans, scattered publication practices, and the need to preserve enough provenance for policy work.",
    },
    {
      label: "Why It Matters",
      content:
        "Once gathered coherently, the records become a way to ask better questions about institutions, allocation, and how public decisions leave administrative traces.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/uk-procurement-data-pipeline",
      kind: "repository",
      showOnCard: true,
    },
  ],
  tags: ["Public Data Collection", "Scraping", "Preprocessing", "Policy Analysis"],
}

export default projectUkProcurementPipeline
