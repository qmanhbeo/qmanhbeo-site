import Phaser from "phaser"
import type { BuildingData } from "@/game/config/buildingData"
import type { Player } from "@/game/objects/Player"

export class BuildingZone {
  readonly id: string
  readonly label: string
  readonly prompt: string
  readonly sectionId: BuildingData["sectionId"]
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  private readonly zone: Phaser.GameObjects.Zone

  constructor(private readonly scene: Phaser.Scene, data: BuildingData) {
    this.id = data.id
    this.label = data.label
    this.prompt = data.prompt
    this.sectionId = data.sectionId
    this.x = data.x
    this.y = data.y
    this.width = data.width
    this.height = data.height

    this.zone = scene.add.zone(data.x, data.y, data.width, data.height)
    scene.physics.add.existing(this.zone, true)
  }

  overlaps(player: Player) {
    return this.scene.physics.overlap(player, this.zone)
  }
}
