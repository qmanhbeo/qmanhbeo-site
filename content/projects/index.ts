import type { ProjectEntry } from "@/content/entries"
import projectSdgLens from "./project-sdg-lens"
import projectPathsUntold from "./project-paths-untold"
import projectVnRealEstatePipeline from "./project-vn-real-estate-pipeline"
import projectGaia from "./project-gaia"
import projectVnStockRlSandbox from "./project-vn-stock-rl-sandbox"
import projectUkProcurementPipeline from "./project-uk-procurement-pipeline"
import projectArduinoEnvironmentRobot from "./project-arduino-environment-robot"
import projectQmanhbeoSite from "./project-qmanhbeo-site"
import projectDigitalTwin from "./project-digital-twin"
import projectGiaLaiXiangqi from "./project-gia-lai-xiangqi"
import projectGspReplication from "./project-gsp-replication"

const PROJECT_ORDER: Record<string, number> = {
  "project-sdg-lens": 1,
  "project-paths-untold": 2,
  "project-vn-real-estate-pipeline": 3,
  "project-gaia": 4,
  "project-vn-stock-rl-sandbox": 5,
  "project-uk-procurement-pipeline": 6,
  "project-arduino-environment-robot": 7,
  "project-qmanhbeo-site": 8,
  "project-digital-twin": 9,
  "project-gia-lai-xiangqi": 10,
  "project-gsp-replication": 11,
}

const allProjects = [
  projectSdgLens,
  projectPathsUntold,
  projectVnRealEstatePipeline,
  projectGaia,
  projectVnStockRlSandbox,
  projectUkProcurementPipeline,
  projectArduinoEnvironmentRobot,
  projectQmanhbeoSite,
  projectDigitalTwin,
  projectGiaLaiXiangqi,
  projectGspReplication,
]

export const projectEntries = [...allProjects].sort((a, b) => {
  const orderA = PROJECT_ORDER[a.slug] ?? 999
  const orderB = PROJECT_ORDER[b.slug] ?? 999
  return orderA - orderB
}) satisfies ProjectEntry[]
