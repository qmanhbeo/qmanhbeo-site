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

export const travelYears: TravelYear[] = [
  {
    year: "2019",
    location: "Hanoi, Vietnam",
    title: "Where Rivers Meet Dreams",
    memory:
      "In the narrow streets where motorbikes dance like fireflies, I discovered that home is not a place but a feeling, with warm pho steam rising like incense and carrying prayers of belonging.",
    mood: "nostalgic",
    coordinates: { top: "45%", left: "75%" },
  },
  {
    year: "2020",
    location: "San Francisco, USA",
    title: "Silicon Valley Solitude",
    memory:
      "Among the fog-kissed hills and endless code, I learned that innovation blooms not from competition, but from the quiet moments when curiosity meets compassion.",
    mood: "contemplative",
    coordinates: { top: "35%", left: "15%" },
  },
  {
    year: "2021",
    location: "Amsterdam, Netherlands",
    title: "Canals of Reflection",
    memory:
      "Cycling through centuries-old canals, I understood that the most beautiful journeys are not linear. They wind, they pause, and they reflect the sky above.",
    mood: "serene",
    coordinates: { top: "25%", left: "52%" },
  },
  {
    year: "2022",
    location: "Paris, France",
    title: "City of Lights and Letters",
    memory:
      "In cafes where philosophers once dreamed, I wrote my first lines of code that felt like poetry. Each function was a verse, and each algorithm was a story waiting to unfold.",
    mood: "inspired",
    coordinates: { top: "28%", left: "50%" },
  },
  {
    year: "2023",
    location: "Kyoto, Japan",
    title: "Temple of Digital Zen",
    memory:
      "Walking through bamboo forests and ancient temples, I discovered that the most advanced technology is often the simplest, like the way morning light filters through leaves.",
    mood: "enlightened",
    coordinates: { top: "40%", left: "85%" },
  },
  {
    year: "2024",
    location: "Reykjavik, Iceland",
    title: "Northern Lights and Code",
    memory:
      "Under aurora-painted skies, I realized that the most beautiful systems, whether in nature or in code, emerge from the dance between chaos and order.",
    mood: "wonder",
    coordinates: { top: "15%", left: "45%" },
  },
]

export const locationData: Record<string, LocationDetails> = {
  vietnam: {
    title: "Vietnam - The Beginning",
    description:
      "Where the river meets the sea, where stories begin with the scent of pho and the sound of motorbikes. Here, among ancient temples and modern dreams, a young wanderer first learned to see the world through curious eyes.",
  },
  usa: {
    title: "United States - Land of Code",
    description:
      "Across the Pacific, in valleys of silicon and cities of steel, algorithms became poetry and data became art. Here, the wanderer learned that technology could be both tool and canvas for human expression.",
  },
  europe: {
    title: "Europe - Ancient Wisdom",
    description:
      "Through cobblestone streets and halls of learning, where philosophy was born and innovation continues. Each city is a chapter, and each conversation is a lesson in the beautiful complexity of human thought.",
  },
  japan: {
    title: "Japan - Harmony in Contrast",
    description:
      "In the land where cherry blossoms meet bullet trains, where tradition and innovation dance in perfect harmony, the wanderer discovered that the future and the past can coexist in beautiful balance.",
  },
}
