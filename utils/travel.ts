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
  whomIMet?: string[]
  whatILearned?: string[]
  achieved?: string[]
  themes?: string[]
}

interface LocationDetails {
  title: string
  description: string
}

export const getTravelYearKey = (journey: TravelYear) => `${journey.year}-${journey.location}-${journey.title}`

export const travelYears: TravelYear[] = [
  {
    year: "2021-2023",
    location: "Ho Chi Minh City, Vietnam",
    title: "Economics, Questions, and First Principles",
    memory:
      "At the University of Economics Ho Chi Minh City, economics became a way to ask sharper questions about how people, systems, and incentives shape the world. Research assistance and teaching support deepened the empirical work - turning methods into something explainable.",
    mood: "curious",
    photos: ["/img/map/UEH1.webp", "/img/map/UEH2.webp"],
    coordinates: { top: "67%", left: "78%" },
    whatIDid: [
      "Studied economics, statistics, and social science at UEH",
      "Assisted faculty research in energy forecasting and econometric modelling",
      "Supported teaching and tutored undergraduate students across subjects",
    ],
    whomIMet: [
      "Professors who showed me economics is a way of seeing, not just a set of models",
      "Research peers who made empirical work feel like a shared project, not a solitary one",
      "Students I tutored who asked the questions I hadn't thought to ask yet",
    ],
    whatILearned: [
      "How empirical questions sharpen into researchable problems",
      "Decomposition and longitudinal methods for inequality analysis",
      "The best policy questions begin with people, not with available data",
    ],
    achieved: [
      "UEH Young Researcher Award - First Prize (2024)",
      "Undergraduate research on verbal violence and youth psychology",
      "A working foundation in energy economics and forecasting methods",
    ],
    themes: ["Economics", "Energy", "Social Systems", "Empirical Methods", "Policy"],
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
    whomIMet: [
      "Researchers who treated policy as something owed to real people, not just to models",
      "Colleagues who showed that fieldwork and econometrics could live in the same sentence",
      "Mentors who held the line between honesty and precision - and made me hold it too",
    ],
    whatILearned: [
      "Energy transitions carry deeply unequal costs for ordinary households",
      "Policy timelines are not neutral - delays function as invisible taxes",
      "Empirical rigour must follow the question, not the data available",
    ],
    achieved: [
      "ELG 2025 publication on renewable energy delays in Vietnam",
      "Working paper on longitudinal urban-rural energy burden disparities",
      "A sharpened conviction that research earns its purpose at the boundary of policy",
    ],
    themes: ["Energy Economics", "Policy Analysis", "Sustainability", "Vietnam", "Empirical Research"],
  },
  {
    year: "2025",
    location: "Xi'an, China",
    title: "Design Beyond the Spreadsheet",
    memory:
      "The summer exchange in interactive media design was a reminder that technical systems only matter if people can feel them, use them, and understand them. Xi'an sharpened the human-facing side of the work: rhythm, legibility, and the craft of making complex ideas easier to meet.",
    mood: "open-eyed",
    photos: ["/img/map/Xian1.webp", "/img/map/Xian2.webp", "/img/map/Xian3.webp"],
    coordinates: { top: "42%", left: "81%" },
    whatIDid: [
      "Joined a summer exchange in interactive media design in Xi'an",
      "Worked across visual communication, interface thinking, and presentation craft",
      "Revisited technical work through the lens of how people actually encounter it",
    ],
    whomIMet: [
      "Design-oriented peers who treated interaction as atmosphere and narrative, not just function",
      "Students from different backgrounds who made cross-cultural critique feel generous and precise",
      "Teachers who pushed me to explain ideas visually before defending them analytically",
    ],
    whatILearned: [
      "A system can be correct and still fail if people cannot read its shape",
      "Design is not decoration; it is how structure becomes legible",
      "Interfaces carry values through pacing, clarity, and what they invite people to do",
    ],
    achieved: [
      "A lasting design lens that still shapes how I build research tools and interfaces",
      "The field note that became 'Why Design Still Matters to Me'",
      "A stronger instinct to ask how a system feels, not only how it performs",
    ],
    themes: ["Design", "Interactive Media", "Human-Centered Systems", "Communication", "China"],
  },
  {
    year: "2025-2026",
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
    whomIMet: [
      "A cohort from across the world who brought different constraints to the same problem",
      "Advisors who pushed back on my assumptions before I even knew I had them",
      "Peers who made the work feel less like a degree and more like a shared inquiry into what's fair",
    ],
    whatILearned: [
      "RL is a tool for navigating constraints, not just optimising outcomes",
      "Agent-based models surface emergent behaviour that equations miss",
      "Sustainability is a systems problem - metrics alone cannot solve it",
    ],
    achieved: [
      "GAIA: agent-based economic simulation for RL research (ongoing)",
      "Vietnam RL market sandbox with full market microstructure (ongoing)",
      "Multiple research tools and pipelines made public",
    ],
    themes: ["AI", "Reinforcement Learning", "Sustainability", "Systems Thinking", "Agent-Based Modelling"],
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
      "Xi'an added a design lens to the technical work, reinforcing that systems gain value when they become legible, interactive, and human-facing.",
  },
  uk: {
    title: "United Kingdom - Research Direction",
    description:
      "Birmingham sharpened the long-term direction: reinforcement learning, sustainability, resource allocation, and AI systems that can help make institutions work more fairly and effectively.",
  },
}
