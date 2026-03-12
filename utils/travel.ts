export interface TravelYear {
  year: string
  location: string
  title: string
  memory: string
  mood: string
  coordinates: {
    top: string
    left: string
  }
}

interface LocationDetails {
  title: string
  description: string
}

export const getTravelYearKey = (journey: TravelYear) => `${journey.year}-${journey.location}-${journey.title}`

export const travelYears: TravelYear[] = [
  {
    year: "2021",
    location: "Ho Chi Minh City, Vietnam",
    title: "Economics, Questions, and First Principles",
    memory:
      "At the University of Economics Ho Chi Minh City, economics became a way to ask sharper questions about how people, systems, and incentives shape the world we live in.",
    mood: "curious",
    coordinates: { top: "67%", left: "78%" },
  },
  {
    year: "2023",
    location: "Ho Chi Minh City, Vietnam",
    title: "Forecasts, Research, and the Discipline of Data",
    memory:
      "Research assistance and teaching support pulled me deeper into empirical work, especially energy forecasting and the craft of turning methods into something explainable.",
    mood: "focused",
    coordinates: { top: "67%", left: "78%" },
  },
  {
    year: "2024",
    location: "Ho Chi Minh City, Vietnam",
    title: "Energy, Policy, and Real-World Stakes",
    memory:
      "Work with EEPSEA made the stakes concrete: energy poverty, energy transition, and socioeconomic outcomes are not abstractions when policy meets everyday life.",
    mood: "grounded",
    coordinates: { top: "67%", left: "78%" },
  },
  {
    year: "2025",
    location: "Xi'an, China",
    title: "Design Beyond the Spreadsheet",
    memory:
      "The summer exchange in interactive media design was a reminder that technical systems only matter if people can feel them, use them, and understand them.",
    mood: "open-eyed",
    coordinates: { top: "42%", left: "81%" },
  },
  {
    year: "2025",
    location: "Birmingham, United Kingdom",
    title: "AI for Sustainable Development",
    memory:
      "At Birmingham, reinforcement learning and sustainability stopped being separate interests. They became one line of work: resource allocation, public systems, and fairer decision making.",
    mood: "driven",
    coordinates: { top: "31%", left: "47%" },
  },
  {
    year: "2026",
    location: "Birmingham, United Kingdom",
    title: "Toward Systems that Matter",
    memory:
      "The current chapter is about building things with consequence: reinforcement learning sandboxes, agent-based economies, data pipelines, and AI that can stand up to real constraints.",
    mood: "ambitious",
    coordinates: { top: "31%", left: "47%" },
  },
]

export const locationData: Record<string, LocationDetails> = {
  vietnam: {
    title: "Vietnam - Foundations",
    description:
      "Vietnam is where economics, research, and lived policy questions first took shape. It remains the foundation for much of the work on energy, inequality, and public decision-making.",
  },
  china: {
    title: "China - Design and Perspective",
    description:
      "The Xi'an exchange added a design lens to technical work, reinforcing that systems gain value when they become legible, interactive, and human-facing.",
  },
  uk: {
    title: "United Kingdom - Research Direction",
    description:
      "Birmingham sharpened the long-term direction: reinforcement learning, sustainability, resource allocation, and AI systems that can help make institutions work more fairly and effectively.",
  },
}
