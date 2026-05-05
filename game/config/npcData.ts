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
  shadowOffsetY?: number
}

const CENTER_X = 1200
const CENTER_Y = 900

const OFFSET_X = 140
const OFFSET_Y = 110

const BUILDING_OFFSET_X = 60
const BUILDING_OFFSET_Y = 40

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
    y: CENTER_Y + 20,
    tint: 0xf7c96b,
    dialogueLines: [
      "The campfire is still the center of the whole world here.",
      "Walk around first. The village makes more sense once you feel the distances.",
    ],
  },
  {
    id: "tungtung",
    name: "Tung Tung",
    x: CENTER_X + 40,
    y: CENTER_Y - 100,
    tint: 0xffffff,
    dialogueLines: ["Tung Tung Tung Sahur"],
    spriteConfig: {
      path: "/game/characters/tungtung-sheet/spritesheet.png",
      atlasPath: "/game/characters/tungtung-sheet/spritesheet.json",
      columns: 4,
      rows: 4,
      targetSize: 48,
    },
  },
  {
    id: "manh",
    name: "Manh",
    x: CENTER_X - 20,
    y: CENTER_Y + 10,
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
  {
    id: "hachimi",
    name: "Hachimi Car",
    x: CENTER_X - 60,
    y: CENTER_Y + 80,
    tint: 0xffffff,
    dialogueLines: ["hachimichimichi", "ashigagaashi", "mambow", "mambOW", "ma-ambow", "ting ting tung tung ting", "tingting ting tungtung ting"],
    spriteConfig: {
      path: "/game/characters/hachimi-sheet/spritesheet.png",
      atlasPath: "/game/characters/hachimi-sheet/spritesheet.json",
      columns: 2,
      rows: 1,
      targetSize: 24,
    },
  },
  {
    id: "bard",
    name: "Bard",
    x: CENTER_X - OFFSET_X + 100,
    y: CENTER_Y + OFFSET_Y + 10,
    tint: 0xffffff,
    dialogueLines: [
      "Care for a tune?",
      "The fire keeps time for us all.",
    ],
    shadowOffsetY: -10,
  },
]
