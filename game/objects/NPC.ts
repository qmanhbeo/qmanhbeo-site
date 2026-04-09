import Phaser from "phaser"
import type { NpcData } from "@/game/config/npcData"

export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly id: string
  readonly displayName: string
  readonly dialogueLines: string[]
  private readonly baseY: number
  private readonly shadow: Phaser.GameObjects.Ellipse

  constructor(scene: Phaser.Scene, data: NpcData) {
    const textureKey = scene.textures.exists(`world-npc-${data.id}`) ? `world-npc-${data.id}` : "world-npc"
    super(scene, data.x, data.y, textureKey)

    this.id = data.id
    this.displayName = data.name
    this.dialogueLines = data.dialogueLines
    this.baseY = data.y
    this.shadow = scene.add.ellipse(data.x, data.y + 11, 17, 6, 0x000000, 0.28)
      .setDepth(7)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setImmovable(true)
    body.setAllowGravity(false)
    body.setSize(18, 18)

    if (textureKey === "world-npc") this.setTint(data.tint)
    this.setDepth(8)
    this.setOrigin(0.5, 0.5)

    scene.tweens.add({
      targets: this,
      y: data.y - 2,
      duration: 1300 + (data.x % 4) * 120,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    })
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta)
    this.shadow.setPosition(this.x, this.y + 11)
    this.shadow.setScale(1, 1 + Math.abs(this.y - this.baseY) * 0.03)
  }

  destroy(fromScene?: boolean) {
    this.shadow.destroy()
    super.destroy(fromScene)
  }
}
