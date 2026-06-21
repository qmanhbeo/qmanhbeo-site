import type { ProjectEntry } from "@/content/entries"

const projectArduinoEnvironmentRobot: ProjectEntry = {
  slug: "project-arduino-environment-robot",
  type: "project",
  title: "Arduino Robot for Environment Sensing and Learning",
  subtitle: "Bridging the gap from simulation to physical reality",
  dateLabel: "Ongoing",
  status: "Early Experiment",
  summary:
    "A physical counterpart to simulation-based thinking: forcing the same resource-allocation and adaptation questions from GAIA into a body that must move through a real room rather than across a graph.",
  description:
    "This build bridges the gap between simulated environments and physical systems — where sensing noise, response lag, and mechanical fragility replace frictionless abstractions. The robot is a reminder that any allocation theory must eventually survive contact with the world.",
  detailSections: [
    {
      label: "Embodied Constraint",
      content:
        "Built to bridge the gap between simulated environments and physical systems — where sensing noise, response lag, and mechanical fragility replace frictionless abstractions.",
    },
    {
      label: "Convergence",
      content:
        "Forces the same resource-allocation and adaptation questions from GAIA into a body that must move through a real room rather than across a graph.",
    },
    {
      label: "Philosophical Role",
      content:
        "The physical counterpart to simulation-based thinking: a reminder that any allocation theory must eventually survive contact with the world.",
    },
  ],
  links: [],
  tags: ["Arduino", "Sensors", "Motor Control", "Sim-to-Real", "Resource Allocation", "Embodied AI"],
}

export default projectArduinoEnvironmentRobot
