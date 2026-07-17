export const WORLD_VISUAL_DEBUG = false

// Toggles the village houses and their associated logic (house rendering,
// night-homes NPC repositioning, knock-on-door dialogue). Set to true to
// re-enable. Off by default while the feature is paused.
export const WORLD_HOUSES_ENABLED = false

export const WORLD_DEPTHS = {
  ground: 0,
  decorations: 1,
  forest: 2,
  buildings: 4,
  campfireGlow: 4,
  campfireFire: 6,
  campfireSpark: 7,
} as const

export const WORLD_GROUND_TILE_SIZE = 64
export const WORLD_DECORATION_FRAME_SIZE = 64

export const WORLD_GROUND_SOURCE_TEXTURE_KEY = "ground-path-source"
export const WORLD_DECORATION_TEXTURE_KEY = "ground-decoration-items"

export const WORLD_GROUND_TEXTURES = {
  grass1: "ground_grass_1",
  grass2: "ground_grass_2",
  pathHorizontal: "path_horizontal",
  pathVertical: "path_vertical",
  pathCornerTl: "path_corner_tl",
  pathCornerTr: "path_corner_tr",
  pathCornerBl: "path_corner_bl",
  pathCornerBr: "path_corner_br",
} as const

export const WORLD_GROUND_SOURCE_FRAMES = {
  pathCornerTl: 0,
  pathHorizontal: 1,
  grass1: 2,
  grass2: 3,
} as const

export const WORLD_DECORATION_FRAMES = {
  flowersSmall: 0,
  flowersCluster: 1,
  smallRocks: 2,
  pebbles: 3,
  grassTuft: 4,
} as const
