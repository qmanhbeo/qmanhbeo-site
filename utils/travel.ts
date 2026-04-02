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
      "At the University of Economics Ho Chi Minh City, economics became a way to ask sharper questions about how people, systems, and incentives shape the world we live in. Research assistance and teaching support deepened the empirical work — energy forecasting, turning methods into something explainable.",
    mood: "curious",
    photos: ["/img/map/UEH1.webp", "/img/map/UEH2.webp"],
    coordinates: { top: "67%", left: "78%" },
  },
  {
    year: "2024",
    location: "Ho Chi Minh City, Vietnam",
    title: "Energy, Policy, and Real-World Stakes",
    memory:
      "Work with EEPSEA made the stakes concrete: energy poverty, energy transition, and socioeconomic outcomes are not abstractions when policy meets everyday life.",
    mood: "grounded",
    photos: ["/img/map/EEPSEA1.webp", "/img/map/EEPSEA2.webp"],
    coordinates: { top: "67%", left: "78%" },
  },
  {
    year: "2025–2026",
    location: "Birmingham, United Kingdom",
    title: "AI for Sustainable Development",
    memory:
      "At Birmingham, reinforcement learning and sustainability stopped being separate interests. They became one line of work: resource allocation, public systems, and fairer decision making under real constraints.",
    mood: "driven",
    photos: ["/img/map/Birmingham-20251.webp", "/img/map/Birmingham-20261.webp", "/img/map/Birmingham-20262.webp"],
    coordinates: { top: "31%", left: "47%" },
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
