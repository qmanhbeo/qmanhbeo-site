import type React from "react"
import type { LucideIcon } from "lucide-react"
import { BookOpen, Hammer, Home, Mail, Map, ScrollText, User, Users } from "lucide-react"
import AboutSection from "@/components/AboutSection"
import BlogSection from "@/components/BlogSection"
import HeroSection from "@/components/HeroSection"
import LetterSection from "@/components/LetterSection"
import MapSection from "@/components/MapSection"
import ProjectsSection from "@/components/ProjectsSection"
import PublicationsSection from "@/components/PublicationsSection"
import SocialsSection from "@/components/SocialsSection"

export type SiteSectionId =
  | "hero"
  | "about"
  | "wanderer"
  | "projects"
  | "scrolls"
  | "blog"
  | "letter"
  | "socials"

export interface SiteSection {
  id: SiteSectionId
  title: string
  navLabel: string
  navDescription: string
  icon: LucideIcon
  Component: (props: { revealClassName?: string }) => React.ReactElement
}

export const sections: SiteSection[] = [
  {
    id: "hero",
    title: "Campfire",
    navLabel: "Hearth",
    navDescription: "Welcome to the journey",
    icon: Home,
    Component: HeroSection,
  },
  {
    id: "about",
    title: "Lore",
    navLabel: "Lore",
    navDescription: "The tale of Leonardo",
    icon: User,
    Component: AboutSection,
  },
  {
    id: "wanderer",
    title: "Wanderer's Map",
    navLabel: "Journey",
    navDescription: "Paths across distant lands",
    icon: Map,
    Component: MapSection,
  },
  {
    id: "projects",
    title: "Spell Scrolls",
    navLabel: "Forge",
    navDescription: "Crafted spell scrolls",
    icon: Hammer,
    Component: ProjectsSection,
  },
  {
    id: "scrolls",
    title: "Manuscripts",
    navLabel: "Manuscripts",
    navDescription: "Scholarly manuscripts",
    icon: ScrollText,
    Component: PublicationsSection,
  },
  {
    id: "blog",
    title: "Campfire Notes",
    navLabel: "Notes",
    navDescription: "Fragments from the workbench",
    icon: BookOpen,
    Component: BlogSection,
  },
  {
    id: "letter",
    title: "Letters",
    navLabel: "Letters",
    navDescription: "Words take flight",
    icon: Mail,
    Component: LetterSection,
  },
  {
    id: "socials",
    title: "Fellowship",
    navLabel: "Fellowship",
    navDescription: "Join the community",
    icon: Users,
    Component: SocialsSection,
  },
]

export const timelineEvents = [
  {
    year: "2021",
    event:
      "Set out from UEH in Applied Economics, following questions about systems, incentives, and how people live within them.",
  },
  {
    year: "2023",
    event: "Learned the patience of research through forecasting work and time-series econometrics.",
  },
  {
    year: "2024",
    event: "Entered energy and policy research at EEPSEA, and received the UEH Young Researcher Award.",
  },
  {
    year: "2025",
    event: "Crossed through Xi'an and then Birmingham, where design, AI, and sustainability began to converge.",
  },
  {
    year: "2025",
    event: "Worked with the SHAPE AI Challenge and brought research to ELG 2025.",
  },
  {
    year: "2026",
    event:
      "Now building reinforcement learning worlds, agent-based economies, and data systems shaped by real constraints.",
  },
]
