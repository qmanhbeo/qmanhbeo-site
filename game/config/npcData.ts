export interface NpcData {
  id: string
  name: string
  x: number
  y: number
  tint: number
  dialogueLines: string[]
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
]
