import type { ProjectEntry } from "@/content/entries"

const projectArduinoEnvironmentRobot: ProjectEntry = {
  slug: "project-arduino-environment-robot",
  type: "project",
  title: "Arduino Robot for Environment Sensing and Learning",
  subtitle: "A small embodied system that learns by touching the world",
  status: "Early Experiment",
  summary:
    "A small embodied experiment in sensing and learning, beginning with humble lights and motors and reaching toward something that can adapt to its surroundings.",
  description:
    "This build started as a modest hardware experiment and became a useful way to think about learning in systems that cannot stay abstract because the world immediately pushes back.",
  detailSections: [
    {
      label: "Embodied Constraint",
      content:
        "Unlike a purely simulated environment, the robot has to deal with sensing noise, response lag, and the ordinary fragility of physical systems.",
    },
    {
      label: "Components",
      content:
        "Sensors, motor control, and control logic were assembled as a practical introduction to how adaptive behavior looks when it has to move through a room rather than across a graph.",
    },
    {
      label: "Takeaway",
      content:
        "The project reinforced an intuition that still matters across later work: learning systems become more honest when the environment can resist them.",
    },
  ],
  links: [],
  tags: ["Arduino", "Sensors", "Motor Control", "Embodied AI"],
}

export default projectArduinoEnvironmentRobot
