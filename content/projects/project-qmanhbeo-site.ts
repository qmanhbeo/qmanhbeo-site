import type { ProjectEntry } from "@/content/entries"

const projectQmanhbeoSite: ProjectEntry = {
  slug: "project-qmanhbeo-site",
  type: "project",
  title: "qmanhbeo.site — Medieval Portfolio Engine",
  subtitle: "Next.js horizontal-scroll site with Phaser RPG world mode, narrative AI game, and archive codex",
  dateLabel: "Ongoing",
  status: "Active Development",
  excludeFromResume: true,
  summary:
    "A personal portfolio built as a horizontally scrolling medieval-themed site with a 2D pixel RPG world mode, an LLM-driven narrative game, a searchable archive codex overlay, and a resume page — all in one Next.js application.",
  description:
    "This site combines a horizontal scroll container of 8 full-viewport sections with a Phaser-powered pixel RPG world mode, an OpenAI-driven interactive fiction engine (Paths Untold), and a parchment-themed archive codex for browsing projects, publications, and notes. Built with Next.js 16 App Router, TypeScript, and Tailwind CSS.",
  detailSections: [
    {
      label: "Horizontal Scroll System",
      content:
        "Eight full-viewport sections laid out horizontally with scroll-snap, sessionStorage-based back-navigation restoration, and per-section reveal animations.",
    },
    {
      label: "Phaser 3 RPG World",
      content:
        "A 2D pixel exploration mode where the player roams a medieval campsite map, discovering interactive objects that link back to site sections.",
    },
    {
      label: "Archive Codex",
      content:
        "A full-screen searchable book-style overlay indexing all projects, publications, travel arcs, and campfire notes with fuzzy search and detailed item pages.",
    },
    {
      label: "AI Narrative Engine",
      content:
        "Integrates Paths Untold, an LLM-powered interactive fiction system with prompt engineering, context-window management, and regex output parsing.",
    },
  ],
  links: [
    {
      label: "Grimoire",
      href: "https://github.com/qmanhbeo/qmanhbeo-site",
      kind: "repository",
      showOnCard: true,
    },
    {
      label: "Live Site",
      href: "https://qmanhbeo.vercel.app/",
      kind: "demo",
      showOnCard: true,
    },
  ],
  tags: [
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Phaser 3",
    "React",
    "Horizontal Scroll",
    "RPG World",
    "LLM Integration",
    "OpenAI",
    "Archive Codex",
    "Fuzzy Search",
    "Interactive Fiction",
  ],
}

export default projectQmanhbeoSite
