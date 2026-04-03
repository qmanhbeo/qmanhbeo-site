export interface TravelYear {
  year: string
  location: string
  title: string
  memory: string
  mood: string
  photos?: string[]
  coordinates: {
    top: string
    left: string
  }
  whatIDid?: string[]
  whatILearned?: string[]
  outcomes?: string[]
  themes?: string[]
}

interface LocationDetails {
  title: string
  description: string
}

export const getTravelYearKey = (journey: TravelYear) => `${journey.year}-${journey.location}-${journey.title}`

export const travelYears: TravelYear[] = [
  {
    year: "2021–2023",
    location: "Ho Chi Minh City, Vietnam",
    title: "Economics, Questions, and First Principles",
    memory:
      "At the University of Economics Ho Chi Minh City, economics became a way to ask sharper questions about how people, systems, and incentives shape the world. Research assistance and teaching support deepened the empirical work — turning methods into something explainable.",
    mood: "curious",
    photos: ["/img/map/UEH1.webp", "/img/map/UEH2.webp"],
    coordinates: { top: "67%", left: "78%" },
    whatIDid: [
      "Studied economics, statistics, and social science at UEH",
      "Assisted faculty research in energy forecasting and econometric modelling",
      "Supported teaching and worked as a tutor across undergraduate subjects",
    ],
    whatILearned: [
      "How empirical questions sharpen into researchable problems",
      "Decomposition and longitudinal methods for inequality analysis",
      "The best policy questions begin with people, not with available data",
    ],
    outcomes: [
      "UEH Young Researcher Award — First Prize (2024)",
      "Undergraduate research on youth psychology and family verbal violence",
      "Early foundation in energy economics and forecasting methods",
    ],
    themes: ["Economics", "Research Methods", "Energy", "Social Science", "Education"],
  },
  {
    year: "2024",
    location: "Ho Chi Minh City, Vietnam",
    title: "Energy, Policy, and Real-World Stakes",
    memory:
      "Work with EEPSEA made the stakes concrete: energy poverty, energy transition, and socioeconomic outcomes are not abstractions when policy meets everyday life. The gap between a model and a household is where research earns its purpose.",
    mood: "grounded",
    photos: ["/img/map/EEPSEA1.webp", "/img/map/EEPSEA2.webp"],
    coordinates: { top: "67%", left: "78%" },
    whatIDid: [
      "Research fellowship on energy economics with EEPSEA",
      "Investigated socioeconomic effects of renewable energy project delays",
      "Analysed urban-rural energy burden disparities across Vietnam",
    ],
    whatILearned: [
      "Energy transitions carry deeply unequal costs for ordinary households",
      "Policy timelines are not neutral — delays function as invisible taxes",
      "Empirical rigour must follow the question, not the data available",
    ],
    outcomes: [
      "ELG 2025 publication on renewable energy delays in Vietnam",
      "Working paper on longitudinal urban-rural energy burden disparities",
    ],
    themes: ["Energy Policy", "Vietnam", "Sustainability", "Socioeconomics", "Empirical Research"],
  },
  {
    year: "2025–2026",
    location: "Birmingham, United Kingdom",
    title: "AI for Sustainable Development",
    memory:
      "At Birmingham, reinforcement learning and sustainability stopped being separate interests. They became one line of work: resource allocation, public systems, and fairer decision-making under real constraints.",
    mood: "driven",
    photos: ["/img/map/Birmingham-20251.webp", "/img/map/Birmingham-20261.webp", "/img/map/Birmingham-20262.webp"],
    coordinates: { top: "31%", left: "47%" },
    whatIDid: [
      "MSc in AI and Sustainable Development at University of Birmingham",
      "Built reinforcement learning agents and simulations for resource-allocation research",
      "Constructed data pipelines for UK procurement and Vietnamese housing markets",
    ],
    whatILearned: [
      "RL is a tool for navigating constraints, not just optimising outcomes",
      "Agent-based models surface emergent behaviour that equations miss",
      "Sustainability is a systems problem — metrics alone cannot solve it",
    ],
    outcomes: [
      "GAIA: agent-based economic simulation for RL research (ongoing)",
      "Vietnam RL market sandbox with full market microstructure (ongoing)",
      "Multiple research pipelines and tools published publicly",
    ],
    themes: ["AI", "Reinforcement Learning", "Sustainability", "Birmingham", "Agent-Based Modelling"],
  },
]

export const locationData: Record<string, LocationDetails> = {
  vietnam: {
    title: "Vietnam - Foundations",
    description:
      "Vietnam is where economics, research, and lived policy questions first took shape. It remains the foundation for much of the work on energy, inequality, and public decision-making.",
  },
  uk: {
    title: "United Kingdom - Research Direction",
    description:
      "Birmingham sharpened the long-term direction: reinforcement learning, sustainability, resource allocation, and AI systems that can help make institutions work more fairly and effectively.",
  },
}
