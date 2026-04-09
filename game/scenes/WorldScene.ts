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
  private buildings: BuildingZone[] = []
  private getJoystickInput: GetJoystickInput = () => ({ x: 0, y: 0, interact: false })
  private lastPersistAt = 0
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
    background.fillStyle(0x20140e, 1)
    background.fillRect(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)

    background.fillStyle(0x6f4d2a, 1)
    background.fillRect(304, 104, 32, 432)
    background.fillRect(104, 304, 432, 32)

    buildingData.forEach((building) => {
      background.fillStyle(building.color, 1)
      background.fillRoundedRect(
        building.x - building.width / 2,
        building.y - building.height / 2,
        building.width,
        building.height,
        12,
      )
      background.lineStyle(3, 0x28140c, 0.9)
      background.strokeRoundedRect(
        building.x - building.width / 2,
        building.y - building.height / 2,
        building.width,
        building.height,
        12,
      )
      this.add.text(building.x, building.y + building.height / 2 + 10, building.label, {
        color: "#f4dcb1",
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "15px",
      })
        .setOrigin(0.5, 0)
        .setDepth(4)
    })

    const glow = this.add.graphics()
    glow.fillStyle(0xffad42, 0.18)
    glow.fillCircle(320, 320, 90)
    glow.fillStyle(0xffd27b, 0.14)
    glow.fillCircle(320, 320, 44)

    const fire = this.add.sprite(320, 320, "world-fire")
      .setDepth(6)
      .setScale(1.1)

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
