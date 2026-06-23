import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"
import { EnvironmentManager } from "@/game/EnvironmentManager"
import { buildingData } from "@/game/config/buildingData"
import { npcData } from "@/game/config/npcData"
import {
  WORLD_DECORATION_FRAMES,
  WORLD_DECORATION_TEXTURE_KEY,
  WORLD_DEPTHS,
  WORLD_GROUND_TEXTURES,
  WORLD_GROUND_TILE_SIZE,
  WORLD_VISUAL_DEBUG,
} from "@/game/config/worldVisualAssets"
import { getBuildingLabelStyle } from "@/game/labelUtils"
import { BuildingZone } from "@/game/objects/BuildingZone"
import { NPC } from "@/game/objects/NPC"
import { Player } from "@/game/objects/Player"
import type { GetJoystickInput, PlayerPosition } from "@/game/types"

const WORLD_BOUNDS = {
  width: 2400,
  height: 1800,
}

function getResponsiveCameraZoom(viewportWidth: number, viewportHeight: number): number {
  const isMobile = viewportWidth < 768 || viewportHeight < 700
  if (isMobile) return 1

  const baseZoom = Math.min(viewportWidth / 1100, viewportHeight / 720)
  const clampedZoom = Math.min(Math.max(baseZoom, 1), 1.8)

  // Prevent extreme browser zoom-out / huge CSS viewports from showing beyond WORLD_BOUNDS.
  // Phaser zoom is pixels-per-world-unit, so higher zoom means seeing less of the world.
  const minZoomToAvoidVoid = Math.max(
    viewportWidth / WORLD_BOUNDS.width,
    viewportHeight / WORLD_BOUNDS.height,
  )

  return Math.max(clampedZoom, minZoomToAvoidVoid)
}

const WORLD_CENTER = { x: 1200, y: 900 } as const
const PATH_TILE_LENGTH = WORLD_GROUND_TILE_SIZE * 7
const PATH_TILE_WIDTH = WORLD_GROUND_TILE_SIZE
const DECORATION_CANDIDATE_STEP = WORLD_GROUND_TILE_SIZE
const DECORATION_PLACEMENT_THRESHOLD = 45

type WorldRect = {
  height: number
  left: number
  top: number
  width: number
}

type PathOrientation = "horizontal" | "vertical"
type DecorationRejectReason = "building" | "campfire" | "npcSpawn" | "path" | "playerSpawn"
type DecorationSpec = {
  frame: number
  x: number
  y: number
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

function logWorldVisualDebug(message: string, payload?: Record<string, unknown>) {
  if (!WORLD_VISUAL_DEBUG) return
  console.info(`[WorldScene] ${message}`, payload ?? "")
}

function getVillagePathRects() {
  return {
    horizontal: {
      left: WORLD_CENTER.x - PATH_TILE_LENGTH / 2,
      top: WORLD_CENTER.y - PATH_TILE_WIDTH / 2,
      width: PATH_TILE_LENGTH,
      height: PATH_TILE_WIDTH,
    },
    vertical: {
      left: WORLD_CENTER.x - PATH_TILE_WIDTH / 2,
      top: WORLD_CENTER.y - PATH_TILE_LENGTH / 2,
      width: PATH_TILE_WIDTH,
      height: PATH_TILE_LENGTH,
    },
  } satisfies Record<PathOrientation, WorldRect>
}

function containsPoint(rect: WorldRect, x: number, y: number, padding = 0) {
  return (
    x >= rect.left - padding
    && x <= rect.left + rect.width + padding
    && y >= rect.top - padding
    && y <= rect.top + rect.height + padding
  )
}

function distanceSquared(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2
  const dy = y1 - y2
  return dx * dx + dy * dy
}

function stableTileHash(tileX: number, tileY: number, salt = 0) {
  let hash = Math.imul(tileX + salt * 101, 374761393) ^ Math.imul(tileY - salt * 53, 668265263)
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177)
  return (hash ^ (hash >>> 16)) >>> 0
}

export class WorldScene extends Phaser.Scene {
  private readonly cleanupFns: Array<() => void> = []
  private buildingHalo?: Phaser.GameObjects.Ellipse
  private buildings: BuildingZone[] = []
  private environment?: EnvironmentManager
  private getJoystickInput: GetJoystickInput = () => ({ x: 0, y: 0, interact: false })
  private lastPersistAt = 0
  private npcHalo?: Phaser.GameObjects.Ellipse
  private npcs: NPC[] = []
  private player?: Player
  private uiLocked = false
  private bardIsPlaying = false
  private isGatheringActive = false
  private gatheringBardMuted = false
  private pendingGatheringStart = false
  private gatheringCheckTimer?: Phaser.Time.TimerEvent
  private guideState: "idle" | "leading" | "arrived" = "idle"
  private guideDestination: { x: number; y: number; description: string; label: string } | null = null
  private guideArrivalTime = 0
  private manhNpc: NPC | null = null
  private readonly GUIDE_DESTINATIONS: Record<string, { x: number; y: number; description: string; label: string }> = {
    "manh-guide-workshop": {
      x: 1340, y: 860,
      label: "Workshop",
      description: "The Workshop \u2014 this is where the built things live. Every prototype, every experiment, every half-baked idea that turned into something real.",
    },
    "manh-guide-library": {
      x: 1060, y: 860,
      label: "Library",
      description: "The Library \u2014 research notes, publications, and the longer trails of thought. Some paths are walked in words.",
    },
    "manh-guide-yard": {
      x: 1060, y: 960,
      label: "Yard",
      description: "The Yard \u2014 campfire thoughts, personal notes, and loose pages. The informal side of things.",
    },
    "manh-guide-post": {
      x: 1340, y: 1050,
      label: "Post",
      description: "The Post \u2014 this is where the paths cross. Drop a letter if you want to reach the real Manh. The words you write will find their way.",
    },
  }
  private readonly GATHERING_DESTINATIONS: Record<string, { x: number; y: number; dir: "up" | "down" | "left" | "right" }> = {
    manh: { x: 1168, y: 844, dir: "down" },
    tungtung: { x: 1233, y: 844, dir: "down" },
    hachimi: { x: 1168, y: 956, dir: "up" },
    alex: { x: 1135, y: 900, dir: "right" },
    adam: { x: 1265, y: 900, dir: "left" },
    avery: { x: 1200, y: 956, dir: "up" },
  }
  private buildingLabelStyle!: Phaser.Types.GameObjects.Text.TextStyle
  private buildingLabels: Phaser.GameObjects.Text[] = []

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

    // Resolve font before drawWorld (which creates building labels).
    this.buildingLabelStyle = getBuildingLabelStyle()
    this.buildingLabels = []

    this.drawWorld()

    this.player = new Player(this, initialPlayerPosition.x, initialPlayerPosition.y, this.getJoystickInput)
    this.player.setControlsLocked(this.uiLocked)

    const cam = this.cameras.main
    cam.startFollow(this.player, false)

    const viewportWidth = cam.width
    const viewportHeight = cam.height
    const cameraZoom = getResponsiveCameraZoom(viewportWidth, viewportHeight)
    cam.setZoom(cameraZoom)

    const deadzoneW = Math.floor(viewportWidth * 0.55)
    const deadzoneH = Math.floor(viewportHeight * 0.45)
    cam.setDeadzone(deadzoneW, deadzoneH)

    this.environment = new EnvironmentManager(this)
    this.environment.create()

    const handleResize = (newSize: { width: number; height: number }) => {
      cam.setViewport(0, 0, newSize.width, newSize.height)
      cam.setZoom(getResponsiveCameraZoom(newSize.width, newSize.height))
      cam.setDeadzone(
        Math.floor(newSize.width * 0.55),
        Math.floor(newSize.height * 0.45)
      )
    }

    this.scale.on("resize", handleResize)

    this.buildings = buildingData.map((building) => new BuildingZone(this, building))
    this.npcs = npcData.map((npc) => new NPC(this, npc))

    this.time.delayedCall(2000, () => {
      if (this.isGatheringActive) return
      this.npcs.forEach((npc) => {
        if (npc.id === "bard") return
        if (npc.hasSprite) {
          npc.startWanderingPublic()
        }
      })
    })

    const bard = this.npcs.find((n) => n.id === "bard")
    if (bard) {
      this.setupBardBehavior(bard)
    }

    const manhNpc = this.npcs.find((n) => n.id === "manh")
    if (manhNpc) {
      this.setupManhBehavior(manhNpc)
    }

    this.checkGatheringTime()
    this.gatheringCheckTimer = this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: () => this.checkGatheringTime(),
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
    const offDialogueClosed = gameBridge.on("dialogue-closed", () => {
      this.unlockWorldUi()
      if (!this.isGatheringActive) {
        for (const npc of this.npcs) {
          if (npc.hasSprite) npc.resumeWandering()
        }
      }
      if (this.guideState === "arrived") {
        this.guideState = "idle"
        this.guideDestination = null
        this.manhNpc?.startWanderingPublic()
        this.leadManhToGathering()
      }
      if (this.pendingGatheringStart) {
        this.pendingGatheringStart = false
        this.startCampfireGathering(false)
      }
    })
    this.cleanupFns.push(offSectionClosed, offDialogueClosed)

    this.registry.set("promptText", "")

    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-ONE", () => this.environment?.handleKeyDown("1"))
      this.input.keyboard.on("keydown-TWO", () => this.environment?.handleKeyDown("2"))
      this.input.keyboard.on("keydown-THREE", () => this.environment?.handleKeyDown("3"))
      this.input.keyboard.on("keydown-FOUR", () => this.environment?.handleKeyDown("4"))
    }

    // Re-render building labels once the font file is loaded.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        for (const label of this.buildingLabels) {
          label.updateText()
        }
      })
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupFns.forEach((cleanup) => cleanup())
      this.cleanupFns.length = 0
      this.gatheringCheckTimer?.destroy()
      this.persistPlayerPosition()
      this.scale.off("resize", handleResize)
      this.environment?.destroy()
    })
  }

  update(time: number) {
    if (!this.player) return

    this.environment?.update(time)

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

    if (this.guideState === "leading" && this.manhNpc?.hasArrivedAtTarget()) {
      this.guideState = "arrived"
      this.guideArrivalTime = time
      this.manhNpc.stopLeading()
    }

    if (this.guideState === "arrived" && time - this.guideArrivalTime > 30000) {
      this.guideState = "idle"
      this.guideDestination = null
      this.manhNpc?.startWanderingPublic()
      this.leadManhToGathering()
    }

    if (justInteracted && activeTarget) {
      this.uiLocked = true
      this.player.setControlsLocked(true)
      if (this.input.keyboard) {
        this.input.keyboard.enabled = false
        this.input.keyboard.disableGlobalCapture()
      }
      this.syncTargetHalo(null)
      this.registry.set("promptText", "")

      if (activeTarget.kind === "building") {
        gameBridge.emit("world-sfx", { cue: "panel-open" })
        gameBridge.emit("open-section", { sectionId: activeTarget.sectionId })
      } else {
        gameBridge.emit("world-sfx", { cue: "dialogue-open" })

        const targetNpc = this.npcs.find((n) => n.id === activeTarget.npcId)
        if (targetNpc?.hasSprite && !this.isGatheringActive) targetNpc.pauseWandering()

        if (this.isGatheringActive && activeTarget.npcId !== "bard") {
          const npcEntry = npcData.find((n) => n.id === activeTarget.npcId)
          if (npcEntry?.gatheringDialogueLines?.length) {
            gameBridge.emit("open-dialogue", {
              isOpen: true,
              npcId: activeTarget.npcId,
              speaker: activeTarget.speaker,
              lines: npcEntry.gatheringDialogueLines,
              lineIndex: 0,
              choices: [{ id: "gathering-thanks", label: "...", nextLines: [] }],
            })
            return
          }
        }

        if (activeTarget.npcId === "bard") {
          if (this.isGatheringActive) {
            gameBridge.emit("open-dialogue", {
              isOpen: true,
              npcId: "bard",
              speaker: "Bard",
              lines: this.gatheringBardMuted
                ? ["The fire crackles in the silence..."]
                : ["The melody dances with the flames... but if you need quiet, just say the word."],
              lineIndex: 0,
              choices: this.gatheringBardMuted
                ? [
                    { id: "bard-unmute", label: "(Unmute the music)", nextLines: ["The melody picks up where it left off..."] },
                    { id: "gathering-thanks", label: "...", nextLines: [] },
                  ]
                : [
                    { id: "bard-mute", label: "(I'd rather have quiet)", nextLines: ["The fire crackles in the silence instead."] },
                    { id: "gathering-thanks", label: "Keep playing", nextLines: [] },
                  ],
            })
          } else if (this.bardIsPlaying) {
            gameBridge.emit("open-dialogue", {
              isOpen: true,
              npcId: "bard",
              speaker: "Bard",
              lines: ["The melody dances with the flames..."],
              lineIndex: 0,
              choices: [
                { id: "bard-thanks", label: "♫ Thank you, that\u2019s enough", nextLines: ["The fire will remember the song.", "Until next time, wanderer."] },
                { id: "bard-keep", label: "Keep playing", nextLines: [] },
              ],
            })
          } else {
            gameBridge.emit("open-dialogue", {
              isOpen: true,
              npcId: "bard",
              speaker: "Bard",
              lines: ["Care for a tune?"],
              lineIndex: 0,
              choices: [
                { id: "bard-hear", label: "\u266A Hear a tune", nextLines: ["\u266A (The Bard plays a gentle melody on the lute)", "A melody for the fire-lit soul.", "May it warm your travels."] },
                { id: "bard-later", label: "Maybe later", nextLines: ["Another time, wanderer.", "The fire will still be here."] },
              ],
            })
          }
        } else if (activeTarget.npcId === "manh") {
          if (this.guideState === "idle") {
            gameBridge.emit("open-dialogue", {
              isOpen: true,
              npcId: "manh",
              speaker: "Manh",
              lines: ["Welcome to the Hearth! Wander as you like."],
              lineIndex: 0,
              choices: [
                { id: "manh-show-around", label: "Show me around!", nextLines: ["Curious about my work? There's plenty to see..."] },
                { id: "manh-goodbye", label: "Just wandering", nextLines: [] },
              ],
            })
          } else if (this.guideState === "arrived" && this.guideDestination) {
            gameBridge.emit("open-dialogue", {
              isOpen: true,
              npcId: "manh",
              speaker: "Manh",
              lines: [this.guideDestination.description],
              lineIndex: 0,
            })
          } else {
            this.unlockWorldUi()
            return
          }
        } else {
          const soundCue = activeTarget.npcId === "tungtung" ? "tung-tung-sahur" : activeTarget.npcId === "hachimi" ? "hachimi" : undefined
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
    }

    if (time - this.lastPersistAt > 250) {
      this.lastPersistAt = time
      this.persistPlayerPosition()
    }
  }

  private drawWorld() {
    if (this.hasNormalizedGroundTextures()) {
      this.drawTiledVillageWorld()
      return
    }

    this.drawProceduralWorld()
  }

  private hasNormalizedGroundTextures() {
    return Object.values(WORLD_GROUND_TEXTURES).every((textureKey) => this.textures.exists(textureKey))
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

  private drawTiledVillageWorld() {
    const groundLayer = this.add.renderTexture(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height)
      .setOrigin(0, 0)
      .setDepth(WORLD_DEPTHS.ground)

    const grassTiles = this.drawGrassTiles(groundLayer)
    const pathTiles = this.drawPathTiles(groundLayer)
    const decorationStats = this.drawGroundDecorations()

    this.drawVillageBuildings()
    this.drawCampfire()
    this.drawForest()

    logWorldVisualDebug("tiled village rendered", {
      grassTiles,
      pathTiles,
      decorationStats,
    })
  }

  private drawGrassTiles(groundLayer: Phaser.GameObjects.RenderTexture) {
    const columns = Math.ceil(WORLD_BOUNDS.width / WORLD_GROUND_TILE_SIZE)
    const rows = Math.ceil(WORLD_BOUNDS.height / WORLD_GROUND_TILE_SIZE)
    let placed = 0

    for (let tileX = 0; tileX < columns; tileX += 1) {
      for (let tileY = 0; tileY < rows; tileY += 1) {
        const x = tileX * WORLD_GROUND_TILE_SIZE
        const y = tileY * WORLD_GROUND_TILE_SIZE
        const variant = stableTileHash(tileX, tileY, 17) % 11
        const textureKey = variant < 6 ? WORLD_GROUND_TEXTURES.grass1 : WORLD_GROUND_TEXTURES.grass2
        groundLayer.drawFrame(textureKey, undefined, x, y)
        placed += 1
      }
    }

    return placed
  }

  private drawPathTiles(groundLayer: Phaser.GameObjects.RenderTexture) {
    const pathRects = getVillagePathRects()

    return (
      this.drawPathRectangle(groundLayer, pathRects.vertical, "vertical")
      + this.drawPathRectangle(groundLayer, pathRects.horizontal, "horizontal")
    )
  }

  private drawPathRectangle(
    groundLayer: Phaser.GameObjects.RenderTexture,
    rect: WorldRect,
    orientation: PathOrientation,
  ) {
    const columns = Math.round(rect.width / WORLD_GROUND_TILE_SIZE)
    const rows = Math.round(rect.height / WORLD_GROUND_TILE_SIZE)
    let placed = 0

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const textureKey = this.getPathTextureForCell(column, row, columns, rows, orientation)
        groundLayer.drawFrame(
          textureKey,
          undefined,
          rect.left + column * WORLD_GROUND_TILE_SIZE,
          rect.top + row * WORLD_GROUND_TILE_SIZE,
        )
        placed += 1
      }
    }

    return placed
  }

  private getPathTextureForCell(
    column: number,
    row: number,
    columns: number,
    rows: number,
    orientation: PathOrientation,
  ) {
    const isEdge = column === 0 || column === columns - 1 || row === 0 || row === rows - 1
    if (isEdge) {
      return stableTileHash(column, row, 17) < 6
        ? WORLD_GROUND_TEXTURES.grass1
        : WORLD_GROUND_TEXTURES.grass2
    }

    return orientation === "horizontal"
      ? WORLD_GROUND_TEXTURES.pathHorizontal
      : WORLD_GROUND_TEXTURES.pathVertical
  }

  private drawGroundDecorations() {
    if (!this.textures.exists(WORLD_DECORATION_TEXTURE_KEY)) {
      return {
        placed: 0,
        rejected: {
          building: 0,
          campfire: 0,
          npcSpawn: 0,
          path: 0,
          playerSpawn: 0,
        },
      }
    }

    const decorationLayer = this.add.layer()
      .setDepth(WORLD_DEPTHS.decorations)
    const rejected: Record<DecorationRejectReason, number> = {
      building: 0,
      campfire: 0,
      npcSpawn: 0,
      path: 0,
      playerSpawn: 0,
    }
    let placed = 0

    for (let x = WORLD_GROUND_TILE_SIZE / 2; x < WORLD_BOUNDS.width; x += DECORATION_CANDIDATE_STEP) {
      for (let y = WORLD_GROUND_TILE_SIZE / 2; y < WORLD_BOUNDS.height; y += DECORATION_CANDIDATE_STEP) {
        const tileX = Math.floor(x / WORLD_GROUND_TILE_SIZE)
        const tileY = Math.floor(y / WORLD_GROUND_TILE_SIZE)
        const placementHash = stableTileHash(tileX, tileY, 41)
        if (placementHash % 1000 >= DECORATION_PLACEMENT_THRESHOLD) continue

        const offsetHash = stableTileHash(tileX, tileY, 73)
        const decorationX = x + (offsetHash % 13) - 6
        const decorationY = y + (Math.floor(offsetHash / 13) % 13) - 6
        const rejectReason = this.getDecorationRejectReason(decorationX, decorationY)

        if (rejectReason) {
          rejected[rejectReason] += 1
          continue
        }

        const frame = this.getDecorationFrame(placementHash)
        this.addDecorationSprite(decorationLayer, {
          frame,
          x: decorationX,
          y: decorationY,
        })
        placed += 1
      }
    }

    for (const decoration of this.getFixedVillageDecorations()) {
      const rejectReason = this.getDecorationRejectReason(decoration.x, decoration.y)
      if (rejectReason) {
        rejected[rejectReason] += 1
        continue
      }
      this.addDecorationSprite(decorationLayer, decoration)
      placed += 1
    }

    return {
      placed,
      rejected,
    }
  }

  private addDecorationSprite(layer: Phaser.GameObjects.Layer, decoration: DecorationSpec) {
    const sprite = this.add.sprite(decoration.x, decoration.y, WORLD_DECORATION_TEXTURE_KEY, decoration.frame)
      .setOrigin(0.5, 0.5)
      .setScale(this.getDecorationScale(decoration.frame))
      .setDepth(WORLD_DEPTHS.decorations)
    layer.add(sprite)
  }

  private getDecorationScale(frame: number) {
    if (frame === WORLD_DECORATION_FRAMES.grassTuft) return 1
    if (frame === WORLD_DECORATION_FRAMES.smallRocks || frame === WORLD_DECORATION_FRAMES.pebbles) return 0.85
    return 0.9
  }

  private getFixedVillageDecorations(): DecorationSpec[] {
    return [
      { x: 950, y: 820, frame: WORLD_DECORATION_FRAMES.grassTuft },
      { x: 928, y: 1040, frame: WORLD_DECORATION_FRAMES.pebbles },
      { x: 1452, y: 820, frame: WORLD_DECORATION_FRAMES.grassTuft },
      { x: 1470, y: 1042, frame: WORLD_DECORATION_FRAMES.flowersSmall },
      { x: 1080, y: 682, frame: WORLD_DECORATION_FRAMES.pebbles },
      { x: 1320, y: 682, frame: WORLD_DECORATION_FRAMES.flowersCluster },
      { x: 1078, y: 1120, frame: WORLD_DECORATION_FRAMES.flowersSmall },
      { x: 1322, y: 1120, frame: WORLD_DECORATION_FRAMES.smallRocks },
      { x: 900, y: 900, frame: WORLD_DECORATION_FRAMES.grassTuft },
      { x: 1500, y: 900, frame: WORLD_DECORATION_FRAMES.pebbles },
    ]
  }

  private getDecorationFrame(hash: number) {
    const roll = hash % 100

    if (roll < 44) return WORLD_DECORATION_FRAMES.grassTuft
    if (roll < 70) return WORLD_DECORATION_FRAMES.pebbles
    if (roll < 84) return WORLD_DECORATION_FRAMES.flowersSmall
    if (roll < 92) return WORLD_DECORATION_FRAMES.smallRocks
    return WORLD_DECORATION_FRAMES.flowersCluster
  }

  private getDecorationRejectReason(x: number, y: number): DecorationRejectReason | null {
    const pathRects = getVillagePathRects()
    if (containsPoint(pathRects.horizontal, x, y, 20) || containsPoint(pathRects.vertical, x, y, 20)) {
      return "path"
    }

    if (distanceSquared(x, y, WORLD_CENTER.x, WORLD_CENTER.y) <= 76 * 76) {
      return "playerSpawn"
    }

    if (distanceSquared(x, y, WORLD_CENTER.x, WORLD_CENTER.y) <= 124 * 124) {
      return "campfire"
    }

    for (const building of buildingData) {
      const buildingRect = {
        left: building.x - building.width / 2,
        top: building.y - building.height / 2,
        width: building.width,
        height: building.height,
      }
      if (containsPoint(buildingRect, x, y, 34)) {
        return "building"
      }
    }

    for (const npc of npcData) {
      if (distanceSquared(x, y, npc.x, npc.y) <= 58 * 58) {
        return "npcSpawn"
      }
    }

    return null
  }

  private drawProceduralWorld() {
    const centerX = 1200
    const centerY = 900

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

    this.drawVillageBuildings(background)

    this.drawCampfire()
    this.drawForest()
  }

  private addBuildingLabel(
    x: number,
    y: number,
    text: string,
  ): Phaser.GameObjects.Text {
    const label = this.add.text(x, y, text, this.buildingLabelStyle)
      .setOrigin(0.5, 0)
      .setDepth(WORLD_DEPTHS.buildings + 2)
    this.buildingLabels.push(label)
    return label
  }

  private drawVillageBuildings(graphics?: Phaser.GameObjects.Graphics) {
    const buildingGraphics = graphics ?? this.add.graphics().setDepth(WORLD_DEPTHS.buildings)

    buildingData.forEach((building) => {
      if (building.id === "workshop" && this.textures.exists("building-workshop")) {
        const sprite = this.add.sprite(building.x, building.y + 70, "building-workshop", "frame_000")
        sprite.setOrigin(0.5, 1)
        sprite.setScale(1)
        sprite.setDepth(WORLD_DEPTHS.buildings)
        this.addBuildingLabel(building.x, building.y + building.height / 2 + 20, building.label)
        return
      }

      if (building.id === "library" && this.textures.exists("building-library")) {
        const sprite = this.add.sprite(building.x, building.y + 70, "building-library", "frame_000")
        sprite.setOrigin(0.5, 1)
        sprite.setScale(1)
        sprite.setDepth(WORLD_DEPTHS.buildings)
        this.addBuildingLabel(building.x, building.y + building.height / 2 + 20, building.label)
        return
      }

      if (building.id === "tavern" && this.textures.exists("building-tavern")) {
        const sprite = this.add.sprite(building.x, building.y + 70, "building-tavern", "frame_000")
        sprite.setOrigin(0.5, 1)
        sprite.setScale(1)
        sprite.setDepth(WORLD_DEPTHS.buildings)
        this.addBuildingLabel(building.x, building.y + building.height / 2 + 20, building.label)
        return
      }

      if (building.id === "post-office" && this.textures.exists("building-post-office")) {
        const sprite = this.add.sprite(building.x, building.y + 70, "building-post-office", "frame_000")
        sprite.setOrigin(0.5, 1)
        sprite.setScale(1)
        sprite.setDepth(WORLD_DEPTHS.buildings)
        this.addBuildingLabel(building.x, building.y + building.height / 2 + 20, building.label)
        return
      }

      if (building.id === "cave" && this.textures.exists("building-cave")) {
        const sprite = this.add.sprite(building.x, building.y + 70, "building-cave", "frame_000")
        sprite.setOrigin(0.5, 1)
        sprite.setScale(1)
        sprite.setDepth(WORLD_DEPTHS.buildings)
        this.addBuildingLabel(building.x, building.y + building.height / 2 + 20, building.label)
        return
      }

      const left = building.x - building.width / 2
      const top = building.y - building.height / 2
      const right = building.x + building.width / 2
      const baseTop = top + 14

      buildingGraphics.fillStyle(0x080403, 0.28)
      buildingGraphics.fillRoundedRect(left - 4, baseTop + 6, building.width + 8, building.height - 8, 14)
      buildingGraphics.fillStyle(0x2a150d, 1)
      buildingGraphics.fillTriangle(left - 8, baseTop + 8, building.x, top - 16, right + 8, baseTop + 8)
      buildingGraphics.fillStyle(building.color, 1)
      buildingGraphics.fillRoundedRect(
        left,
        baseTop,
        building.width,
        building.height - 12,
        12,
      )
      buildingGraphics.fillStyle(0x120907, 0.34)
      buildingGraphics.fillRoundedRect(left + 8, baseTop + 8, building.width - 16, 10, 5)
      buildingGraphics.lineStyle(3, 0x28140c, 0.9)
      buildingGraphics.strokeRoundedRect(left, baseTop, building.width, building.height - 12, 12)
      buildingGraphics.fillStyle(0xf4c46d, 0.88)
      buildingGraphics.fillRoundedRect(left + 16, baseTop + 18, 13, 15, 3)
      buildingGraphics.fillRoundedRect(right - 29, baseTop + 18, 13, 15, 3)
      buildingGraphics.fillStyle(0x21110b, 1)
      buildingGraphics.fillRoundedRect(building.x - 9, baseTop + 34, 18, 26, 5)
      buildingGraphics.fillStyle(0xffc56f, 0.72)
      buildingGraphics.fillCircle(building.x + 5, baseTop + 46, 2)
      buildingGraphics.fillStyle(0xffbd65, 0.18)
      buildingGraphics.fillCircle(building.x, baseTop + 46, 24)
      this.drawBuildingMark(buildingGraphics, building.id, building.x, baseTop + 26)
      this.addBuildingLabel(building.x, building.y + building.height / 2 + 10, building.label)
    })
  }

  private drawBuildingOverlays() {
    const overlay = this.add.graphics().setDepth(4)
    buildingData.forEach((building) => {
      const top = building.y - building.height / 2
      const baseTop = top + 14
      this.drawBuildingMark(overlay, building.id, building.x, baseTop + 26)
    })
  }

  private drawCampfire() {
    const campfireX = 1200
    const campfireY = 900

    const boost = this.environment?.getCampfireBoost() ?? { alphaMultiplier: 1, radiusMultiplier: 1 }
    const sparkAlpha = 0.35 * boost.alphaMultiplier

    const glow = this.add.graphics()
      .setDepth(WORLD_DEPTHS.campfireGlow)
    glow.fillStyle(0xffad42, 0.2 * boost.alphaMultiplier)
    glow.fillCircle(campfireX, campfireY, 102 * boost.radiusMultiplier)
    glow.fillStyle(0xffd27b, 0.16 * boost.alphaMultiplier)
    glow.fillCircle(campfireX, campfireY, 52 * boost.radiusMultiplier)

    const fire = this.add.sprite(campfireX, campfireY, "world-fire")
      .setDepth(WORLD_DEPTHS.campfireFire)
      .setScale(1.1)

    for (let index = 0; index < 7; index += 1) {
      const spark = this.add.sprite(campfireX - 8 + index * 3, campfireY - 14 + (index % 3) * 3, "world-spark")
        .setDepth(WORLD_DEPTHS.campfireSpark)
        .setAlpha(sparkAlpha)
      this.tweens.add({
        targets: spark,
        alpha: { from: sparkAlpha, to: 0 },
        duration: 850 + index * 120,
        repeat: -1,
        y: spark.y - 18,
        delay: index * 120,
        onRepeat: () => {
          spark.setPosition(campfireX - 4 + ((index * 11) % 24), campfireY - 9 + (index % 2) * 3)
          spark.setAlpha(sparkAlpha)
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

  private drawForest() {
    if (!this.textures.exists("tree")) return

    const STEP = 40
    const cx = 1200
    const cy = 1600

    for (let x = 0; x < 2400; x += STEP) {
      for (let y = 1500; y < 1800; y += STEP) {
        const hash = stableTileHash(Math.floor(x / STEP), Math.floor(y / STEP), 53)

        if (hash % 100 >= 90) continue

        const posX = x + (hash % 13) - 6
        const posY = y + ((hash >> 4) % 13) - 6

        if (posX > cx - 44 && posX < cx + 44 && posY > cy - 21 && posY < cy + 51) continue

        const depth = posY >= cy ? WORLD_DEPTHS.buildings + 1 : WORLD_DEPTHS.forest

        this.add.sprite(posX, posY, "tree", hash % 8)
          .setOrigin(0.5, 1)
          .setScale(2.5 + ((hash >> 8) % 11) * 0.1)
          .setDepth(depth)
      }
    }
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
      if (npc.id === "manh" && this.guideState === "leading") continue
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
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true
      this.input.keyboard.enableGlobalCapture()
    }
  }

  private startCampfireGathering(instant: boolean) {
    this.isGatheringActive = true

    this.npcs.forEach((npc) => {
      const dest = this.GATHERING_DESTINATIONS[npc.id]
      if (!dest) return
      if (npc.id === "manh" && this.guideState === "leading") return

      if (npc.hasSprite) {
        npc.pauseWandering()
        if (instant) {
          npc.setPosition(dest.x, dest.y)
          npc.setVelocity(0, 0)
          npc.stopLeading(dest.dir)
        } else {
          npc.leadTo(dest.x, dest.y)
        }
      } else {
        npc.bobbingTween?.destroy()
        if (instant) {
          npc.setPosition(dest.x, dest.y)
          npc.bobbingTween = this.tweens.add({
            targets: npc,
            y: dest.y - 2,
            duration: 1300 + (npc.x % 4) * 120,
            ease: "Sine.inOut",
            yoyo: true,
            repeat: -1,
          })
        } else {
          this.tweens.add({
            targets: npc,
            x: dest.x,
            y: dest.y,
            duration: 2000,
            ease: "Sine.easeInOut",
            onComplete: () => {
              npc.bobbingTween?.destroy()
              npc.bobbingTween = this.tweens.add({
                targets: npc,
                y: dest.y - 2,
                duration: 1300 + (npc.x % 4) * 120,
                ease: "Sine.inOut",
                yoyo: true,
                repeat: -1,
              })
            },
          })
        }
      }
    })

    gameBridge.emit("bard-started-playing", undefined)
    gameBridge.emit("world-notification", { text: "The townsfolk gather around the fire..." })
    this.pendingGatheringStart = false
  }

  private endCampfireGathering() {
    this.isGatheringActive = false

    gameBridge.emit("bard-stopped-playing", undefined)

    this.npcs.forEach((npc) => {
      const original = npcData.find((d) => d.id === npc.id)
      if (!original) return

      if (npc.hasSprite) {
        npc.stopLeading()
        npc.resumeWandering()
      } else {
        npc.bobbingTween?.destroy()
        this.tweens.add({
          targets: npc,
          x: original.x,
          y: original.y,
          duration: 1500,
          ease: "Sine.easeInOut",
          onComplete: () => {
            npc.bobbingTween = this.tweens.add({
              targets: npc,
              y: original.y - 2,
              duration: 1300 + (original.x % 4) * 120,
              ease: "Sine.inOut",
              yoyo: true,
              repeat: -1,
            })
          },
        })
      }
    })
  }

  private checkGatheringTime() {
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    const inWindow = h === 19 && m >= 0 && m < 30

    if (inWindow && !this.isGatheringActive) {
      if (this.uiLocked) {
        this.pendingGatheringStart = true
        return
      }
      this.startCampfireGathering(m >= 15)
    } else if (!inWindow && this.isGatheringActive) {
      this.endCampfireGathering()
    }
  }

  private leadManhToGathering() {
    if (!this.isGatheringActive || !this.manhNpc) return
    const dest = this.GATHERING_DESTINATIONS["manh"]
    if (dest) {
      this.manhNpc.leadTo(dest.x, dest.y)
    }
  }

  private bardSprite?: Phaser.GameObjects.Sprite

  private setupBardBehavior(bard: NPC) {
    const BARDSCALE = 0.14
    const Y_OFFSET = 16
    const X_OFFSET = -2
    this.bardSprite = this.add.sprite(bard.x + X_OFFSET, bard.y + Y_OFFSET, "bard")
    this.bardSprite.setOrigin(0.5, 1)
    this.bardSprite.setScale(BARDSCALE)
    this.bardSprite.setFrame("frame_000")
    this.bardSprite.setDepth(8)

    this.tweens.add({
      targets: this.bardSprite,
      y: this.bardSprite.y - 2,
      duration: 1300 + (bard.x % 4) * 120,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    })

    bard.setVisible(false)

    let isResting = false

    const startIdleCheck = () => {
      this.time.delayedCall(8000 + Math.random() * 7000, () => {
        if (!isResting && this.bardSprite?.active) {
          this.bardSprite.play("bard-checking")
          this.time.delayedCall(1000, () => {
            if (this.bardSprite?.active) this.bardSprite.setFrame("frame_000")
          })
        }
        if (this.scene.isActive()) startIdleCheck()
      })
    }
    startIdleCheck()

    const offStarted = gameBridge.on("bard-started-playing", () => {
      this.bardIsPlaying = true
      isResting = true
      this.bardSprite?.play("bard-playing")
    })

    const offStopped = gameBridge.on("bard-stopped-playing", () => {
      this.bardIsPlaying = false
      isResting = false
      if (this.bardSprite?.active) {
        this.bardSprite.anims.stop()
        this.bardSprite.setFrame("frame_000")
      }
    })

    const offMute = gameBridge.on("bard-mute-changed", ({ muted }) => {
      this.gatheringBardMuted = muted
    })

    this.cleanupFns.push(offStarted, offStopped, offMute)
  }

  private setupManhBehavior(manhNpc: NPC) {
    this.manhNpc = manhNpc

    const offGuide = gameBridge.on("manh-start-guide", ({ choiceId }) => {
      const dest = this.GUIDE_DESTINATIONS[choiceId]
      if (!dest) return
      this.guideState = "leading"
      this.guideDestination = dest
      manhNpc.leadTo(dest.x, dest.y)
    })

    this.cleanupFns.push(offGuide)
  }
}
