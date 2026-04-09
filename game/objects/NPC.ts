import Phaser from "phaser"
import type { NpcData } from "@/game/config/npcData"

export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly id: string
  readonly displayName: string
  readonly dialogueLines: string[]

  constructor(scene: Phaser.Scene, data: NpcData) {
    super(scene, data.x, data.y, "world-npc")

    this.id = data.id
    this.displayName = data.name
    this.dialogueLines = data.dialogueLines

    scene.add.existing(this)
    scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setImmovable(true)
    body.setAllowGravity(false)
    body.setSize(18, 18)

    this.setTint(data.tint)
    this.setDepth(8)
    this.setOrigin(0.5, 0.5)
  }
}
