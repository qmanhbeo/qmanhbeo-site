import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"
import { npcData } from "@/game/config/npcData"

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

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene")
  }

  preload() {
    gameBridge.emit("load-progress", { progress: 0.12, label: "Lighting the hearth" })
    this.load.image(PLAYER_ASSET.key, PLAYER_ASSET.path)
    this.load.image(FIRE_ASSET.key, FIRE_ASSET.path)
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
      generateCircleTexture(this, "world-spark", 2, 0xffe1a3)
      if (!this.textures.exists("world-fire")) {
        generateCampfireTexture(this)
      }
      gameBridge.emit("load-progress", { progress: 1, label: "World ready" })
      this.scene.start("WorldScene")
      this.scene.start("UIScene")
    })
  }

  private createNpcAnimations(): Promise<void> {
    const promises = npcData.map((npc) => {
      if (!npc.spriteConfig) return Promise.resolve()
      const key = `world-npc-${npc.id}`
      if (!this.textures.exists(key)) return Promise.resolve()

      if (npc.spriteConfig.atlasPath) {
        return this.createAtlasNpcAnimations(npc, key)
      } else {
        this.createImageNpcAnimations(npc, key)
        return Promise.resolve()
      }
    })
    return Promise.all(promises) as unknown as Promise<void>
  }

  private createAtlasNpcAnimations(npc: { spriteConfig?: { atlasPath?: string; targetSize?: number } }, key: string): Promise<void> {
    return new Promise((resolve) => {
      fetch(npc.spriteConfig!.atlasPath!)
        .then(async (res) => {
          const atlasData = await res.json()

          const frames = atlasData.frames
          const meta = atlasData.meta

          const DEFAULT_TARGET_SIZE = 64
          const targetSize = npc.spriteConfig?.targetSize || DEFAULT_TARGET_SIZE

          const texture = this.textures.get(key)

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

    const DEFAULT_TARGET_SIZE = 32
    const targetSize = npc.spriteConfig?.targetSize || DEFAULT_TARGET_SIZE
    const autoScale = targetSize / trimmedHeight

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
}
