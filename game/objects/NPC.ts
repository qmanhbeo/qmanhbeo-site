import Phaser from "phaser"
import type { NpcData } from "@/game/config/npcData"

const WANDER_SPEED = 32
const WALK_DURATION_MIN = 1000
const WALK_DURATION_MAX = 3000
const PAUSE_DURATION_MIN = 500
const PAUSE_DURATION_MAX = 2000

type Direction = "up" | "down" | "left" | "right"

export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly id: string
  readonly displayName: string
  readonly dialogueLines: string[]
  readonly hasSprite: boolean
  private readonly baseY: number
  private readonly shadow: Phaser.GameObjects.Ellipse
  private wanderState: {
    direction: Direction
    isWandering: boolean
    timer: number
    pauseRemaining: number
  }

  constructor(scene: Phaser.Scene, data: NpcData) {
    const textureKey = scene.textures.exists(`world-npc-${data.id}`) ? `world-npc-${data.id}` : "world-npc"
    super(scene, data.x, data.y, textureKey)

    this.id = data.id
    this.displayName = data.name
    this.dialogueLines = data.dialogueLines
    this.baseY = data.y
    this.hasSprite = Boolean(data.spriteConfig)
    this.wanderState = {
      direction: "down",
      isWandering: false,
      timer: 0,
      pauseRemaining: 0,
    }
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

    if (this.hasSprite) {
      if (data.spriteConfig?.atlasPath) {
        const targetSize = data.spriteConfig.targetSize || 32
        const frameHeight = 250
        this.setScale(targetSize / frameHeight)
      } else {
        const sourceImage = scene.textures.get(textureKey).getSourceImage() as HTMLImageElement
        if (sourceImage) {
          const naturalWidth = sourceImage.naturalWidth || sourceImage.width
          const naturalHeight = sourceImage.naturalHeight || sourceImage.height
          const cellWidth = Math.floor(naturalWidth / (data.spriteConfig?.columns || 4))
          const cellHeight = Math.floor(naturalHeight / (data.spriteConfig?.rows || 4))
          const trimmed = this.detectTrimBounds(sourceImage, cellWidth, cellHeight)
          const trimmedHeight = trimmed.height
          const targetSize = data.spriteConfig?.targetSize || 32
          this.setScale(targetSize / trimmedHeight)
        } else {
          this.setScale(0.2)
        }
      }
      const animKey = `world-npc-${data.id}`
      const anims: Phaser.Animations.AnimationManager = (scene as Phaser.Scene).anims
      const idleDownKey = `${animKey}-idle-down`
      if (anims.exists(idleDownKey)) {
        this.play(idleDownKey)
        this.setFrame(3)
      }
    } else {
      scene.tweens.add({
        targets: this,
        y: data.y - 2,
        duration: 1300 + (data.x % 4) * 120,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta)
    this.shadow.setPosition(this.x, this.y + 11)
    this.shadow.setScale(1, 1 + Math.abs(this.y - this.baseY) * 0.03)

    if (!this.hasSprite) return

    this.updateWandering(delta)
  }

  private updateWandering(delta: number) {
    const state = this.wanderState

    if (state.pauseRemaining > 0) {
      state.pauseRemaining -= delta
      if (state.pauseRemaining <= 0) {
        this.startWandering()
      }
      return
    }

    if (!state.isWandering) return

    state.timer -= delta

    if (state.timer <= 0) {
      this.stopWandering()
      return
    }

    const speed = WANDER_SPEED
    let vx = 0
    let vy = 0

    switch (state.direction) {
      case "up":
        vy = -speed
        break
      case "down":
        vy = speed
        break
      case "left":
        vx = -speed
        break
      case "right":
        vx = speed
        break
    }

    this.setVelocity(vx, vy)

    const animKey = `world-npc-${this.id}`
    const directionKey = state.direction

    if (!this.anims.getName()?.includes(directionKey)) {
      this.play(`${animKey}-${directionKey}`, true)
    }

    const newX = this.x + vx * (delta / 1000)
    const newY = this.y + vy * (delta / 1000)

    if (newX <= 20 || newX >= 620 || newY <= 20 || newY >= 620) {
      const blockedDirection = state.direction
      const validDirections: Direction[] = ["up", "down", "left", "right"].filter((d) => {
        if (blockedDirection === "up") return d !== "down"
        if (blockedDirection === "down") return d !== "up"
        if (blockedDirection === "left") return d !== "right"
        if (blockedDirection === "right") return d !== "left"
        return true
      }) as Direction[]
      state.direction = Phaser.Math.RND.pick(validDirections)
      state.timer = Phaser.Math.Between(WALK_DURATION_MIN, WALK_DURATION_MAX)
      return
    }
  }

  private startWandering() {
    const state = this.wanderState
    state.isWandering = true
    state.direction = this.getRandomDirection()
    state.timer = Phaser.Math.Between(WALK_DURATION_MIN, WALK_DURATION_MAX)
  }

  public startWanderingPublic() {
    if (this.hasSprite && !this.wanderState.isWandering) {
      this.startWandering()
    }
  }

  private stopWandering() {
    const state = this.wanderState
    state.isWandering = false
    this.setVelocity(0, 0)
    state.pauseRemaining = Phaser.Math.Between(PAUSE_DURATION_MIN, PAUSE_DURATION_MAX)

    const animKey = `world-npc-${this.id}`
    this.play(`${animKey}-idle-${state.direction}`)
  }

  private getRandomDirection(): Direction {
    const directions: Direction[] = ["up", "down", "left", "right"]
    return Phaser.Math.RND.pick(directions)
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

  destroy(fromScene?: boolean) {
    this.shadow.destroy()
    super.destroy(fromScene)
  }
}