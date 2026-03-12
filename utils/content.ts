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
    title: "Sustainable AI: Bridging Technology and Environmental Consciousness",
    journal: "Journal of Sustainable Computing",
    year: "2024",
    abstract:
      "An exploration of how artificial intelligence can be developed and deployed with environmental sustainability as a core principle, examining both the carbon footprint of AI systems and their potential for environmental solutions.",
    link: "#",
  },
  {
    title: "Economic Models in the Age of Digital Transformation",
    journal: "International Economic Review",
    year: "2023",
    abstract:
      "A comprehensive analysis of how traditional economic frameworks adapt to digital economies, with particular focus on platform economics and decentralized systems.",
    link: "#",
  },
  {
    title: "Philosophy of Code: Ethics in Algorithm Design",
    journal: "AI & Society",
    year: "2023",
    abstract:
      "Examining the philosophical implications of algorithmic decision-making and the ethical responsibilities of developers in shaping digital experiences that affect human lives.",
    link: "#",
  },
  {
    title: "Poetry in Data: Finding Human Stories in Digital Patterns",
    journal: "Digital Humanities Quarterly",
    year: "2022",
    abstract:
      "An interdisciplinary approach to data analysis that incorporates literary and poetic sensibilities to uncover deeper human narratives within quantitative research.",
    link: "#",
  },
]

export const projects: Project[] = [
  {
    title: "Enchanted Portfolio",
    description: "A magical showcase of creative works, built with mystical technologies and ancient wisdom.",
    tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    github: "#",
    demo: "#",
  },
  {
    title: "Tavern Management System",
    description: "A comprehensive system for managing medieval taverns, complete with inventory and guest tracking.",
    tech: ["React", "Node.js", "MongoDB", "Express"],
    github: "#",
    demo: "#",
  },
  {
    title: "Scroll of Knowledge",
    description: "An ancient library digitized, featuring search through countless tomes and manuscripts.",
    tech: ["Vue.js", "Python", "FastAPI", "PostgreSQL"],
    github: "#",
    demo: "#",
  },
  {
    title: "Crystal Ball Analytics",
    description: "Mystical data visualization platform that reveals hidden patterns in the digital realm.",
    tech: ["D3.js", "React", "Python", "TensorFlow"],
    github: "#",
    demo: "#",
  },
  {
    title: "Alchemist's Workshop",
    description: "A collaborative platform for transforming raw ideas into digital gold through iterative refinement.",
    tech: ["Svelte", "Rust", "WebAssembly", "GraphQL"],
    github: "#",
    demo: "#",
  },
  {
    title: "Dragon's Hoard Tracker",
    description: "Advanced asset management system with real-time monitoring and predictive analytics.",
    tech: ["Angular", "Spring Boot", "Kafka", "Redis"],
    github: "#",
    demo: "#",
  },
]

export const blogPosts: BlogPost[] = [
  {
    title: "Tales from the Code Forge",
    excerpt:
      "In the depths of the digital forge, where algorithms are hammered into shape and bugs are banished by the light of debugging flames...",
    date: "Winter Solstice, 2024",
    readTime: "5 min read",
  },
  {
    title: "The Wisdom of Ancient Algorithms",
    excerpt:
      "Long before modern frameworks, there existed algorithms of such elegance that they still guide our path through the labyrinth of computation...",
    date: "Harvest Moon, 2024",
    readTime: "8 min read",
  },
  {
    title: "Building Bridges Between Worlds",
    excerpt:
      "On connecting the digital realm with human experience, where empathy meets efficiency and stories bridge the gap between silicon and soul...",
    date: "Autumn Equinox, 2024",
    readTime: "6 min read",
  },
  {
    title: "The Art of Digital Storytelling",
    excerpt:
      "Every line of code tells a story, every function has a purpose, and every application carries the dreams of its creator into the world...",
    date: "Summer's End, 2024",
    readTime: "7 min read",
  },
  {
    title: "Wandering Through Data Forests",
    excerpt:
      "In the vast wilderness of information, patterns emerge like ancient paths through dense woods, leading to insights hidden in plain sight...",
    date: "Midsummer Night, 2024",
    readTime: "9 min read",
  },
  {
    title: "The Philosophy of Clean Code",
    excerpt:
      "Like a well-tended garden, code flourishes when given proper care, attention, and the wisdom to know when to prune and when to let grow...",
    date: "Spring Awakening, 2024",
    readTime: "4 min read",
  },
  {
    title: "Conversations with AI",
    excerpt:
      "In quiet moments between human and machine, profound dialogues emerge about consciousness, creativity, and the nature of intelligence itself...",
    date: "First Snow, 2024",
    readTime: "11 min read",
  },
  {
    title: "The Rhythm of Remote Work",
    excerpt:
      "Finding harmony in the dance between solitude and collaboration, where home becomes office and the world becomes your coworking space...",
    date: "Golden Hour, 2024",
    readTime: "6 min read",
  },
  {
    title: "Debugging Life's Mysteries",
    excerpt:
      "Sometimes the most complex problems have the simplest solutions, and the art of debugging extends far beyond the realm of code...",
    date: "Twilight Hour, 2024",
    readTime: "5 min read",
  },
  {
    title: "The Magic of Open Source",
    excerpt:
      "In the spirit of ancient guilds sharing knowledge, open source communities weave a tapestry of collaboration that spans the globe...",
    date: "Dawn's Light, 2024",
    readTime: "8 min read",
  },
]
