import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"
import { buildingData } from "@/game/config/buildingData"
import { npcData } from "@/game/config/npcData"
import { BuildingZone } from "@/game/objects/BuildingZone"
import { NPC } from "@/game/objects/NPC"
import { Player } from "@/game/objects/Player"
import type { GetJoystickInput, PlayerPosition } from "@/game/types"

const WORLD_BOUNDS = {
  width: 640,
  height: 640,
}

type ActiveTarget =
  | {
      kind: "building"
      prompt: string
      sectionId: BuildingZone["sectionId"]
    }
  | {
      kind: "npc"
      lines: string[]
      npcId: string
      prompt: string
      speaker: string
    }

export class WorldScene extends Phaser.Scene {
  private readonly cleanupFns: Array<() => void> = []
  private buildingHalo?: Phaser.GameObjects.Ellipse
  private buildings: BuildingZone[] = []
  private getJoystickInput: GetJoystickInput = () => ({ x: 0, y: 0, interact: false })
  private lastPersistAt = 0
  private npcHalo?: Phaser.GameObjects.Ellipse
  private npcs: NPC[] = []
  private player?: Player
  private uiLocked = false

  constructor() {
    super("WorldScene")
  }

  create() {
    this.getJoystickInput = (this.registry.get("getJoystickInput") as GetJoystickInput | undefined) ?? this.getJoystickInput
    const initialPlayerPosition = (this.registry.get("initialPlayerPosition") as PlayerPosition | undefined) ?? {
      x: 320,
      y: 352,
    }

    this.uiLocked = Boolean(this.registry.get("initialUiLocked"))

    this.physics.world.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)
    this.cameras.main.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)
    this.cameras.main.setBackgroundColor("#0a0604")
    this.drawWorld()

    this.player = new Player(this, initialPlayerPosition.x, initialPlayerPosition.y, this.getJoystickInput)
    this.player.setControlsLocked(this.uiLocked)

    this.cameras.main.startFollow(this.player, true, 0.14, 0.14)

    this.buildings = buildingData.map((building) => new BuildingZone(this, building))
    this.npcs = npcData.map((npc) => new NPC(this, npc))
    this.buildingHalo = this.add.ellipse(0, 0, 94, 70, 0xffc56f, 0)
      .setDepth(5)
      .setStrokeStyle(2, 0xffd27b, 0.42)
      .setVisible(false)
    this.npcHalo = this.add.ellipse(0, 0, 42, 24, 0xffd27b, 0)
      .setDepth(7)
      .setStrokeStyle(2, 0xffd27b, 0.5)
      .setVisible(false)

    this.tweens.add({
      targets: [this.buildingHalo, this.npcHalo],
      alpha: { from: 0.35, to: 0.85 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    })

    const offSectionClosed = gameBridge.on("section-closed", () => this.unlockWorldUi())
    const offDialogueClosed = gameBridge.on("dialogue-closed", () => this.unlockWorldUi())
    this.cleanupFns.push(offSectionClosed, offDialogueClosed)

    this.registry.set(
      "promptText",
      this.uiLocked ? "" : "Use WASD or arrows to walk. Press E near a building or friend.",
    )

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupFns.forEach((cleanup) => cleanup())
      this.cleanupFns.length = 0
      this.persistPlayerPosition()
    })
  }

  update(time: number) {
    if (!this.player) return

    const { justInteracted } = this.player.updatePlayer()

    if (this.uiLocked) {
      if (time - this.lastPersistAt > 250) {
        this.lastPersistAt = time
        this.persistPlayerPosition()
      }
      return
    }

    const activeTarget = this.getActiveTarget()
    this.syncTargetHalo(activeTarget)
    this.registry.set(
      "promptText",
      activeTarget?.prompt ?? "Use WASD or arrows to walk. Press E near a building or friend.",
    )

    if (justInteracted && activeTarget) {
      this.uiLocked = true
      this.player.setControlsLocked(true)

      if (activeTarget.kind === "building") {
        gameBridge.emit("open-section", { sectionId: activeTarget.sectionId })
      } else {
        gameBridge.emit("open-dialogue", {
          isOpen: true,
          npcId: activeTarget.npcId,
          speaker: activeTarget.speaker,
          lines: activeTarget.lines,
          lineIndex: 0,
        })
      }
    }

    if (time - this.lastPersistAt > 250) {
      this.lastPersistAt = time
      this.persistPlayerPosition()
    }
  }

  private drawWorld() {
    const background = this.add.graphics()
    background.fillStyle(0x0a0604, 1)
    background.fillRect(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)
    background.fillStyle(0x1a120d, 1)
    background.fillRect(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)

    for (let x = 0; x < WORLD_BOUNDS.width; x += 16) {
      for (let y = 0; y < WORLD_BOUNDS.height; y += 16) {
        const variant = (x * 13 + y * 7) % 5
        background.fillStyle(variant === 0 ? 0x1f160f : 0x19110c, 1)
        background.fillRect(x, y, 16, 16)
        if (variant === 1) {
          background.fillStyle(0x3f2b19, 0.44)
          background.fillRect(x + 3, y + 11, 2, 2)
        }
        if (variant === 3) {
          background.fillStyle(0x2e2316, 0.6)
          background.fillRect(x + 10, y + 5, 2, 2)
        }
      }
    }

    background.fillStyle(0x4b331d, 1)
    background.fillRoundedRect(298, 100, 44, 440, 12)
    background.fillRoundedRect(100, 298, 440, 44, 12)
    background.fillStyle(0x7d5730, 0.5)
    background.fillRoundedRect(306, 108, 28, 424, 8)
    background.fillRoundedRect(108, 306, 424, 28, 8)

    buildingData.forEach((building) => {
      const left = building.x - building.width / 2
      const top = building.y - building.height / 2
      const right = building.x + building.width / 2
      const baseTop = top + 14

      background.fillStyle(0x080403, 0.28)
      background.fillRoundedRect(left - 4, baseTop + 6, building.width + 8, building.height - 8, 14)
      background.fillStyle(0x2a150d, 1)
      background.fillTriangle(left - 8, baseTop + 8, building.x, top - 16, right + 8, baseTop + 8)
      background.fillStyle(building.color, 1)
      background.fillRoundedRect(
        left,
        baseTop,
        building.width,
        building.height - 12,
        12,
      )
      background.fillStyle(0x120907, 0.34)
      background.fillRoundedRect(left + 8, baseTop + 8, building.width - 16, 10, 5)
      background.lineStyle(3, 0x28140c, 0.9)
      background.strokeRoundedRect(left, baseTop, building.width, building.height - 12, 12)
      background.fillStyle(0xf4c46d, 0.88)
      background.fillRoundedRect(left + 16, baseTop + 18, 13, 15, 3)
      background.fillRoundedRect(right - 29, baseTop + 18, 13, 15, 3)
      background.fillStyle(0x21110b, 1)
      background.fillRoundedRect(building.x - 9, baseTop + 34, 18, 26, 5)
      background.fillStyle(0xffc56f, 0.72)
      background.fillCircle(building.x + 5, baseTop + 46, 2)
      background.fillStyle(0xffbd65, 0.18)
      background.fillCircle(building.x, baseTop + 46, 24)
      this.drawBuildingMark(background, building.id, building.x, baseTop + 26)
      this.add.text(building.x, building.y + building.height / 2 + 10, building.label, {
        color: "#f4dcb1",
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "15px",
      })
        .setOrigin(0.5, 0)
        .setDepth(4)
    })

    const glow = this.add.graphics()
    glow.fillStyle(0xffad42, 0.2)
    glow.fillCircle(320, 320, 102)
    glow.fillStyle(0xffd27b, 0.16)
    glow.fillCircle(320, 320, 52)

    const fire = this.add.sprite(320, 320, "world-fire")
      .setDepth(6)
      .setScale(1.1)

    for (let index = 0; index < 7; index += 1) {
      const spark = this.add.sprite(312 + index * 3, 306 + (index % 3) * 3, "world-spark")
        .setDepth(7)
        .setAlpha(0.35)
      this.tweens.add({
        targets: spark,
        alpha: { from: 0.35, to: 0 },
        duration: 850 + index * 120,
        repeat: -1,
        y: spark.y - 18,
        delay: index * 120,
        onRepeat: () => {
          spark.setPosition(308 + ((index * 11) % 24), 313 + (index % 2) * 3)
          spark.setAlpha(0.35)
        },
      })
    }

    this.tweens.add({
      targets: fire,
      alpha: { from: 0.72, to: 1 },
      duration: 820,
      yoyo: true,
      repeat: -1,
    })
    this.tweens.add({
      targets: fire,
      scale: { from: 1.04, to: 1.18 },
      duration: 860,
      yoyo: true,
      repeat: -1,
    })
  }

  private getActiveTarget(): ActiveTarget | null {
    if (!this.player) return null

    for (const building of this.buildings) {
      if (building.overlaps(this.player)) {
        return {
          kind: "building",
          prompt: building.prompt,
          sectionId: building.sectionId,
        }
      }
    }

    let nearestNpc: NPC | null = null
    let nearestDistance = Number.POSITIVE_INFINITY

    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y)
      if (distance < 52 && distance < nearestDistance) {
        nearestDistance = distance
        nearestNpc = npc
      }
    }

    if (!nearestNpc) return null

    return {
      kind: "npc",
      npcId: nearestNpc.id,
      speaker: nearestNpc.displayName,
      lines: nearestNpc.dialogueLines,
      prompt: `Press E to talk to ${nearestNpc.displayName}`,
    }
  }

  private drawBuildingMark(graphics: Phaser.GameObjects.Graphics, id: string, x: number, y: number) {
    graphics.lineStyle(2, 0xffdf9a, 0.9)
    graphics.fillStyle(0xffdf9a, 0.9)

    if (id === "library") {
      graphics.strokeRect(x - 10, y - 5, 8, 10)
      graphics.strokeRect(x + 2, y - 5, 8, 10)
      graphics.lineBetween(x, y - 5, x, y + 6)
      return
    }

    if (id === "workshop") {
      graphics.lineBetween(x - 9, y + 6, x + 7, y - 8)
      graphics.strokeCircle(x + 9, y - 9, 4)
      graphics.lineBetween(x + 3, y - 2, x + 11, y + 6)
      return
    }

    if (id === "tavern") {
      graphics.strokeRoundedRect(x - 8, y - 5, 16, 10, 3)
      graphics.lineBetween(x + 8, y - 1, x + 13, y - 1)
      graphics.lineBetween(x - 4, y + 5, x + 4, y + 5)
      return
    }

    graphics.strokeRect(x - 10, y - 6, 20, 12)
    graphics.lineBetween(x - 10, y - 6, x, y + 1)
    graphics.lineBetween(x + 10, y - 6, x, y + 1)
  }

  private syncTargetHalo(activeTarget: ActiveTarget | null) {
    this.buildingHalo?.setVisible(false)
    this.npcHalo?.setVisible(false)

    if (!activeTarget) return

    if (activeTarget.kind === "building") {
      const building = this.buildings.find((candidate) => candidate.sectionId === activeTarget.sectionId)
      if (!building || !this.buildingHalo) return
      this.buildingHalo
        .setPosition(building.x, building.y + building.height * 0.36)
        .setSize(building.width + 18, building.height * 0.75)
        .setVisible(true)
      return
    }

    const npc = this.npcs.find((candidate) => candidate.id === activeTarget.npcId)
    if (!npc || !this.npcHalo) return
    this.npcHalo
      .setPosition(npc.x, npc.y + 12)
      .setVisible(true)
  }

  private persistPlayerPosition() {
    if (!this.player) return
    gameBridge.emit("player-position", {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    })
  }

  private unlockWorldUi() {
    this.uiLocked = false
    this.player?.setControlsLocked(false)
  }
}
