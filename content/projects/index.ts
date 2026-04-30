import type { ProjectEntry } from "@/content/entries"
import projectArduinoEnvironmentRobot from "./project-arduino-environment-robot"
import projectGaia from "./project-gaia"
import projectPathsUntold from "./project-paths-untold"
import projectUkProcurementPipeline from "./project-uk-procurement-pipeline"
import projectVnRealEstatePipeline from "./project-vn-real-estate-pipeline"
import projectVnStockRlSandbox from "./project-vn-stock-rl-sandbox"

const PROJECT_ORDER: Record<string, number> = {
  "project-vn-stock-rl-sandbox": 1,
  "project-gaia": 2,
  "project-vn-real-estate-pipeline": 3,
  "project-uk-procurement-pipeline": 4,
  "project-paths-untold": 5,
  "project-arduino-environment-robot": 6,
}

const allProjects = [
  projectVnStockRlSandbox,
  projectGaia,
  projectVnRealEstatePipeline,
  projectUkProcurementPipeline,
  projectPathsUntold,
  projectArduinoEnvironmentRobot,
]

export const projectEntries = [...allProjects].sort((a, b) => {
  const orderA = PROJECT_ORDER[a.slug] ?? 999
  const orderB = PROJECT_ORDER[b.slug] ?? 999
  return orderA - orderB
}) satisfies ProjectEntry[]
