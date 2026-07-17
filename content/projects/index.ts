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
import projectOpenEcons from "./project-open-econs"

const PROJECT_ORDER: Record<string, number> = {
  "project-sdg-lens": 1,
  "project-paths-untold": 2,
  "project-vn-real-estate-pipeline": 3,
  "project-gaia": 4,
  "project-open-econs": 5,
  "project-vn-stock-rl-sandbox": 6,
  "project-uk-procurement-pipeline": 7,
  "project-arduino-environment-robot": 8,
  "project-qmanhbeo-site": 9,
  "project-digital-twin": 10,
  "project-gia-lai-xiangqi": 11,
  "project-gsp-replication": 12,
}

const allProjects = [
  projectSdgLens,
  projectPathsUntold,
  projectVnRealEstatePipeline,
  projectGaia,
  projectOpenEcons,
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
