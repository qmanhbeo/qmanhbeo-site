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
    title: "Chronicle",
    navLabel: "Chronicle",
    navDescription: "The chronicle of Leonardo",
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
    year: "6-2021",
    event:
      "At Gia Định High School for the Gifted, the World revealed its language. Mathematics shaped it. The sciences gave it rules. History gave it memory. And English became the key that opened everything beyond.",
  },
  {
    year: "8-2021",
    event:
      "Set forth to the University of Economics HCMC in Applied Economics, following questions of systems, incentives, and how people live within them.",
  },
  {
    year: "10-2023",
    event: "Learned the discipline of research, studying, and teaching the patterns that unfold through time—what others call time-series econometrics.",
  },
  {
    year: "3-2024",
    event: "Honored with the UEH Young Researcher Award.",
  },
  {
    year: "10-2024",
    event: "Embarked on studying energy and the societal systems that decide how it flows at Economy and Environment Partnership SEA.",
  },
  {
    year: "3-2025",
    event: "Conferred Excellence by UEH.",
  },
  {
    year: "4-2025",
    event: "Seduced by the Art and Potential of Artificial Intelligence, where the craft of building worlds that learn begins to take shape.",
  },
  {
    year: "6-2025",
    event: "Crossed through Xi'an and then Birmingham, where design, AI, and sustainability began to converge.",
  },
  {
    year: "8-2025",
    event: "Brought research before scholars from around the world at the Economics, Law, and Government International Conference 2025.",
  },
  {
    year: "12-2025",
    event: "Answered the call of the Oxford University Press' SHAPE AI Challenge, where intelligence begins to reshape the craft of teaching.",
  },
  {
    year: "Today",
    event:
      "Building worlds that learn, agent-based economies, and systems that align research and policy through language. The journey continues, and the map is still being drawn.",
  },
]
