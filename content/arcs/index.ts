import type { ArcEntry } from "@/content/entries"
import arcBirminghamAiSustainability from "./arc-birmingham-ai-sustainability"
import arcEepseaEnergyPolicy from "./arc-eepsea-energy-policy"
import arcHoChiMinhCityFoundations from "./arc-ho-chi-minh-city-foundations"
import arcIberiaFirstLoop from "./arc-iberia-first-loop"
import arcXianDesignLens from "./arc-xian-design-lens"

export const arcEntries = [
  arcIberiaFirstLoop,
  arcHoChiMinhCityFoundations,
  arcEepseaEnergyPolicy,
  arcXianDesignLens,
  arcBirminghamAiSustainability,
] satisfies ArcEntry[]
