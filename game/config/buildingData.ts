import type { WorldSectionId } from "@/utils/worldSections"

export interface BuildingData {
  id: string
  label: string
  prompt: string
  sectionId: WorldSectionId
  x: number
  y: number
  width: number
  height: number
  color: number
}

export const buildingData: BuildingData[] = [
  {
    id: "library",
    label: "Library",
    prompt: "Press E to enter the Library",
    sectionId: "publications",
    x: 1008,
    y: 692,
    width: 88,
    height: 72,
    color: 0x5d462d,
  },
  {
    id: "workshop",
    label: "Workshop",
    prompt: "Press E to enter the Workshop",
    sectionId: "projects",
    x: 1392,
    y: 692,
    width: 88,
    height: 72,
    color: 0x76471f,
  },
  {
    id: "tavern",
    label: "Tavern",
    prompt: "Press E to enter the Tavern",
    sectionId: "blog",
    x: 1008,
    y: 1076,
    width: 88,
    height: 72,
    color: 0x6f3521,
  },
  {
    id: "post-office",
    label: "Post Office",
    prompt: "Press E to enter the Post Office",
    sectionId: "letter",
    x: 1392,
    y: 1076,
    width: 88,
    height: 72,
    color: 0x8a4f24,
  },
]
