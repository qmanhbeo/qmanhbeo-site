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

export const npcData: NpcData[] = [
  {
    id: "alex",
    name: "Alex",
    x: 148,
    y: 176,
    tint: 0x8bb8ff,
    dialogueLines: [
      "Manh keeps leaving half the village in draft mode.",
      "The Library is where the serious scrolls live.",
    ],
  },
  {
    id: "adam",
    name: "Adam",
    x: 492,
    y: 180,
    tint: 0x97d78b,
    dialogueLines: [
      "The Workshop is the right door if you want the built things.",
      "Every good prototype in this town starts a little rough.",
    ],
  },
  {
    id: "avery",
    name: "Avery",
    x: 320,
    y: 360,
    tint: 0xf7c96b,
    dialogueLines: [
      "The campfire is still the center of the whole world here.",
      "Walk around first. The village makes more sense once you feel the distances.",
    ],
  },
  {
    id: "tungtung",
    name: "Tung Tung",
    x: 420,
    y: 69,
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
    x: 360,
    y: 280,
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
