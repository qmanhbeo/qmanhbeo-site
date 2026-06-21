import type { ProjectEntry } from "@/content/entries"

const projectArduinoEnvironmentRobot: ProjectEntry = {
  slug: "project-arduino-environment-robot",
  type: "project",
  title: "Arduino Robot for Environment Sensing and Learning",
  subtitle: "Bridging the gap from simulation to physical reality",
  dateLabel: "Ongoing",
  status: "Early Experiment",
  summary:
    "Built as an empirical, self-directed exploration into embodied AI — testing how learning systems handle the friction of physical reality versus perfect simulation.",
  description:
    "This build bridges the gap between simulated environments and physical systems — where sensing noise, response lag, and mechanical fragility replace frictionless abstractions. The robot is a reminder that any allocation theory must eventually survive contact with the world.",
  detailSections: [
    {
      label: "Embodied Constraint",
      content:
        "Built as an empirical, self-directed exploration into embodied AI — testing how learning systems handle the friction of physical reality versus perfect simulation.",
    },
    {
      label: "Convergence",
      content:
        "Assembled sensors, motor control, and adaptive logic to study how bounded agent behavior behaves when forced to move through a physical room rather than an idealized graph.",
    },
    {
      label: "Philosophical Role",
      content:
        "Developed a foundational insight that informs my ongoing research: learning systems and behavioral models become more honest when the environment can actively resist them.",
    },
  ],
  links: [],
  tags: ["Arduino", "Sensors", "Motor Control", "Sim-to-Real", "Resource Allocation", "Embodied AI"],
}

export default projectArduinoEnvironmentRobot
