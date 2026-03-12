export interface Publication {
  title: string
  journal: string
  year: string
  abstract?: string
  link?: string
}

export interface Project {
  title: string
  description: string
  tech: string[]
  github?: string
  demo?: string
}

export interface BlogPost {
  title: string
  excerpt: string
  date: string
  readTime: string
}

export const publications: Publication[] = [
  {
    title: "Socioeconomic Effects of Delays in Renewable Energy Projects: Evidence from Vietnam",
    journal: "ELG 2025",
    year: "2025",
    abstract:
      "A paper on what happens when renewable energy arrives late: not just to grids and plans, but to households, local economies, and the wider promises attached to transition.",
  },
  {
    title: "Longitudinal Urban-Rural Energy Burden Disparities: A Decomposition Analysis of Vietnam",
    journal: "Working Paper",
    year: "2025",
    abstract:
      "A working paper tracing how the weight of energy costs falls unevenly across urban and rural households in Vietnam, and what those differences reveal about inequality over time.",
  },
  {
    title:
      "Verbal Violence within the Family as a Contributing Factor to the Emerging 'Snowflake Generation': A Case of Ho Chi Minh City's Youth",
    journal: "UEH Young Researcher Award 2024",
    year: "2024",
    abstract:
      "An award-winning undergraduate paper on how violence inside the home leaves traces in the social and psychological lives of young people.",
  },
]

export const projects: Project[] = [
  {
    title: "Vietnam Stock Reinforcement Learning Sandbox",
    description:
      "A trading sandbox built to feel less like a toy and more like a market, where reinforcement learning agents must live with costs, timing, settlement rules, and imperfect decisions.",
    tech: ["Reinforcement Learning", "PPO / RecurrentPPO", "LSTM / CNN", "Trading Simulation"],
  },
  {
    title: "GAIA: Agent-based Economic Simulation for Reinforcement Learning Decision Making",
    description:
      "An agent-based world of households, labour, food, water, and environmental limits, built as a place where resource-allocation policies can be tested against something closer to life.",
    tech: ["Agent-Based Modelling", "Simulation", "Reinforcement Learning", "Interactive Visualisation"],
  },
  {
    title: "Vietnamese Real Estate Data Pipeline",
    description:
      "A long haul through messy housing listings, where scraping, cleaning, imputation, and bilingual outputs turned scattered records into something usable.",
    tech: ["Web Scraping", "Data Cleaning", "Regex Parsing", "Exploratory Analysis"],
  },
  {
    title: "UK Public Procurement Data Collection and Analysis Pipeline",
    description:
      "A procurement data pipeline built from years of UK records, gathering scattered public traces into a form that policy questions can actually lean on.",
    tech: ["Public Data Collection", "Scraping", "Preprocessing", "Policy Analysis"],
  },
  {
    title: "Paths Untold: AI-Generated Interactive Story Game",
    description:
      "A story game where scenes are generated on the fly, memory lingers, emotions shift, and the world remembers enough to make choices feel like they matter.",
    tech: ["OpenAI API", "Narrative Systems", "State Tracking", "Save / Load"],
  },
  {
    title: "Arduino Robot for Environment Sensing and Learning",
    description:
      "A small embodied experiment in sensing and learning, beginning with humble lights and motors and reaching toward something that can adapt to its surroundings.",
    tech: ["Arduino", "Sensors", "Motor Control", "Embodied AI"],
  },
]

export const blogPosts: BlogPost[] = [
  {
    title: "Notes from a Vietnamese Market Sandbox",
    excerpt:
      "Building a market world for reinforcement learning meant teaching agents to live with delay, friction, transaction costs, taxes, and the ordinary consequences of acting too early or too late.",
    date: "Jan 2026 - Present",
    readTime: "Project note",
  },
  {
    title: "Building GAIA from the Ground Up",
    excerpt:
      "GAIA begins not with an algorithm, but with a world: households, labour, food, water, and constraints that push back when policy dreams get too simple.",
    date: "Apr 2025 - Present",
    readTime: "Research note",
  },
  {
    title: "What Procurement Records Whisper",
    excerpt:
      "Public procurement data rarely arrives in the shape analysis wants. This was the slow work of following raw links, gathering fragments, and persuading them into something coherent.",
    date: "Nov 2025",
    readTime: "Project note",
  },
  {
    title: "What 201K Housing Listings Taught Me",
    excerpt:
      "A large dataset is never just a large dataset. It is error handling, missing values, checkpoints, strange formats, and the discipline to keep cleaning until the picture stops lying.",
    date: "Mar 2025 - Sep 2025",
    readTime: "Data note",
  },
  {
    title: "On Stories that Remember You",
    excerpt:
      "Paths Untold was an experiment in making generated stories feel less disposable by giving them memory, emotional weather, and enough persistence for choices to leave a trace.",
    date: "Mar 2025 - Jul 2025",
    readTime: "Build note",
  },
  {
    title: "Energy Poverty and the Weight of Transition",
    excerpt:
      "EEPSEA sharpened a long-standing concern: transitions are never purely technical. They arrive unevenly, and someone always carries more of the burden than the policy memo admits.",
    date: "Oct 2024 - Present",
    readTime: "Research note",
  },
  {
    title: "What Birmingham Changed",
    excerpt:
      "The MSc in AI and Sustainable Development gave the work a clearer center of gravity: not AI for spectacle, but AI for allocation, trade-offs, and institutions that have to answer to the world.",
    date: "Sep 2025 - Present",
    readTime: "Study note",
  },
  {
    title: "Why Design Still Matters to Me",
    excerpt:
      "Xi'an was a useful reminder that even the most technical systems live or die by whether people can feel their shape, understand their rhythm, and meet them without friction.",
    date: "May 2025",
    readTime: "Field note",
  },
]
