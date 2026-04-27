export interface SpriteConfig {
  path: string
  atlasPath?: string
  columns: number
  rows: number
  targetSize?: number
}

export interface NpcData {
  id: string
  name: string
  x: number
  y: number
  tint: number
  dialogueLines: string[]
  spriteConfig?: SpriteConfig
}

const CENTER_X = 1200
const CENTER_Y = 900

const OFFSET_X = 180
const OFFSET_Y = 150

const BUILDING_OFFSET_X = 80
const BUILDING_OFFSET_Y = 50

export const npcData: NpcData[] = [
  {
    id: "alex",
    name: "Alex",
    x: CENTER_X - OFFSET_X + BUILDING_OFFSET_X,
    y: CENTER_Y - OFFSET_Y + BUILDING_OFFSET_Y,
    tint: 0x8bb8ff,
    dialogueLines: [
      "Manh keeps leaving half the village in draft mode.",
      "The Library is where the serious scrolls live.",
    ],
  },
  {
    id: "adam",
    name: "Adam",
    x: CENTER_X + OFFSET_X - BUILDING_OFFSET_X,
    y: CENTER_Y - OFFSET_Y + BUILDING_OFFSET_Y,
    tint: 0x97d78b,
    dialogueLines: [
      "The Workshop is the right door if you want the built things.",
      "Every good prototype in this town starts a little rough.",
    ],
  },
  {
    id: "avery",
    name: "Avery",
    x: CENTER_X,
    y: CENTER_Y + 30,
    tint: 0xf7c96b,
    dialogueLines: [
      "The campfire is still the center of the whole world here.",
      "Walk around first. The village makes more sense once you feel the distances.",
    ],
  },
  {
    id: "tungtung",
    name: "Tung Tung",
    x: CENTER_X + 60,
    y: CENTER_Y - 130,
    tint: 0xffffff,
    dialogueLines: ["Tung Tung Tung Sahur"],
    spriteConfig: {
      path: "/game/characters/tungtung/tungtung-sprite.png",
      columns: 1,
      rows: 1,
      targetSize: 48,
    },
  },
  {
    id: "manh",
    name: "Manh",
    x: CENTER_X - 30,
    y: CENTER_Y + 15,
    tint: 0xffffff,
    dialogueLines: [
      "Welcome to the village!",
      "The fire keeps us warm.",
    ],
    spriteConfig: {
      path: "/game/characters/manh-sheet/spritesheet.png",
      atlasPath: "/game/characters/manh-sheet/spritesheet.json",
      columns: 4,
      rows: 4,
      targetSize: 32,
    },
  },
]
