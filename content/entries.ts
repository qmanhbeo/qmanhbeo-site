export type EntryType = "arc" | "project" | "publication" | "note"

export interface EntryImage {
  src: string
  alt: string
}

export interface EntryLink {
  label: string
  href: string
  kind: "repository" | "demo" | "reference"
  showOnCard?: boolean
}

interface BaseEntry {
  slug: string
  type: EntryType
  title: string
  summary: string
  tags: string[]
  subtitle?: string
  yearLabel?: string
  location?: string
  status?: string
  dateLabel?: string
  mood?: string
  order: number
}

export interface ArcEntry extends BaseEntry {
  type: "arc"
  yearLabel: string
  location: string
  mood: string
  chapter: string
  images: EntryImage[]
  coordinates: {
    top: string
    left: string
  }
  whatIDid: string[]
  whomIMet: string[]
  whatILearned: string[]
  whatIAchieved: string[]
}

export interface ProjectEntry extends BaseEntry {
  type: "project"
  description: string
  detailSections: {
    label: string
    content: string
  }[]
  links: EntryLink[]
}

export interface PublicationEntry extends BaseEntry {
  type: "publication"
  journal: string
  yearLabel: string
  abstract: string
  researchQuestion: string
  methodology: string
  findings: string
  implications: string
  link?: EntryLink
}

export interface NoteEntry extends BaseEntry {
  type: "note"
  excerpt: string
  noteLabel: string
  body: string[]
}

export type ContentEntry = ArcEntry | ProjectEntry | PublicationEntry | NoteEntry

type EntryMap = {
  arc: ArcEntry
  project: ProjectEntry
  publication: PublicationEntry
  note: NoteEntry
}

const entries: ContentEntry[] = [
  {
    slug: "paper-renewable-delay-vietnam",
    type: "publication",
    order: 1,
    title: "Socioeconomic Effects of Delays in Renewable Energy Projects: Evidence from Vietnam",
    subtitle: "Energy and livelihoods at the edge of transition timelines",
    journal: "ELG 2025",
    yearLabel: "2025",
    status: "Published",
    summary:
      "A study of how renewable energy delays ripple outward, turning project timelines into lived socioeconomic costs for Vietnamese households and communities.",
    abstract:
      "A paper on what happens when renewable energy arrives late: not just to grids and plans, but to households, local economies, and the wider promises attached to transition.",
    researchQuestion:
      "What are the downstream socioeconomic consequences when renewable energy projects arrive late to communities and households in Vietnam?",
    methodology:
      "Empirical analysis of project-level delay data alongside household income, employment, and energy access records from Vietnamese provincial datasets.",
    findings:
      "Delayed projects correlate with prolonged energy poverty, foregone local employment, and eroded public trust in the transition - costs that aggregate modelling rarely captures.",
    implications:
      "Transition timelines are not neutral. Scheduling failures function as an invisible tax on the communities meant to benefit most from the shift to renewables.",
    tags: ["Energy Transition", "Renewable Delay", "Vietnam", "Socioeconomics", "Policy"],
  },
  {
    slug: "paper-urban-rural-energy-burden-vietnam",
    type: "publication",
    order: 2,
    title: "Longitudinal Urban-Rural Energy Burden Disparities: A Decomposition Analysis of Vietnam",
    subtitle: "Tracing who carries the cost of energy over time",
    journal: "Working Paper",
    yearLabel: "2025",
    status: "Working Paper",
    summary:
      "A longitudinal view of how energy burdens diverge across urban and rural households, and what that reveals about structural inequality in Vietnam.",
    abstract:
      "A working paper tracing how the weight of energy costs falls unevenly across urban and rural households in Vietnam, and what those differences reveal about inequality over time.",
    researchQuestion:
      "How has the relative weight of energy costs shifted between urban and rural households in Vietnam, and what structural factors drive the divergence?",
    methodology:
      "Decomposition analysis applied to multi-year household expenditure surveys, separating price effects, consumption patterns, and income gradients across regions.",
    findings:
      "Rural households consistently devote a higher share of income to energy, and the gap has widened as urban infrastructure improvements outpace rural electrification quality.",
    implications:
      "Energy affordability policy that ignores geography will systematically undercount who carries the burden of the low-carbon transition.",
    tags: ["Energy Burden", "Urban-Rural Inequality", "Vietnam", "Decomposition", "Longitudinal"],
  },
  {
    slug: "paper-snowflake-generation-youth",
    type: "publication",
    order: 3,
    title:
      "Verbal Violence within the Family as a Contributing Factor to the Emerging 'Snowflake Generation': A Case of Ho Chi Minh City's Youth",
    subtitle: "A study of psychological fragility shaped inside the household",
    journal: "UEH Young Researcher Award 2024",
    yearLabel: "2024",
    status: "Award - First Prize",
    summary:
      "An undergraduate paper examining how verbal violence at home shapes resilience, anxiety, and social behavior among young people in Ho Chi Minh City.",
    abstract:
      "An award-winning undergraduate paper on how violence inside the home leaves traces in the social and psychological lives of young people.",
    researchQuestion:
      "To what extent does verbal violence in the domestic environment contribute to the psychological fragility observed in Ho Chi Minh City's younger generation?",
    methodology:
      "Primary survey research with youth respondents in Ho Chi Minh City, combined with validated psychological scale instruments and regression modelling.",
    findings:
      "Verbal hostility at home is a statistically significant predictor of reduced resilience, heightened social anxiety, and conflict avoidance in youth - effects that compound over time.",
    implications:
      "Interventions targeting youth wellbeing cannot stop at the school gate. The household is a formative institution for psychological capital that policy rarely reaches.",
    tags: ["Youth Psychology", "Domestic Violence", "Resilience", "Vietnam", "Sociology"],
  },
  {
    slug: "project-vn-stock-rl-sandbox",
    type: "project",
    order: 1,
    title: "Vietnam Stock Reinforcement Learning Sandbox",
    subtitle: "A market world where agents must live with friction and timing",
    dateLabel: "Jan 2026 - Present",
    status: "In Progress",
    summary:
      "A trading sandbox built to feel less like a toy and more like a market, where reinforcement learning agents must live with costs, timing, settlement rules, and imperfect decisions.",
    description:
      "This project turns the Vietnamese market into an environment where reinforcement learning agents have to contend with delay, liquidity friction, transaction costs, and the practical messiness that cleaner benchmarks often smooth away.",
    detailSections: [
      {
        label: "Why Build It",
        content:
          "Most RL trading demos flatten the market until success becomes a function of unrealistic assumptions. This sandbox was built to reintroduce the parts of the world that usually get removed: waiting, penalties, timing mistakes, and microstructure that pushes back.",
      },
      {
        label: "System Shape",
        content:
          "The environment combines PPO and recurrent PPO experiments with sequence-aware models, rule-driven execution constraints, and market mechanics tuned to Vietnamese trading realities rather than generic global defaults.",
      },
      {
        label: "What It Supports",
        content:
          "The sandbox is designed as a research surface for studying policy, strategy, and behavior under non-ideal conditions, not just a benchmark for headline returns.",
      },
    ],
    links: [
      {
        label: "Alpha-learning momentum model",
        href: "https://github.com/qmanhbeo/VN-market-momentum-analysis",
        kind: "reference",
      },
    ],
    tags: ["Reinforcement Learning", "PPO / RecurrentPPO", "LSTM / CNN", "Trading Simulation"],
  },
  {
    slug: "project-gaia",
    type: "project",
    order: 2,
    title: "GAIA: Agent-based Economic Simulation for Reinforcement Learning Decision Making",
    subtitle: "Households, labor, food, water, and policy in one living system",
    dateLabel: "Apr 2025 - Present",
    status: "In Progress",
    summary:
      "An agent-based world of households, labour, food, water, and environmental limits, built as a place where resource-allocation policies can be tested against something closer to life.",
    description:
      "GAIA is a simulated economy where reinforcement learning is forced to negotiate with households, scarcity, and environmental constraints rather than abstract reward surfaces detached from lived systems.",
    detailSections: [
      {
        label: "Core Premise",
        content:
          "The project starts from the belief that allocation problems should be tested in worlds with interdependence, trade-offs, and delayed consequences. GAIA turns those interactions into a simulation that can be probed, stressed, and revised.",
      },
      {
        label: "How It Works",
        content:
          "Households, labor, consumption, ecological limits, and policy choices are represented as connected agents and state transitions so emergent behavior can surface before any claim of optimization is taken seriously.",
      },
      {
        label: "Research Use",
        content:
          "GAIA is meant to support experiments on fairer resource allocation, policy stress-testing, and decision-making under ecological and institutional constraints.",
      },
    ],
    links: [
      {
        label: "Grimoire",
        href: "https://github.com/qmanhbeo/gaia-ecogrid",
        kind: "repository",
        showOnCard: true,
      },
    ],
    tags: ["Agent-Based Modelling", "Simulation", "Reinforcement Learning", "Interactive Visualisation"],
  },
  {
    slug: "project-vn-real-estate-pipeline",
    type: "project",
    order: 3,
    title: "Vietnamese Real Estate Data Pipeline",
    subtitle: "Cleaning scattered listings into something analysis can trust",
    dateLabel: "Mar 2025 - Sep 2025",
    status: "Completed",
    summary:
      "A long haul through messy housing listings, where scraping, cleaning, imputation, and bilingual outputs turned scattered records into something usable.",
    description:
      "This pipeline was built to pull Vietnamese housing listings out of inconsistent formats and into an analysis-ready dataset that could withstand actual inspection instead of only passing through a notebook once.",
    detailSections: [
      {
        label: "Collection Work",
        content:
          "The project gathered large volumes of listing data from fragmented sources, then tracked fields across inconsistent templates, formatting conventions, and duplicate records.",
      },
      {
        label: "Data Repair",
        content:
          "Regex parsing, cleaning, missing-value handling, and bilingual normalization turned noisy raw text into a pipeline that could support exploratory analysis without immediately collapsing under edge cases.",
      },
      {
        label: "Outcome",
        content:
          "What began as scattered market traces became a stable base for understanding patterns in price, geography, and listing behavior at scale.",
      },
    ],
    links: [
      {
        label: "Grimoire",
        href: "https://github.com/qmanhbeo/VN-real-estate-scraper",
        kind: "repository",
        showOnCard: true,
      },
    ],
    tags: ["Web Scraping", "Data Cleaning", "Regex Parsing", "Exploratory Analysis"],
  },
  {
    slug: "project-uk-procurement-pipeline",
    type: "project",
    order: 4,
    title: "UK Public Procurement Data Collection and Analysis Pipeline",
    subtitle: "Following public records until they become policy-ready evidence",
    dateLabel: "Nov 2025",
    status: "Active Analysis",
    summary:
      "A procurement data pipeline built from years of UK records, gathering scattered public traces into a form that policy questions can actually lean on.",
    description:
      "This project follows procurement records across messy public sources and stitches them into a cleaner analytical surface so public spending can be examined as a system rather than as isolated files.",
    detailSections: [
      {
        label: "Problem",
        content:
          "Procurement data is public, but rarely structured for real use. The friction lives in the links, formats, and inconsistent metadata that make systematic analysis harder than it should be.",
      },
      {
        label: "Pipeline Design",
        content:
          "Collection, preprocessing, and schema repair were built to handle long time spans, scattered publication practices, and the need to preserve enough provenance for policy work.",
      },
      {
        label: "Why It Matters",
        content:
          "Once gathered coherently, the records become a way to ask better questions about institutions, allocation, and how public decisions leave administrative traces.",
      },
    ],
    links: [
      {
        label: "Grimoire",
        href: "https://github.com/qmanhbeo/uk-procurement-data-pipeline",
        kind: "repository",
        showOnCard: true,
      },
    ],
    tags: ["Public Data Collection", "Scraping", "Preprocessing", "Policy Analysis"],
  },
  {
    slug: "project-paths-untold",
    type: "project",
    order: 5,
    title: "Paths Untold: AI-Generated Interactive Story Game",
    subtitle: "Generated scenes with memory, persistence, and emotional weather",
    dateLabel: "Mar 2025 - Jul 2025",
    status: "Prototype",
    summary:
      "A story game where scenes are generated on the fly, memory lingers, emotions shift, and the world remembers enough to make choices feel like they matter.",
    description:
      "Paths Untold explores what interactive fiction becomes when generated scenes are anchored by memory, emotional state, and enough continuity for the player to feel that the world has actually noticed them.",
    detailSections: [
      {
        label: "Narrative Goal",
        content:
          "The project set out to make AI-generated storytelling feel less disposable by preserving state, tone, and consequences across scenes instead of resetting after each prompt.",
      },
      {
        label: "Technical Shape",
        content:
          "OpenAI-powered generation, state tracking, and save-load flows were combined so narrative branches could carry forward character context and emotional residue.",
      },
      {
        label: "What It Tested",
        content:
          "More than a game, it was a design experiment in whether generative systems can sustain continuity well enough for players to invest in their choices.",
      },
    ],
    links: [
      {
        label: "Grimoire",
        href: "https://github.com/qmanhbeo/paths-untold",
        kind: "repository",
        showOnCard: true,
      },
    ],
    tags: ["OpenAI API", "Narrative Systems", "State Tracking", "Save / Load"],
  },
  {
    slug: "project-arduino-environment-robot",
    type: "project",
    order: 6,
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
  },
  {
    slug: "note-market-sandbox",
    type: "note",
    order: 1,
    title: "Notes from a Vietnamese Market Sandbox",
    subtitle: "Why trading agents should have to live with friction",
    dateLabel: "Jan 2026 - Present",
    noteLabel: "Project note",
    summary:
      "Building a market world for reinforcement learning meant designing delay, friction, taxes, and other consequences back into the system.",
    excerpt:
      "Building a market world for reinforcement learning meant teaching agents to live with delay, friction, transaction costs, taxes, and the ordinary consequences of acting too early or too late.",
    body: [
      "The market sandbox became interesting only when it stopped behaving like a laboratory vacuum. Delay, taxes, settlement, and imperfect execution turned out to be the parts that gave the environment moral and strategic texture.",
      "A cleaner benchmark can make an agent look impressive very quickly. A rougher market asks a more useful question: what survives once the world starts charging for every confident mistake?",
      "That shift is why the sandbox matters to me. It is not just about better trading behavior. It is about building environments where learning has to negotiate with reality instead of floating above it.",
    ],
    tags: ["Reinforcement Learning", "Markets", "Simulation", "Vietnam"],
  },
  {
    slug: "note-building-gaia",
    type: "note",
    order: 2,
    title: "Building GAIA from the Ground Up",
    subtitle: "Starting with a world before starting with a policy",
    dateLabel: "Apr 2025 - Present",
    noteLabel: "Research note",
    summary:
      "GAIA begins not with an algorithm, but with a world where households, labor, food, and water all push back on neat policy dreams.",
    excerpt:
      "GAIA begins not with an algorithm, but with a world: households, labour, food, water, and constraints that push back when policy dreams get too simple.",
    body: [
      "I wanted a simulation where policy ideas had to answer to households, scarcity, and the possibility of unintended consequences. That meant starting with a world and its constraints before worrying about any optimizing agent.",
      "GAIA is still taking shape, but the guiding rule is stable: systems should reveal trade-offs instead of hiding them behind elegant abstractions.",
      "The work keeps returning me to the same conviction. Allocation problems become more interesting, and more honest, when they are tested against interdependence rather than isolated metrics.",
    ],
    tags: ["GAIA", "Agent-Based Modelling", "Resource Allocation", "Simulation"],
  },
  {
    slug: "note-procurement-records-whisper",
    type: "note",
    order: 3,
    title: "What Procurement Records Whisper",
    subtitle: "Following public links until they become evidence",
    dateLabel: "Nov 2025",
    noteLabel: "Project note",
    summary:
      "Procurement records rarely arrive analysis-ready; the real work is gathering fragments, tracking provenance, and persuading them into coherence.",
    excerpt:
      "Public procurement data rarely arrives in the shape analysis wants. This was the slow work of following raw links, gathering fragments, and persuading them into something coherent.",
    body: [
      "Public data is often treated as if availability were the same thing as usability. Procurement records taught me the opposite. The documents existed, but the structure needed for analysis had to be built by hand.",
      "Most of the effort went into following links, checking context, and preserving enough provenance for later questions to remain answerable.",
      "What emerged was less a dataset dropped from above than a record of patient assembly. That process is part of the result, not a prelude to it.",
    ],
    tags: ["Procurement", "Public Records", "Data Collection", "Policy"],
  },
  {
    slug: "note-housing-listings-taught-me",
    type: "note",
    order: 4,
    title: "What 201K Housing Listings Taught Me",
    subtitle: "Large datasets are really collections of small lies to fix",
    dateLabel: "Mar 2025 - Sep 2025",
    noteLabel: "Data note",
    summary:
      "A large dataset is rarely just scale. It is error handling, strange formats, missing values, and the discipline to keep cleaning until the picture stops lying.",
    excerpt:
      "A large dataset is never just a large dataset. It is error handling, missing values, checkpoints, strange formats, and the discipline to keep cleaning until the picture stops lying.",
    body: [
      "The housing pipeline reinforced a simple lesson: size does not create clarity. It amplifies every weakness in the collection and cleaning process until the errors begin to look like patterns.",
      "The work was slow because trust had to be earned row by row through parsing, normalization, and decisions about what should and should not be repaired automatically.",
      "That discipline is what made the final dataset useful. Not the raw count, but the refusal to pretend that messy inputs were already telling the truth.",
    ],
    tags: ["Real Estate", "Data Cleaning", "Listings", "Analysis"],
  },
  {
    slug: "note-stories-that-remember-you",
    type: "note",
    order: 5,
    title: "On Stories that Remember You",
    subtitle: "Why generative narratives need continuity to matter",
    dateLabel: "Mar 2025 - Jul 2025",
    noteLabel: "Build note",
    summary:
      "Paths Untold explored how generated stories change once memory, emotional state, and continuity are allowed to linger between scenes.",
    excerpt:
      "Paths Untold was an experiment in making generated stories feel less disposable by giving them memory, emotional weather, and enough persistence for choices to leave a trace.",
    body: [
      "The problem with many generated stories is not their imagination but their forgetfulness. Every scene can sound fresh while still making the last one feel irrelevant.",
      "Paths Untold was my attempt to resist that disposable quality by giving scenes memory, state, and emotional residue.",
      "Once the system remembers enough, player choice starts to feel less like prompt steering and more like participation in a world that keeps score.",
    ],
    tags: ["Narrative Systems", "Generative Storytelling", "Memory", "Game Design"],
  },
  {
    slug: "note-energy-poverty-transition",
    type: "note",
    order: 6,
    title: "Energy Poverty and the Weight of Transition",
    subtitle: "Why transitions are never purely technical",
    dateLabel: "Oct 2024 - Present",
    noteLabel: "Research note",
    summary:
      "EEPSEA sharpened a long-standing concern: transitions arrive unevenly, and someone always carries more of the burden than policy language admits.",
    excerpt:
      "EEPSEA sharpened a long-standing concern: transitions are never purely technical. They arrive unevenly, and someone always carries more of the burden than the policy memo admits.",
    body: [
      "The deeper I worked on energy questions, the harder it became to treat transition as an engineering timeline alone. Every delay and every affordability gap had a distribution behind it.",
      "EEPSEA made that distribution visible in a way that changed the direction of my research. Households and communities were not background context. They were the reason the question mattered.",
      "That conviction still anchors the work now. A transition is only as just as the burdens it asks different people to bear.",
    ],
    tags: ["Energy Poverty", "Transition", "Policy", "Vietnam"],
  },
  {
    slug: "note-what-birmingham-changed",
    type: "note",
    order: 7,
    title: "What Birmingham Changed",
    subtitle: "From spectacle-driven AI to systems that answer to constraints",
    dateLabel: "Sep 2025 - Present",
    noteLabel: "Study note",
    summary:
      "The MSc in AI and Sustainable Development brought AI, allocation, and institutional responsibility into the same frame.",
    excerpt:
      "The MSc in AI and Sustainable Development gave the work a clearer center of gravity: not AI for spectacle, but AI for allocation, trade-offs, and institutions that have to answer to the world.",
    body: [
      "Birmingham clarified the kind of AI work I want to keep doing. Not systems built for display, but systems asked to reason under constraints that have social and environmental consequences.",
      "The course, the people, and the surrounding conversations made sustainability feel less like a separate interest and more like the setting within which technical choices should be judged.",
      "That reorientation keeps showing up in the projects: allocation, fairness, institutions, and the question of what an intelligent system owes the world it acts inside.",
    ],
    tags: ["Birmingham", "AI", "Sustainability", "Institutions"],
  },
  {
    slug: "note-design-still-matters",
    type: "note",
    order: 8,
    title: "Why Design Still Matters to Me",
    subtitle: "Xi'an and the reminder that systems must be legible",
    dateLabel: "May 2025",
    noteLabel: "Field note",
    summary:
      "Xi'an was a reminder that even the most technical systems live or die by whether people can feel their shape, understand their rhythm, and meet them without friction.",
    excerpt:
      "Xi'an was a useful reminder that even the most technical systems live or die by whether people can feel their shape, understand their rhythm, and meet them without friction.",
    body: [
      "The exchange in Xi'an sharpened something I had been circling for a while: correct systems still fail when they remain unreadable to the people who need to use them.",
      "Design, in that sense, is not surface polish. It is how structure becomes legible, how rhythm enters an interface, and how complexity is turned into something another person can actually meet.",
      "That lesson followed me back into technical work. It changed how I think about research tools, websites, and any system that wants to be used rather than merely admired.",
    ],
    tags: ["Design", "Xi'an", "Interfaces", "Human-Centered Systems"],
  },
  {
    slug: "arc-ho-chi-minh-city-foundations",
    type: "arc",
    order: 1,
    title: "Economics, Questions, and First Principles",
    subtitle: "Foundations in research, teaching, and economic thinking",
    yearLabel: "2021-2023",
    location: "Ho Chi Minh City, Vietnam",
    mood: "curious",
    summary:
      "At UEH, economics became a way to ask sharper questions about people, systems, and incentives rather than just a set of models to memorize.",
    chapter:
      "At the University of Economics Ho Chi Minh City, economics became a way to ask sharper questions about how people, systems, and incentives shape the world. Research assistance and teaching support deepened the empirical work - turning methods into something explainable.",
    images: [
      {
        src: "/img/map/UEH1.webp",
        alt: "University of Economics Ho Chi Minh City memory one",
      },
      {
        src: "/img/map/UEH2.webp",
        alt: "University of Economics Ho Chi Minh City memory two",
      },
    ],
    coordinates: { top: "67%", left: "78%" },
    whatIDid: [
      "Studied economics, statistics, and social science at UEH",
      "Assisted faculty research in energy forecasting and econometric modelling",
      "Supported teaching and tutored undergraduate students across subjects",
    ],
    whomIMet: [
      "Professors who showed me economics is a way of seeing, not just a set of models",
      "Research peers who made empirical work feel like a shared project, not a solitary one",
      "Students I tutored who asked the questions I had not thought to ask yet",
    ],
    whatILearned: [
      "How empirical questions sharpen into researchable problems",
      "Decomposition and longitudinal methods for inequality analysis",
      "The best policy questions begin with people, not with available data",
    ],
    whatIAchieved: [
      "UEH Young Researcher Award - First Prize (2024)",
      "Undergraduate research on verbal violence and youth psychology",
      "A working foundation in energy economics and forecasting methods",
    ],
    tags: ["Economics", "Energy", "Social Systems", "Empirical Methods", "Policy"],
  },
  {
    slug: "arc-eepsea-energy-policy",
    type: "arc",
    order: 2,
    title: "Energy, Policy, and Real-World Stakes",
    subtitle: "Research where timelines, households, and policy collide",
    yearLabel: "2024",
    location: "Ho Chi Minh City, Vietnam",
    mood: "grounded",
    summary:
      "EEPSEA made the stakes of energy research concrete by keeping households, inequality, and delayed policy promises firmly in view.",
    chapter:
      "Work with EEPSEA made the stakes concrete: energy poverty, energy transition, and socioeconomic outcomes are not abstractions when policy meets everyday life. The gap between a model and a household is where research earns its purpose.",
    images: [
      {
        src: "/img/map/EEPSEA1.webp",
        alt: "EEPSEA research memory one",
      },
      {
        src: "/img/map/EEPSEA2.webp",
        alt: "EEPSEA research memory two",
      },
    ],
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
    whatIAchieved: [
      "ELG 2025 publication on renewable energy delays in Vietnam",
      "Working paper on longitudinal urban-rural energy burden disparities",
      "A sharpened conviction that research earns its purpose at the boundary of policy",
    ],
    tags: ["Energy Economics", "Policy Analysis", "Sustainability", "Vietnam", "Empirical Research"],
  },
  {
    slug: "arc-xian-design-lens",
    type: "arc",
    order: 3,
    title: "Design Beyond the Spreadsheet",
    subtitle: "Learning how technical systems become legible to people",
    yearLabel: "2025",
    location: "Xi'an, China",
    mood: "open-eyed",
    summary:
      "The Xi'an exchange reframed design as structure and legibility rather than decoration, and pushed technical work toward the human-facing side of systems.",
    chapter:
      "The summer exchange in interactive media design was a reminder that technical systems only matter if people can feel them, use them, and understand them. Xi'an sharpened the human-facing side of the work: rhythm, legibility, and the craft of making complex ideas easier to meet.",
    images: [
      {
        src: "/img/map/Xian1.webp",
        alt: "Xi'an exchange memory one",
      },
      {
        src: "/img/map/Xian2.webp",
        alt: "Xi'an exchange memory two",
      },
      {
        src: "/img/map/Xian3.webp",
        alt: "Xi'an exchange memory three",
      },
    ],
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
    whatIAchieved: [
      "A lasting design lens that still shapes how I build research tools and interfaces",
      "The field note that became 'Why Design Still Matters to Me'",
      "A stronger instinct to ask how a system feels, not only how it performs",
    ],
    tags: ["Design", "Interactive Media", "Human-Centered Systems", "Communication", "China"],
  },
  {
    slug: "arc-birmingham-ai-sustainability",
    type: "arc",
    order: 4,
    title: "AI for Sustainable Development",
    subtitle: "Where reinforcement learning and sustainability converged",
    yearLabel: "2025-2026",
    location: "Birmingham, United Kingdom",
    mood: "driven",
    summary:
      "Birmingham brought reinforcement learning, public systems, and sustainability into the same line of work: allocation under real constraints.",
    chapter:
      "At Birmingham, reinforcement learning and sustainability stopped being separate interests. They became one line of work: resource allocation, public systems, and fairer decision-making under real constraints.",
    images: [
      {
        src: "/img/map/Birmingham-20251.webp",
        alt: "Birmingham memory one",
      },
      {
        src: "/img/map/Birmingham-20261.webp",
        alt: "Birmingham memory two",
      },
      {
        src: "/img/map/Birmingham-20262.webp",
        alt: "Birmingham memory three",
      },
    ],
    coordinates: { top: "31%", left: "47%" },
    whatIDid: [
      "MSc in AI and Sustainable Development at University of Birmingham",
      "Built reinforcement learning agents and simulations for resource-allocation research",
      "Constructed data pipelines for UK procurement and Vietnamese housing markets",
    ],
    whomIMet: [
      "A cohort from across the world who brought different constraints to the same problem",
      "Advisors who pushed back on my assumptions before I even knew I had them",
      "Peers who made the work feel less like a degree and more like a shared inquiry into what is fair",
    ],
    whatILearned: [
      "RL is a tool for navigating constraints, not just optimising outcomes",
      "Agent-based models surface emergent behaviour that equations miss",
      "Sustainability is a systems problem - metrics alone cannot solve it",
    ],
    whatIAchieved: [
      "GAIA: agent-based economic simulation for RL research (ongoing)",
      "Vietnam RL market sandbox with full market microstructure (ongoing)",
      "Multiple research tools and pipelines made public",
    ],
    tags: ["AI", "Reinforcement Learning", "Sustainability", "Systems Thinking", "Agent-Based Modelling"],
  },
]

const archiveTypeOrder: Record<EntryType, number> = {
  publication: 0,
  project: 1,
  note: 2,
  arc: 3,
}

const allEntries = [...entries].sort((left, right) => {
  const typeDelta = archiveTypeOrder[left.type] - archiveTypeOrder[right.type]
  if (typeDelta !== 0) return typeDelta
  return left.order - right.order
})

const entriesBySlug = new Map(allEntries.map((entry) => [entry.slug, entry]))

const typeLabels: Record<EntryType, { kind: string; collection: string; previewHeading: string }> = {
  arc: {
    kind: "Journey",
    collection: "Wanderer's Map",
    previewHeading: "Journey Notes",
  },
  project: {
    kind: "Spell Scroll",
    collection: "Spell Scrolls",
    previewHeading: "Spell Summary",
  },
  publication: {
    kind: "Publication",
    collection: "Scholar Scrolls",
    previewHeading: "Abstract",
  },
  note: {
    kind: "Campfire Note",
    collection: "Campfire Notes",
    previewHeading: "Note Preview",
  },
}

export function isArcEntry(entry: ContentEntry): entry is ArcEntry {
  return entry.type === "arc"
}

export function isProjectEntry(entry: ContentEntry): entry is ProjectEntry {
  return entry.type === "project"
}

export function isPublicationEntry(entry: ContentEntry): entry is PublicationEntry {
  return entry.type === "publication"
}

export function isNoteEntry(entry: ContentEntry): entry is NoteEntry {
  return entry.type === "note"
}

const entriesByType = {
  arc: allEntries.filter(isArcEntry),
  project: allEntries.filter(isProjectEntry),
  publication: allEntries.filter(isPublicationEntry),
  note: allEntries.filter(isNoteEntry),
} satisfies { [K in EntryType]: EntryMap[K][] }

export const arcEntries = entriesByType.arc
export const projectEntries = entriesByType.project
export const publicationEntries = entriesByType.publication
export const noteEntries = entriesByType.note

export function getAllEntries() {
  return allEntries
}

export function getEntriesByType<T extends EntryType>(type: T): EntryMap[T][] {
  return entriesByType[type] as EntryMap[T][]
}

export function getEntryBySlug(slug: string) {
  return entriesBySlug.get(slug)
}

export function getEntryKindLabel(entry: ContentEntry) {
  return typeLabels[entry.type].kind
}

export function getEntryCollectionLabel(entry: ContentEntry) {
  return typeLabels[entry.type].collection
}

export function getEntryPreviewHeading(entry: ContentEntry) {
  return typeLabels[entry.type].previewHeading
}

export function getEntryPeriodLabel(entry: ContentEntry) {
  if (entry.type === "publication") return `Anno Domini ${entry.yearLabel}`
  return entry.dateLabel ?? entry.yearLabel ?? entry.status ?? "Undated"
}

export function getEntryPreviewText(entry: ContentEntry) {
  switch (entry.type) {
    case "arc":
      return entry.chapter
    case "project":
      return entry.description
    case "publication":
      return entry.abstract
    case "note":
      return entry.excerpt
  }
}

function getEntrySearchText(entry: ContentEntry) {
  switch (entry.type) {
    case "arc":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.chapter,
        entry.location,
        entry.yearLabel,
        entry.mood,
        entry.tags.join(" "),
        entry.whatIDid.join(" "),
        entry.whomIMet.join(" "),
        entry.whatILearned.join(" "),
        entry.whatIAchieved.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    case "project":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.description,
        entry.status,
        entry.dateLabel,
        entry.tags.join(" "),
        entry.detailSections.map((section) => `${section.label} ${section.content}`).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    case "publication":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.abstract,
        entry.journal,
        entry.yearLabel,
        entry.status,
        entry.tags.join(" "),
        entry.researchQuestion,
        entry.methodology,
        entry.findings,
        entry.implications,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    case "note":
      return [
        entry.title,
        entry.subtitle,
        entry.summary,
        entry.excerpt,
        entry.noteLabel,
        entry.dateLabel,
        entry.tags.join(" "),
        entry.body.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
  }
}

export function searchEntries(query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery === "") return allEntries
  return allEntries.filter((entry) => getEntrySearchText(entry).includes(normalizedQuery))
}
