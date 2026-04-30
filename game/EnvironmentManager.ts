import Phaser from "phaser"

export type TimeState = "DAY" | "DUSK" | "NIGHT" | "DAWN"

interface SkyConfig {
  topColor: number
  bottomColor: number
  topAlpha: number
  bottomAlpha: number
  gradientHeightRatio: number
  starVisible: boolean
}

const SKY_CONFIGS: Record<TimeState, SkyConfig> = {
  DAY: {
    topColor: 0x87ceeb,
    bottomColor: 0xe0f4ff,
    topAlpha: 0.12,
    bottomAlpha: 0,
    gradientHeightRatio: 0.45,
    starVisible: false,
  },
  DUSK: {
    topColor: 0xff6b4a,
    bottomColor: 0xffa5c0,
    topAlpha: 0.28,
    bottomAlpha: 0,
    gradientHeightRatio: 0.5,
    starVisible: false,
  },
  NIGHT: {
    topColor: 0x0a1228,
    bottomColor: 0x1a2040,
    topAlpha: 0.4,
    bottomAlpha: 0,
    gradientHeightRatio: 0.55,
    starVisible: true,
  },
  DAWN: {
    topColor: 0x6b4a8a,
    bottomColor: 0xf4c46a,
    topAlpha: 0.25,
    bottomAlpha: 0,
    gradientHeightRatio: 0.45,
    starVisible: false,
  },
}

const GRADIENT_STRIPS = 96
const STARS_COUNT = 16

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2)
}

function easeOutQuad(t: number): number {
  return t * (2 - t)
}

function getTimeOfDayState(hour: number): TimeState {
  if (hour >= 5 && hour <= 7) return "DAWN"
  if (hour >= 8 && hour <= 16) return "DAY"
  if (hour >= 17 && hour <= 19) return "DUSK"
  return "NIGHT"
}

function lerpColor(colorA: number, colorB: number, t: number): number {
  const r = ((colorA >> 16) & 0xff) / 255
  const g = ((colorA >> 8) & 0xff) / 255
  const b = (colorA & 0xff) / 255

  const r2 = ((colorB >> 16) & 0xff) / 255
  const g2 = ((colorB >> 8) & 0xff) / 255
  const b2 = (colorB & 0xff) / 255

  const rr = Math.round(lerp(r, r2, t) * 255)
  const gg = Math.round(lerp(g, g2, t) * 255)
  const bb = Math.round(lerp(b, b2, t) * 255)

  return (rr << 16) | (gg << 8) | bb
}

export class EnvironmentManager {
  private scene: Phaser.Scene
  private graphics?: Phaser.GameObjects.Graphics
  private stars: Phaser.GameObjects.Arc[] = []
  private starTweens: Phaser.Tweens.Tween[] = []
  private currentState: TimeState = "DAY"
  private cachedHour = -1
  private cachedViewportWidth = 0
  private cachedViewportHeight = 0
  private cachedRegistryState?: TimeState
  private debugLockedState?: TimeState
  private initialized = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  create() {
    this.graphics = this.scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(3)

    this.createStars()
    this.initialized = true
    this.cachedHour = new Date().getHours()

    const state = this.getStateFromTime()
    this.applySkyGradient(state)
  }

  update(_time: number) {
    if (!this.initialized) return

    const camera = this.scene.cameras.main
    const viewportWidth = camera.width / camera.zoom
    const viewportHeight = camera.height / camera.zoom

    if (viewportWidth !== this.cachedViewportWidth || viewportHeight !== this.cachedViewportHeight) {
      this.cachedViewportWidth = viewportWidth
      this.cachedViewportHeight = viewportHeight
      this.applySkyGradient()
      return
    }

    if (this.debugLockedState) return

    const debugState = this.scene.registry.get("debugTimeState") as TimeState | undefined
    if (debugState && SKY_CONFIGS[debugState]) {
      if (debugState !== this.cachedRegistryState) {
        this.cachedRegistryState = debugState
        this.currentState = debugState
        this.applySkyGradient()
      }
      return
    }
    this.cachedRegistryState = undefined

    const currentHour = new Date().getHours()
    if (currentHour === this.cachedHour) return
    this.cachedHour = currentHour

    const newState = getTimeOfDayState(currentHour)
    if (newState !== this.currentState) {
      this.currentState = newState
      this.applySkyGradient()
    }
  }

  private getStateFromTime(): TimeState {
    if (this.debugLockedState) return this.debugLockedState

    const debugState = this.scene.registry.get("debugTimeState") as TimeState | undefined
    if (debugState && SKY_CONFIGS[debugState]) {
      return debugState
    }

    const hour = new Date().getHours()
    return getTimeOfDayState(hour)
  }

  setDebugState(state: TimeState | undefined) {
    this.debugLockedState = state
    if (state && SKY_CONFIGS[state]) {
      this.currentState = state
      this.applySkyGradient()
    }
  }

  private applySkyGradient(state?: TimeState) {
    if (!this.graphics) return

    const targetState = state ?? this.currentState
    const config = SKY_CONFIGS[targetState]
    const camera = this.scene.cameras.main
    const viewportWidth = camera.width / camera.zoom
    const viewportHeight = camera.height / camera.zoom
    const gradientHeight = Math.round(viewportHeight * config.gradientHeightRatio)

    this.graphics.clear()

    const stripHeight = gradientHeight / GRADIENT_STRIPS

    for (let i = 0; i < GRADIENT_STRIPS; i++) {
      const y = i * stripHeight
      const t = easeOutSine(i / (GRADIENT_STRIPS - 1))

      const alpha = lerp(config.topAlpha, config.bottomAlpha, t)
      const color = lerpColor(config.topColor, config.bottomColor, t)

      this.graphics.fillStyle(color, alpha)
      this.graphics.fillRect(0, y, viewportWidth, stripHeight + 1)
    }

    const starsVisible = config.starVisible
    for (const star of this.stars) {
      star.setVisible(starsVisible)
    }
  }

  private createStars() {
    const camera = this.scene.cameras.main
    const viewportWidth = camera.width / camera.zoom
    const viewportHeight = camera.height / camera.zoom

    const starZoneHeight = Math.min(viewportHeight * 0.3, 250)

    this.stars = []
    this.starTweens.length = 0

    const seed = 12345
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000
      return x - Math.floor(x)
    }

    for (let i = 0; i < STARS_COUNT; i++) {
      const x = Math.round(random(i) * viewportWidth * 0.8) + viewportWidth * 0.1
      const yNormalized = random(i + 1000)
      const y = Math.round(yNormalized * starZoneHeight)
      const size = 0.6 + random(i + 2000) * 0.8

      const star = this.scene.add.circle(x, y, size, 0xffffff)
        .setScrollFactor(0)
        .setDepth(3.5)
        .setAlpha(0)
        .setVisible(this.currentState === "NIGHT")

      this.stars.push(star)

      this.scene.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 0.9 },
        duration: 800 + i * 150,
        repeat: -1,
        yoyo: true,
        ease: "Sine.easeInOut",
      })
    }
  }

  handleKeyDown(key: string) {
    switch (key) {
      case "1":
        this.setDebugState("DAY")
        break
      case "2":
        this.setDebugState("DUSK")
        break
      case "3":
        this.setDebugState("NIGHT")
        break
      case "4":
        this.setDebugState("DAWN")
        break
    }
  }

  destroy() {
    for (const tween of this.starTweens) {
      tween.destroy()
    }
    this.starTweens.length = 0

    for (const star of this.stars) {
      star.destroy()
    }
    this.stars.length = 0

    this.graphics?.destroy()
    this.graphics = undefined
    this.initialized = false
  }
}