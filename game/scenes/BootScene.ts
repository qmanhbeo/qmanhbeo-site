import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"
import { npcData } from "@/game/config/npcData"
import {
  WORLD_DECORATION_FRAME_SIZE,
  WORLD_DECORATION_TEXTURE_KEY,
  WORLD_GROUND_SOURCE_FRAMES,
  WORLD_GROUND_SOURCE_TEXTURE_KEY,
  WORLD_GROUND_TEXTURES,
  WORLD_GROUND_TILE_SIZE,
  WORLD_VISUAL_DEBUG,
} from "@/game/config/worldVisualAssets"

const PLAYER_ASSET = { key: "world-player", path: "/game/characters/player.png" }
const FIRE_ASSET = { key: "world-fire", path: "/game/characters/campfire.png" }

function getNpcAssets() {
  return npcData.map((npc) => {
    if (npc.spriteConfig) {
      if (npc.spriteConfig.atlasPath) {
        return {
          key: `world-npc-${npc.id}`,
          path: npc.spriteConfig.path,
          atlasPath: npc.spriteConfig.atlasPath,
          isAtlas: true,
        }
      }
      return {
        key: `world-npc-${npc.id}`,
        path: npc.spriteConfig.path,
        isSpritesheet: true,
        columns: npc.spriteConfig.columns,
        rows: npc.spriteConfig.rows,
        npcId: npc.id,
      }
    }
    return {
      key: `world-npc-${npc.id}`,
      path: `/game/characters/npc-${npc.id}.png`,
      isSpritesheet: false,
    }
  })
}

const NPC_ASSETS = getNpcAssets()

const WORLD_TILESET = {
  key: "world-tiles",
  mapKey: "world-map",
  mapPath: "/game/maps/world.json",
  path: "/game/tilesets/tiny-town.png",
} as const

const GROUND_PATH_ASSET = {
  key: WORLD_GROUND_SOURCE_TEXTURE_KEY,
  path: "/game/tilesets/ground-path-tiles/spritesheet.png",
} as const

const GROUND_DECORATION_ASSET = {
  key: WORLD_DECORATION_TEXTURE_KEY,
  path: "/game/tilesets/ground-items/spritesheet.png",
} as const

function generateRoundedTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  fillColor: number,
  strokeColor?: number,
) {
  const graphics = scene.make.graphics()
  graphics.fillStyle(fillColor, 1)
  graphics.fillRoundedRect(0, 0, width, height, 6)
  if (strokeColor) {
    graphics.lineStyle(2, strokeColor, 1)
    graphics.strokeRoundedRect(0, 0, width, height, 6)
  }
  graphics.generateTexture(key, width, height)
  graphics.destroy()
}

function generateCharacterTexture(
  scene: Phaser.Scene,
  key: string,
  palette: {
    accent: number
    cloak: number
    hair: number
    skin: number
  },
) {
  const graphics = scene.make.graphics()

  graphics.fillStyle(0x000000, 0.25)
  graphics.fillEllipse(12, 25, 17, 5)

  graphics.fillStyle(0x21130d, 1)
  graphics.fillRoundedRect(4, 8, 16, 17, 4)
  graphics.fillStyle(palette.cloak, 1)
  graphics.fillRoundedRect(5, 9, 14, 15, 4)
  graphics.fillStyle(0x120907, 0.4)
  graphics.fillRect(5, 18, 14, 5)

  graphics.fillStyle(palette.skin, 1)
  graphics.fillRoundedRect(7, 4, 10, 10, 3)
  graphics.fillStyle(palette.hair, 1)
  graphics.fillRect(6, 3, 12, 4)
  graphics.fillRect(6, 6, 3, 3)
  graphics.fillRect(15, 6, 3, 3)

  graphics.fillStyle(0x2a160e, 1)
  graphics.fillRect(8, 8, 2, 2)
  graphics.fillRect(14, 8, 2, 2)

  graphics.fillStyle(palette.accent, 1)
  graphics.fillRect(7, 14, 10, 2)
  graphics.fillRect(10, 21, 4, 3)

  graphics.generateTexture(key, 24, 28)
  graphics.destroy()
}

function generateCampfireTexture(scene: Phaser.Scene) {
  const graphics = scene.make.graphics()

  graphics.fillStyle(0x2a1710, 1)
  graphics.fillRect(8, 21, 18, 3)
  graphics.fillRect(7, 24, 20, 3)
  graphics.fillStyle(0x7d4a24, 1)
  graphics.fillRect(7, 20, 9, 4)
  graphics.fillRect(16, 23, 10, 4)

  graphics.fillStyle(0x3a2a22, 1)
  for (const stone of [
    [5, 23],
    [9, 27],
    [23, 27],
    [27, 23],
  ]) {
    graphics.fillCircle(stone[0], stone[1], 2.5)
  }

  graphics.fillStyle(0xffd27b, 1)
  graphics.fillTriangle(16, 4, 9, 21, 23, 21)
  graphics.fillStyle(0xff7a24, 1)
  graphics.fillTriangle(16, 8, 11, 22, 21, 22)
  graphics.fillStyle(0xfff1b7, 1)
  graphics.fillTriangle(16, 11, 13, 21, 19, 21)

  graphics.generateTexture("world-fire", 32, 32)
  graphics.destroy()
}

function generateCircleTexture(scene: Phaser.Scene, key: string, radius: number, fillColor: number) {
  const graphics = scene.make.graphics()
  graphics.fillStyle(fillColor, 1)
  graphics.fillCircle(radius, radius, radius)
  graphics.generateTexture(key, radius * 2, radius * 2)
  graphics.destroy()
}

function logWorldVisualDebug(message: string, payload?: Record<string, unknown>) {
  if (!WORLD_VISUAL_DEBUG) return
  console.info(`[WorldVisualAssets] ${message}`, payload ?? "")
}

function createCanvasTexture(
  scene: Phaser.Scene,
  key: string,
  draw: (context: CanvasRenderingContext2D) => void,
) {
  if (scene.textures.exists(key)) return true

  const texture = scene.textures.createCanvas(key, WORLD_GROUND_TILE_SIZE, WORLD_GROUND_TILE_SIZE)
  if (!texture) return false

  const context = texture.getContext()
  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, WORLD_GROUND_TILE_SIZE, WORLD_GROUND_TILE_SIZE)
  draw(context)
  texture.refresh()
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
  return true
}

function createNormalizedGroundTexture(
  scene: Phaser.Scene,
  key: string,
  sourceFrameIndex: number,
) {
  const sourceFrame = scene.textures.getFrame(WORLD_GROUND_SOURCE_TEXTURE_KEY, sourceFrameIndex)
  if (!sourceFrame) return false

  return createCanvasTexture(scene, key, (context) => {
    context.drawImage(
      sourceFrame.source.image as CanvasImageSource,
      sourceFrame.cutX,
      sourceFrame.cutY,
      sourceFrame.cutWidth,
      sourceFrame.cutHeight,
      0,
      0,
      sourceFrame.cutWidth,
      sourceFrame.cutHeight,
    )
  })
}

function createTransformedGroundTexture(
  scene: Phaser.Scene,
  key: string,
  sourceKey: string,
  transform: {
    flipX?: boolean
    flipY?: boolean
    rotateQuarterTurns?: number
  },
) {
  const sourceFrame = scene.textures.getFrame(sourceKey)
  if (!sourceFrame) return false

  return createCanvasTexture(scene, key, (context) => {
    context.save()
    context.translate(WORLD_GROUND_TILE_SIZE / 2, WORLD_GROUND_TILE_SIZE / 2)
    context.rotate((transform.rotateQuarterTurns ?? 0) * Math.PI / 2)
    context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)
    context.drawImage(
      sourceFrame.source.image as CanvasImageSource,
      sourceFrame.cutX,
      sourceFrame.cutY,
      sourceFrame.cutWidth,
      sourceFrame.cutHeight,
      -WORLD_GROUND_TILE_SIZE / 2,
      -WORLD_GROUND_TILE_SIZE / 2,
      WORLD_GROUND_TILE_SIZE,
      WORLD_GROUND_TILE_SIZE,
    )
    context.restore()
  })
}

function createNormalizedGroundTextures(scene: Phaser.Scene) {
  if (!scene.textures.exists(WORLD_GROUND_SOURCE_TEXTURE_KEY)) return false

  const sourceTexture = scene.textures.get(WORLD_GROUND_SOURCE_TEXTURE_KEY)
  const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement | HTMLCanvasElement

  const created = [
    createNormalizedGroundTexture(scene, WORLD_GROUND_TEXTURES.pathCornerTl, WORLD_GROUND_SOURCE_FRAMES.pathCornerTl),
    createNormalizedGroundTexture(scene, WORLD_GROUND_TEXTURES.pathHorizontal, WORLD_GROUND_SOURCE_FRAMES.pathHorizontal),
    createNormalizedGroundTexture(scene, WORLD_GROUND_TEXTURES.grass1, WORLD_GROUND_SOURCE_FRAMES.grass1),
    createNormalizedGroundTexture(scene, WORLD_GROUND_TEXTURES.grass2, WORLD_GROUND_SOURCE_FRAMES.grass2),
    createTransformedGroundTexture(scene, WORLD_GROUND_TEXTURES.pathVertical, WORLD_GROUND_TEXTURES.pathHorizontal, {
      rotateQuarterTurns: 1,
    }),
    createTransformedGroundTexture(scene, WORLD_GROUND_TEXTURES.pathCornerTr, WORLD_GROUND_TEXTURES.pathCornerTl, {
      flipX: true,
    }),
    createTransformedGroundTexture(scene, WORLD_GROUND_TEXTURES.pathCornerBl, WORLD_GROUND_TEXTURES.pathCornerTl, {
      flipY: true,
    }),
    createTransformedGroundTexture(scene, WORLD_GROUND_TEXTURES.pathCornerBr, WORLD_GROUND_TEXTURES.pathCornerTl, {
      flipX: true,
      flipY: true,
    }),
  ]

  const allCreated = created.every(Boolean)
  logWorldVisualDebug("ground textures normalized", {
    sourceWidth: sourceImage.width,
    sourceHeight: sourceImage.height,
    tileSize: WORLD_GROUND_TILE_SIZE,
    generatedKeys: Object.values(WORLD_GROUND_TEXTURES),
    allCreated,
  })
  return allCreated
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene")
  }

  preload() {
    gameBridge.emit("load-progress", { progress: 0.12, label: "Lighting the hearth" })
    this.load.image(PLAYER_ASSET.key, PLAYER_ASSET.path)
    this.load.image(FIRE_ASSET.key, FIRE_ASSET.path)
    this.load.spritesheet("lunar-phases", "/assets/sprites/lunar-phases.png", {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.atlas("building-library", "/game/buildings/library-128/spritesheet.png", "/game/buildings/library-128/spritesheet.json")
    this.load.atlas("building-tavern", "/game/buildings/tavern-yard/spritesheet.png", "/game/buildings/tavern-yard/spritesheet.json")
    this.load.atlas("building-post-office", "/game/buildings/post-office/spritesheet.png", "/game/buildings/post-office/spritesheet.json")
    this.load.atlas("building-workshop", "/game/buildings/workshop/spritesheet.png", "/game/buildings/workshop/spritesheet.json")
    this.load.atlas("bard", "/game/characters/bard-sheet/spritesheet.png", "/game/characters/bard-sheet/spritesheet.json")
    NPC_ASSETS.forEach((asset) => {
      if (asset.isAtlas) {
        this.load.atlas(asset.key, asset.path, asset.atlasPath)
      } else {
        this.load.image(asset.key, asset.path)
      }
    })
    this.load.spritesheet(WORLD_TILESET.key, WORLD_TILESET.path, {
      frameWidth: 16,
      frameHeight: 16,
    })
    this.load.spritesheet(GROUND_PATH_ASSET.key, GROUND_PATH_ASSET.path, {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.spritesheet(GROUND_DECORATION_ASSET.key, GROUND_DECORATION_ASSET.path, {
      frameWidth: WORLD_DECORATION_FRAME_SIZE,
      frameHeight: WORLD_DECORATION_FRAME_SIZE,
    })
    this.load.tilemapTiledJSON(WORLD_TILESET.mapKey, WORLD_TILESET.mapPath)
    this.load.on("progress", (progress: number) => {
      gameBridge.emit("load-progress", {
        progress: 0.12 + progress * 0.76,
        label: "Gathering village assets",
      })
    })
  }

  create() {
    if (!this.textures.exists("world-player")) {
      generateCharacterTexture(this, "world-player", {
        accent: 0xffd27b,
        cloak: 0x8a4f24,
        hair: 0x3a1f13,
        skin: 0xf5d08b,
      })
    }
    generateRoundedTexture(this, "world-npc", 20, 20, 0xbcc9ff, 0x1c2437)
    npcData.forEach((npc, index) => {
      if (npc.spriteConfig) return
      if (this.textures.exists(`world-npc-${npc.id}`)) return
      const hairColors = [0x24130c, 0x44301d, 0x201a24]
      generateCharacterTexture(this, `world-npc-${npc.id}`, {
        accent: 0xffd27b,
        cloak: npc.tint,
        hair: hairColors[index % hairColors.length],
        skin: 0xf1c998,
      })
    })
    this.createNpcAnimations().then(() => {
      this.createBardAnimations()
      generateCircleTexture(this, "world-spark", 2, 0xffe1a3)
      if (!this.textures.exists("world-fire")) {
        generateCampfireTexture(this)
      }
      createNormalizedGroundTextures(this)
      gameBridge.emit("load-progress", { progress: 1, label: "World ready" })
      this.scene.start("WorldScene")
      this.scene.start("UIScene")
    })
  }

  private createNpcAnimations(): Promise<void> {
    const promises = npcData.map((npc) => {
      if (npc.spriteConfig) {
        const key = `world-npc-${npc.id}`
        if (!this.textures.exists(key)) {
          const spritePath = npc.spriteConfig.path
          this.load.image(key, spritePath)
          return new Promise<void>((resolve) => {
            this.load.once('complete', () => resolve())
            this.load.once('loaderror', () => {
              console.error(`[BootScene] Failed to load sprite: ${spritePath}`)
              resolve()
            })
          })
        }

        if (npc.spriteConfig.atlasPath) {
          return this.createAtlasNpcAnimations(npc, key)
        } else {
          this.createImageNpcAnimations(npc, key)
          return Promise.resolve()
        }
      }
      return Promise.resolve()
    })
    return Promise.all(promises) as unknown as Promise<void>
  }

  private createAtlasNpcAnimations(npc: { spriteConfig?: { atlasPath?: string; targetSize?: number; columns?: number; rows?: number } }, key: string): Promise<void> {
    return new Promise((resolve) => {
      fetch(npc.spriteConfig!.atlasPath!)
        .then(async (res) => {
          const atlasData = await res.json()

          const frames = atlasData.frames

          const texture = this.textures.get(key)

          const columns = npc.spriteConfig?.columns || 4
          const rows = npc.spriteConfig?.rows || 4

          if (columns === 2 && rows === 1) {
            const frame0 = frames["frame_000"]?.frame
            const frame1 = frames["frame_001"]?.frame
            if (frame0) {
              texture.add(0, 0, frame0.x, frame0.y, frame0.w, frame0.h)
            }
            if (frame1) {
              texture.add(1, 0, frame1.x, frame1.y, frame1.w, frame1.h)
            }
            this.anims.create({ key: `${key}-flip`, frames: [{ key, frame: 0 }, { key, frame: 1 }], frameRate: 6, repeat: -1 })
            this.anims.create({ key: `${key}-idle-down`, frames: [{ key, frame: 0 }], frameRate: 1 })
            resolve()
            return
          }

          let frameIndex = 0
          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
              const frameKey = `frame_${String(row * 4 + col).padStart(3, "0")}`
              if (frames[frameKey]) {
                const frame = frames[frameKey].frame
                texture.add(frameIndex, 0, frame.x, frame.y, frame.w, frame.h)
                frameIndex++
              }
            }
          }

          this.anims.create({ key: `${key}-down`, frames: [{ key, frame: 0 }, { key, frame: 2 }], frameRate: 6, repeat: -1 })
          this.anims.create({ key: `${key}-left`, frames: [{ key, frame: 4 }, { key, frame: 6 }], frameRate: 6, repeat: -1 })
          this.anims.create({ key: `${key}-right`, frames: [{ key, frame: 8 }, { key, frame: 10 }], frameRate: 6, repeat: -1 })
          this.anims.create({ key: `${key}-up`, frames: [{ key, frame: 12 }, { key, frame: 14 }], frameRate: 6, repeat: -1 })
          this.anims.create({ key: `${key}-idle-down`, frames: [{ key, frame: 3 }], frameRate: 1 })
          this.anims.create({ key: `${key}-idle-left`, frames: [{ key, frame: 7 }], frameRate: 1 })
          this.anims.create({ key: `${key}-idle-right`, frames: [{ key, frame: 11 }], frameRate: 1 })
          this.anims.create({ key: `${key}-idle-up`, frames: [{ key, frame: 15 }], frameRate: 1 })
          resolve()
        })
        .catch((err) => {
          console.error(`[BootScene] Failed to load atlas for ${key}:`, err)
          resolve()
        })
    })
  }

  private createImageNpcAnimations(npc: { spriteConfig?: { columns: number; rows: number; targetSize?: number } }, key: string) {
    const texture = this.textures.get(key)
    const sourceImage = texture.getSourceImage() as HTMLImageElement
    if (!sourceImage) return

    const imageWidth = sourceImage.naturalWidth || sourceImage.width
    const imageHeight = sourceImage.naturalHeight || sourceImage.height

    const cellWidth = Math.floor(imageWidth / npc.spriteConfig!.columns)
    const cellHeight = Math.floor(imageHeight / npc.spriteConfig!.rows)

    const trimmed = this.detectTrimBounds(sourceImage, cellWidth, cellHeight)
    const trimmedWidth = trimmed.width
    const trimmedHeight = trimmed.height

    if (npc.spriteConfig!.columns === 1 && npc.spriteConfig!.rows === 1) {
      this.textures.get(key).add(0, 0, trimmed.x, trimmed.y, trimmedWidth, trimmedHeight)
      this.textures.get(key).add(1, 0, trimmed.x, trimmed.y, trimmedWidth, trimmedHeight)
      this.textures.get(key).add(2, 0, trimmed.x, trimmed.y, trimmedWidth, trimmedHeight)
      this.textures.get(key).add(3, 0, trimmed.x, trimmed.y, trimmedWidth, trimmedHeight)
      this.anims.create({ key: `${key}-idle-down`, frames: [{ key, frame: 0 }], frameRate: 1 })
      this.anims.create({ key: `${key}-idle-left`, frames: [{ key, frame: 1 }], frameRate: 1 })
      this.anims.create({ key: `${key}-idle-right`, frames: [{ key, frame: 2 }], frameRate: 1 })
      this.anims.create({ key: `${key}-idle-up`, frames: [{ key, frame: 3 }], frameRate: 1 })
      return
    }

    this.textures.get(key).add(0, 0, trimmed.x, trimmed.y, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(1, 0, trimmed.x + cellWidth, trimmed.y, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(2, 0, trimmed.x + cellWidth * 2, trimmed.y, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(3, 0, trimmed.x + cellWidth * 3, trimmed.y, trimmedWidth, trimmedHeight)

    this.textures.get(key).add(4, 0, trimmed.x, trimmed.y + cellHeight, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(5, 0, trimmed.x + cellWidth, trimmed.y + cellHeight, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(6, 0, trimmed.x + cellWidth * 2, trimmed.y + cellHeight, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(7, 0, trimmed.x + cellWidth * 3, trimmed.y + cellHeight, trimmedWidth, trimmedHeight)

    this.textures.get(key).add(8, 0, trimmed.x, trimmed.y + cellHeight * 2, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(9, 0, trimmed.x + cellWidth, trimmed.y + cellHeight * 2, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(10, 0, trimmed.x + cellWidth * 2, trimmed.y + cellHeight * 2, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(11, 0, trimmed.x + cellWidth * 3, trimmed.y + cellHeight * 2, trimmedWidth, trimmedHeight)

    this.textures.get(key).add(12, 0, trimmed.x, trimmed.y + cellHeight * 3, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(13, 0, trimmed.x + cellWidth, trimmed.y + cellHeight * 3, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(14, 0, trimmed.x + cellWidth * 2, trimmed.y + cellHeight * 3, trimmedWidth, trimmedHeight)
    this.textures.get(key).add(15, 0, trimmed.x + cellWidth * 3, trimmed.y + cellHeight * 3, trimmedWidth, trimmedHeight)

    this.anims.create({ key: `${key}-down`, frames: [{ key, frame: 0 }, { key, frame: 2 }], frameRate: 6, repeat: -1 })
    this.anims.create({ key: `${key}-left`, frames: [{ key, frame: 4 }, { key, frame: 6 }], frameRate: 6, repeat: -1 })
    this.anims.create({ key: `${key}-right`, frames: [{ key, frame: 8 }, { key, frame: 10 }], frameRate: 6, repeat: -1 })
    this.anims.create({ key: `${key}-up`, frames: [{ key, frame: 12 }, { key, frame: 14 }], frameRate: 6, repeat: -1 })
    this.anims.create({ key: `${key}-idle-down`, frames: [{ key, frame: 3 }], frameRate: 1 })
    this.anims.create({ key: `${key}-idle-left`, frames: [{ key, frame: 7 }], frameRate: 1 })
    this.anims.create({ key: `${key}-idle-right`, frames: [{ key, frame: 11 }], frameRate: 1 })
    this.anims.create({ key: `${key}-idle-up`, frames: [{ key, frame: 15 }], frameRate: 1 })
  }

  private detectTrimBounds(
    sourceImage: HTMLImageElement,
    cellWidth: number,
    cellHeight: number,
  ): { x: number; y: number; width: number; height: number } {
    const canvas = document.createElement("canvas")
    canvas.width = cellWidth
    canvas.height = cellHeight
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(sourceImage, 0, 0, cellWidth, cellHeight)
    const imageData = ctx.getImageData(0, 0, cellWidth, cellHeight)
    const data = imageData.data

    let minX = cellWidth,
      minY = cellHeight,
      maxX = 0,
      maxY = 0

    for (let y = 0; y < cellHeight; y++) {
      for (let x = 0; x < cellWidth; x++) {
        const alpha = data[(y * cellWidth + x) * 4 + 3]
        if (alpha > 10) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return { x: 0, y: 0, width: cellWidth, height: cellHeight }
    }

    return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
  }

  private createBardAnimations() {
    const key = "bard"

    this.anims.create({ key: "bard-checking", frames: [{ key, frame: "frame_005" }, { key, frame: "frame_006" }, { key, frame: "frame_000" }], frameRate: 3 })

    this.anims.create({ key: "bard-sit-down", frames: [{ key, frame: "frame_010" }, { key, frame: "frame_011" }, { key, frame: "frame_012" }], frameRate: 4 })

    this.anims.create({
      key: "bard-playing",
      frames: [
        { key, frame: "frame_012" },
        { key, frame: "frame_013" },
        { key, frame: "frame_014" },
        { key, frame: "frame_015" },
        { key, frame: "frame_016" },
      ],
      frameRate: 6,
      repeat: -1,
    })

    this.anims.create({ key: "bard-resting", frames: [{ key, frame: "frame_017" }, { key, frame: "frame_018" }, { key, frame: "frame_019" }], frameRate: 2, repeat: -1 })
  }
}
