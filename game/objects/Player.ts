import Phaser from "phaser"
import type { GetJoystickInput } from "@/game/types"

const PLAYER_SPEED = 132

export class Player extends Phaser.Physics.Arcade.Sprite {
  private controlsLocked = false
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null
  private letterKeys: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    interact: Phaser.Input.Keyboard.Key
    alternateInteract: Phaser.Input.Keyboard.Key
  } | null
  private lastInteractPressed = false
  private readonly shadow: Phaser.GameObjects.Ellipse
  private walkBobPhase = 0

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly getJoystickInput: GetJoystickInput) {
    super(scene, x, y, "world-player")

    this.shadow = scene.add.ellipse(x, y + 12, 19, 7, 0x000000, 0.32)
      .setDepth(9)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(18, 18)
    body.setCollideWorldBounds(true)

    this.setCollideWorldBounds(true)
    this.setDepth(10)
    this.setOrigin(0.5, 0.5)

    const keyboard = scene.input.keyboard
    this.cursors = keyboard?.createCursorKeys() ?? null
    this.letterKeys = keyboard
      ? {
          up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
          interact: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
          alternateInteract: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        }
      : null
  }

  setControlsLocked(nextLocked: boolean) {
    this.controlsLocked = nextLocked
    if (nextLocked) {
      this.setVelocity(0, 0)
    }
  }

  updatePlayer() {
    const joystick = this.getJoystickInput()

    let axisX = 0
    let axisY = 0

    if (!this.controlsLocked) {
      const upPressed = this.cursors?.up.isDown || this.letterKeys?.up.isDown
      const downPressed = this.cursors?.down.isDown || this.letterKeys?.down.isDown
      const leftPressed = this.cursors?.left.isDown || this.letterKeys?.left.isDown
      const rightPressed = this.cursors?.right.isDown || this.letterKeys?.right.isDown

      axisX = (rightPressed ? 1 : 0) - (leftPressed ? 1 : 0) + joystick.x
      axisY = (downPressed ? 1 : 0) - (upPressed ? 1 : 0) + joystick.y
    }

    const direction = new Phaser.Math.Vector2(axisX, axisY)
    if (direction.lengthSq() > 1) direction.normalize()

    this.setVelocity(direction.x * PLAYER_SPEED, direction.y * PLAYER_SPEED)

    const isMoving = direction.lengthSq() > 0

    if (direction.x !== 0) {
      this.setFlipX(direction.x < 0)
    }

    if (isMoving) {
      this.walkBobPhase += 0.32
      this.setScale(1, 1 + Math.sin(this.walkBobPhase) * 0.045)
      this.setAngle(Math.sin(this.walkBobPhase * 0.5) * 1.6)
    } else {
      this.walkBobPhase = 0
      this.setScale(1, 1)
      this.setAngle(0)
    }

    const interactPressed = Boolean(
      joystick.interact
      || this.letterKeys?.interact.isDown
      || this.letterKeys?.alternateInteract.isDown,
    )
    const justInteracted = interactPressed && !this.lastInteractPressed
    this.lastInteractPressed = interactPressed

    return {
      justInteracted,
      moving: isMoving,
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta)
    this.shadow.setPosition(this.x, this.y + 12)
  }

  destroy(fromScene?: boolean) {
    this.shadow.destroy()
    super.destroy(fromScene)
  }
}
