import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"
import { npcData } from "@/game/config/npcData"

const CHARACTER_ASSETS = [
  { key: "world-player", path: "/game/characters/player.png" },
  ...npcData.map((npc) => ({
    key: `world-npc-${npc.id}`,
    path: `/game/characters/npc-${npc.id}.png`,
  })),
  { key: "world-fire", path: "/game/characters/campfire.png" },
] as const

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
    CHARACTER_ASSETS.forEach((asset) => {
      this.load.image(asset.key, asset.path)
    })
    this.load.on("progress", (progress: number) => {
      gameBridge.emit("load-progress", {
        progress: 0.12 + progress * 0.76,
        label: "Gathering village sprites",
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
      if (this.textures.exists(`world-npc-${npc.id}`)) return
      const hairColors = [0x24130c, 0x44301d, 0x201a24]
      generateCharacterTexture(this, `world-npc-${npc.id}`, {
        accent: 0xffd27b,
        cloak: npc.tint,
        hair: hairColors[index % hairColors.length],
        skin: 0xf1c998,
      })
    })
    generateCircleTexture(this, "world-spark", 2, 0xffe1a3)
    if (!this.textures.exists("world-fire")) {
      generateCampfireTexture(this)
    }
    gameBridge.emit("load-progress", { progress: 1, label: "World ready" })
    this.scene.start("WorldScene")
    this.scene.start("UIScene")
  }
}
