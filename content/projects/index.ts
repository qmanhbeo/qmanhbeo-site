import type { ProjectEntry } from "@/content/entries"
import projectArduinoEnvironmentRobot from "./project-arduino-environment-robot"
import projectGaia from "./project-gaia"
import projectPathsUntold from "./project-paths-untold"
import projectUkProcurementPipeline from "./project-uk-procurement-pipeline"
import projectVnRealEstatePipeline from "./project-vn-real-estate-pipeline"
import projectVnStockRlSandbox from "./project-vn-stock-rl-sandbox"

export const projectEntries = [
  projectVnStockRlSandbox,
  projectGaia,
  projectVnRealEstatePipeline,
  projectUkProcurementPipeline,
  projectPathsUntold,
  projectArduinoEnvironmentRobot,
] satisfies ProjectEntry[]
