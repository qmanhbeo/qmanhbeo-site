import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"

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
  }

  create() {
    generateRoundedTexture(this, "world-player", 20, 20, 0xf5d08b, 0x4d2a16)
    generateRoundedTexture(this, "world-npc", 20, 20, 0xbcc9ff, 0x1c2437)
    generateCircleTexture(this, "world-fire", 12, 0xffa339)
    gameBridge.emit("load-progress", { progress: 1, label: "World ready" })
    this.scene.start("WorldScene")
    this.scene.start("UIScene")
  }
}
