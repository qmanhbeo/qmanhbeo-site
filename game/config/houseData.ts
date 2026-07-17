export interface HouseData {
  id: string
  npcId: string
  label: string
  x: number
  y: number
  width: number
  height: number
  color: number
  nightFlavorLine: string
}

export const houseData: HouseData[] = [
  {
    id: "house-bard",
    npcId: "bard",
    label: "Bard's House",
    x: 840,
    y: 650,
    width: 72,
    height: 56,
    color: 0x5e3040,
    nightFlavorLine: "A quiet melody drifts through the walls...",
  },
  {
    id: "house-avery",
    npcId: "avery",
    label: "Avery's House",
    x: 960,
    y: 650,
    width: 72,
    height: 56,
    color: 0x5e4a2a,
    nightFlavorLine: "Soft snoring. Out cold.",
  },
  {
    id: "house-manh",
    npcId: "manh",
    label: "Manh's House",
    x: 1080,
    y: 650,
    width: 72,
    height: 56,
    color: 0x6b3a1f,
    nightFlavorLine: "Sounds like he's tinkering with tools in there...",
  },
  {
    id: "house-tungtung",
    npcId: "tungtung",
    label: "Tung Tung's House",
    x: 1200,
    y: 650,
    width: 72,
    height: 56,
    color: 0x4a2a3a,
    nightFlavorLine: "...silence. Tung Tung is asleep.",
  },
  {
    id: "house-alex",
    npcId: "alex",
    label: "Alex's House",
    x: 1320,
    y: 650,
    width: 72,
    height: 56,
    color: 0x3a4a5e,
    nightFlavorLine: "The candle's still on. Pages turning.",
  },
  {
    id: "house-adam",
    npcId: "adam",
    label: "Adam's House",
    x: 1440,
    y: 650,
    width: 72,
    height: 56,
    color: 0x4a5e3a,
    nightFlavorLine: "Hmm. Smells like someone's cooking.",
  },
  {
    id: "house-hachimi",
    npcId: "hachimi",
    label: "Hachimi's Garage",
    x: 1560,
    y: 650,
    width: 80,
    height: 48,
    color: 0x2a2a3a,
    nightFlavorLine: "The car is parked. Silent for once.",
  },
]
