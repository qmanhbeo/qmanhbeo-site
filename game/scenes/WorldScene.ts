import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"
import { buildingData } from "@/game/config/buildingData"
import { npcData } from "@/game/config/npcData"
import { BuildingZone } from "@/game/objects/BuildingZone"
import { NPC } from "@/game/objects/NPC"
import { Player } from "@/game/objects/Player"
import type { GetJoystickInput, PlayerPosition } from "@/game/types"

const WORLD_BOUNDS = {
  width: 2400,
  height: 1800,
}

const BUILDING_OFFSET = { x: 880, y: 580 }

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
      x: 1200,
      y: 900,
    }

    this.uiLocked = Boolean(this.registry.get("initialUiLocked"))

    this.physics.world.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)
    this.cameras.main.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)
    this.cameras.main.setBackgroundColor("#0a0604")
    this.drawWorld()

    this.player = new Player(this, initialPlayerPosition.x, initialPlayerPosition.y, this.getJoystickInput)
    this.player.setControlsLocked(this.uiLocked)

    const cam = this.cameras.main
    cam.startFollow(this.player, false)

    const viewportWidth = cam.width
    const viewportHeight = cam.height
    const deadzoneW = Math.floor(viewportWidth * 0.55)
    const deadzoneH = Math.floor(viewportHeight * 0.45)
    cam.setDeadzone(deadzoneW, deadzoneH)

    this.scale.on("resize", (newSize: { width: number; height: number }) => {
      cam.setViewport(0, 0, newSize.width, newSize.height)
      cam.setDeadzone(
        Math.floor(newSize.width * 0.55),
        Math.floor(newSize.height * 0.45)
      )
    })

    this.buildings = buildingData.map((building) => new BuildingZone(this, building))
    this.npcs = npcData.map((npc) => new NPC(this, npc))

    this.time.delayedCall(2000, () => {
      this.npcs.forEach((npc) => {
        if (npc.hasSprite) {
          npc.startWanderingPublic()
        }
      })
    })

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

    this.registry.set("promptText", "")

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupFns.forEach((cleanup) => cleanup())
      this.cleanupFns.length = 0
      this.persistPlayerPosition()
      this.scale.off("resize")
    })
  }

  update(time: number) {
    if (!this.player) return

    const { justInteracted } = this.player.updatePlayer()

    if (this.uiLocked) {
      this.syncTargetHalo(null)
      this.registry.set("promptText", "")
      if (time - this.lastPersistAt > 250) {
        this.lastPersistAt = time
        this.persistPlayerPosition()
      }
      return
    }

    const activeTarget = this.getActiveTarget()
    this.syncTargetHalo(activeTarget)
    this.registry.set("promptText", activeTarget?.prompt ?? "")

    if (justInteracted && activeTarget) {
      this.uiLocked = true
      this.player.setControlsLocked(true)
      this.syncTargetHalo(null)
      this.registry.set("promptText", "")

      if (activeTarget.kind === "building") {
        gameBridge.emit("world-sfx", { cue: "panel-open" })
        gameBridge.emit("open-section", { sectionId: activeTarget.sectionId })
      } else {
        gameBridge.emit("world-sfx", { cue: "dialogue-open" })
        const soundCue = activeTarget.npcId === "tungtung" ? "tung-tung-sahur" : undefined
        gameBridge.emit("open-dialogue", {
          isOpen: true,
          npcId: activeTarget.npcId,
          speaker: activeTarget.speaker,
          lines: activeTarget.lines,
          lineIndex: 0,
          soundCue,
        })
      }
    }

    if (time - this.lastPersistAt > 250) {
      this.lastPersistAt = time
      this.persistPlayerPosition()
    }
  }

  private drawWorld() {
    // Use procedural rendering for everything - no tilemap
    this.drawProceduralWorld()
  }

  private drawTilemapWorld() {
    if (!this.textures.exists("world-tiles") || !this.cache.tilemap.exists("world-map")) return false

    const map = this.make.tilemap({ key: "world-map" })
    const tileset = map.addTilesetImage("tiny-town", "world-tiles", 16, 16, 0, 0)
    if (!tileset) return false

    const groundLayer = map.createLayer("ground", tileset, 0, 0)?.setDepth(0)
    const pathLayer = map.createLayer("path", tileset, 0, 0)?.setDepth(1)
    const buildingLayer = map.createLayer("buildings", tileset, 0, 0)?.setDepth(2)
    const decorLayer = map.createLayer("decor", tileset, 0, 0)?.setDepth(3)

    if (!groundLayer || !pathLayer || !buildingLayer || !decorLayer) return false

    this.drawBuildingOverlays()
    this.drawCampfire()
    return true
  }

  private drawProceduralWorld() {
    const centerX = 1200
    const centerY = 900
    const offsetX = BUILDING_OFFSET.x
    const offsetY = BUILDING_OFFSET.y

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

    // Draw village paths centered at the new campfire position
    const pathWidth = 44
    const pathLength = 440
    const pathInnerWidth = 28

    // Vertical path (north-south)
    background.fillStyle(0x4b331d, 1)
    background.fillRoundedRect(centerX - pathWidth / 2, centerY - pathLength / 2, pathWidth, pathLength, 12)
    background.fillStyle(0x7d5730, 0.5)
    background.fillRoundedRect(centerX - pathInnerWidth / 2, centerY - (pathLength - 24) / 2, pathInnerWidth, pathLength - 24, 8)

    // Horizontal path (west-east)
    background.fillStyle(0x4b331d, 1)
    background.fillRoundedRect(centerX - pathLength / 2, centerY - pathWidth / 2, pathLength, pathWidth, 12)
    background.fillStyle(0x7d5730, 0.5)
    background.fillRoundedRect(centerX - (pathLength - 24) / 2, centerY - pathInnerWidth / 2, pathLength - 24, pathInnerWidth, 8)

    buildingData.forEach((building) => {
      if (building.id === "library" && this.textures.exists("building-library")) {
        const sprite = this.add.sprite(building.x, building.y + 35, "building-library")
        sprite.setOrigin(0.5, 1)
        sprite.setScale(0.08)
        sprite.setDepth(2)
        this.add.text(building.x, building.y + building.height / 2 + 20, building.label, {
          color: "#f4dcb1",
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "15px",
        })
          .setOrigin(0.5, 0)
          .setDepth(4)
        return
      }

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

    this.drawCampfire()
  }

  private drawBuildingOverlays() {
    const overlay = this.add.graphics().setDepth(4)
    buildingData.forEach((building) => {
      const top = building.y - building.height / 2
      const baseTop = top + 14
      this.drawBuildingMark(overlay, building.id, building.x, baseTop + 26)
      this.add.text(building.x, building.y + building.height / 2 + 10, building.label, {
        color: "#f4dcb1",
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "15px",
      })
        .setOrigin(0.5, 0)
        .setDepth(4)
    })
  }

  private drawCampfire() {
    const campfireX = 1200
    const campfireY = 900

    const glow = this.add.graphics()
      .setDepth(4)
    glow.fillStyle(0xffad42, 0.2)
    glow.fillCircle(campfireX, campfireY, 102)
    glow.fillStyle(0xffd27b, 0.16)
    glow.fillCircle(campfireX, campfireY, 52)

    const fire = this.add.sprite(campfireX, campfireY, "world-fire")
      .setDepth(6)
      .setScale(1.1)

    for (let index = 0; index < 7; index += 1) {
      const spark = this.add.sprite(campfireX - 8 + index * 3, campfireY - 14 + (index % 3) * 3, "world-spark")
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
          spark.setPosition(campfireX - 4 + ((index * 11) % 24), campfireY - 9 + (index % 2) * 3)
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
