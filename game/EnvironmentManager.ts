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
    topColor: 0x050a18,
    bottomColor: 0x1a2040,
    topAlpha: 0.7,
    bottomAlpha: 0,
    gradientHeightRatio: 0.45,
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

const SYNODIC_MONTH = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2024, 3, 8, 18, 21)

function getLunarPhaseFrame(date = new Date()) {
  const now = date.getTime()
  const daysSinceNewMoon = (now - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24)
  const lunarAge = ((daysSinceNewMoon % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const phaseIndex = Math.round((lunarAge / SYNODIC_MONTH) * 8) % 8
  return phaseIndex
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2)
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
  private skyImage?: Phaser.GameObjects.Image
  private stars: Phaser.GameObjects.Arc[] = []
  private starTweens: Phaser.Tweens.Tween[] = []
  private moon?: Phaser.GameObjects.Sprite
  private moonLuma?: Phaser.GameObjects.Sprite
  private moonContrast?: Phaser.GameObjects.Sprite
  private moonGlow1?: Phaser.GameObjects.Sprite
  private moonGlow2?: Phaser.GameObjects.Sprite
  private darkness?: Phaser.GameObjects.Graphics
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
    console.log("[ENV] === EnvironmentManager.create() called ===")

    this.graphics = this.scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(3)

    this.darkness = this.scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(3.8)

    this.createStars()
    this.createMoon()
    this.initialized = true
    const hour = new Date().getHours()
    this.cachedHour = hour

    const debugLocked = this.debugLockedState
    const debugRegistry = this.scene.registry.get("debugTimeState") as TimeState | undefined
    console.log("[ENV] create() - hour:", hour, "debugLockedState:", debugLocked, "registry debugState:", debugRegistry)

    const state = this.getStateFromTime()
    console.log("[ENV] create() - resolved state:", state)
    this.applySkyGradient(state)
    this.applyDarkness(state)
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
      this.applyDarkness()
      return
    }

    const debugLocked = this.debugLockedState
    if (debugLocked) {
      console.log("[ENV] update() - returning early due to debugLockedState:", debugLocked)
      return
    }

    const debugState = this.scene.registry.get("debugTimeState") as TimeState | undefined
    if (debugState && SKY_CONFIGS[debugState]) {
      console.log("[ENV] update() - using registry debugState:", debugState)
      if (debugState !== this.cachedRegistryState) {
        this.cachedRegistryState = debugState
        this.currentState = debugState
        this.applySkyGradient()
        this.applyDarkness()
      }
      return
    }
    this.cachedRegistryState = undefined

    const currentHour = new Date().getHours()
    if (currentHour === this.cachedHour) {
      console.log("[ENV] update() - hour unchanged:", currentHour, "currentState:", this.currentState)
      return
    }
    this.cachedHour = currentHour

    const newState = getTimeOfDayState(currentHour)
    console.log("[ENV] update() - hour changed to:", currentHour, "newState:", newState, "prevState:", this.currentState)
    if (newState !== this.currentState) {
      this.currentState = newState
      this.applySkyGradient()
      this.applyDarkness()
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
      this.applyDarkness()
    }
  }

  private applySkyGradient(state?: TimeState) {
    const targetState = state ?? this.currentState
    const config = SKY_CONFIGS[targetState]
    const camera = this.scene.cameras.main
    const viewportWidth = camera.width / camera.zoom
    const viewportHeight = camera.height / camera.zoom
    const gradientHeight = Math.round(viewportHeight * config.gradientHeightRatio)

    const textureKey = `sky-gradient-${targetState}`
    if (!this.scene.textures.exists(textureKey)) {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 512
      const ctx = canvas.getContext("2d")!

      const topR = ((config.topColor >> 16) & 0xff) / 255
      const topG = ((config.topColor >> 8) & 0xff) / 255
      const topB = (config.topColor & 0xff) / 255

      const bottomR = ((config.bottomColor >> 16) & 0xff) / 255
      const bottomG = ((config.bottomColor >> 8) & 0xff) / 255
      const bottomB = (config.bottomColor & 0xff) / 255

      const gradient = ctx.createLinearGradient(0, 0, 0, 512)
      gradient.addColorStop(0, `rgba(${Math.round(topR * 255)}, ${Math.round(topG * 255)}, ${Math.round(topB * 255)}, ${config.topAlpha})`)
      gradient.addColorStop(1, `rgba(${Math.round(bottomR * 255)}, ${Math.round(bottomG * 255)}, ${Math.round(bottomB * 255)}, 0)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1, 512)

      this.scene.textures.addCanvas(textureKey, canvas)
    }

    if (!this.skyImage) {
      this.skyImage = this.scene.add.image(0, 0, textureKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(3)
    }

    this.skyImage
      .setTexture(textureKey)
      .setDisplaySize(viewportWidth, gradientHeight)
      .setVisible(true)

    const starsVisible = config.starVisible
    for (const star of this.stars) {
      star.setVisible(starsVisible)
    }
  }

  private applyDarkness(state?: TimeState) {
    if (!this.darkness) return

    const targetState = state ?? this.currentState
    const camera = this.scene.cameras.main
    const viewportWidth = camera.width / camera.zoom
    const viewportHeight = camera.height / camera.zoom

    this.darkness.clear()

    const isNight = targetState === "NIGHT"

    if (this.moon) {
      this.moon.setVisible(isNight)
      this.moonLuma?.setVisible(isNight)
      this.moonContrast?.setVisible(isNight)
      this.moonGlow1?.setVisible(isNight)
      this.moonGlow2?.setVisible(isNight)
      if (isNight) {
        const moonPhase = getLunarPhaseFrame()
        this.moon.setFrame(moonPhase)
        this.moonLuma?.setFrame(moonPhase)
        this.moonContrast?.setFrame(moonPhase)
        this.moonGlow1?.setFrame(moonPhase)
        this.moonGlow2?.setFrame(moonPhase)

        const isFullMoon = moonPhase === 4
        const lumaBoost = isFullMoon ? 0.52 : 0.42
        const glow1Boost = isFullMoon ? 0.25 : 0.2
        this.moonLuma?.setAlpha(lumaBoost)
        this.moonGlow1?.setAlpha(glow1Boost)
      }
    }

    if (!isNight) {
      this.darkness.setVisible(false)
      return
    }

    this.darkness.setVisible(true)
    this.darkness.fillStyle(0x0a1228, 0.5)
    this.darkness.fillRect(0, 0, viewportWidth, viewportHeight)
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

  private createMoon() {
    if (!this.scene.textures.exists("lunar-phases")) {
      console.warn("lunar-phases texture not loaded")
      return
    }

    const camera = this.scene.cameras.main
    const viewportWidth = camera.width / camera.zoom
    const isMobile = viewportWidth < 768
    const x = isMobile ? viewportWidth - 48 : viewportWidth - 180
    const y = isMobile ? 88 : 80

    const moonGlow2 = this.scene.add.sprite(x, y, "lunar-phases", 0)
      .setScrollFactor(0)
      .setDepth(3.3)
      .setScale(1.6)
      .setAlpha(0.08)
      .setTint(0xeef4ff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(this.currentState === "NIGHT")

    const moonGlow1 = this.scene.add.sprite(x, y, "lunar-phases", 0)
      .setScrollFactor(0)
      .setDepth(3.32)
      .setScale(1.25)
      .setAlpha(0.2)
      .setTint(0xeef4ff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(this.currentState === "NIGHT")

    const moonContrast = this.scene.add.sprite(x, y, "lunar-phases", 0)
      .setScrollFactor(0)
      .setDepth(3.48)
      .setScale(1.0)
      .setAlpha(0.1)
      .setTint(0x000000)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setVisible(this.currentState === "NIGHT")

    const moonLuma = this.scene.add.sprite(x, y, "lunar-phases", 0)
      .setScrollFactor(0)
      .setDepth(3.49)
      .setScale(1.04)
      .setAlpha(0.42)
      .setTint(0xffffff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(this.currentState === "NIGHT")

    this.moon = this.scene.add.sprite(x, y, "lunar-phases", 0)
      .setScrollFactor(0)
      .setDepth(3.5)
      .setAlpha(1.0)
      .setTint(0xffffff)
      .setVisible(this.currentState === "NIGHT")

    const moonPhase = getLunarPhaseFrame()
    this.moon.setFrame(moonPhase)
    this.moonLuma = moonLuma
    this.moonLuma.setFrame(moonPhase)
    this.moonContrast = moonContrast
    this.moonContrast.setFrame(moonPhase)
    this.moonGlow1 = moonGlow1
    this.moonGlow1.setFrame(moonPhase)
    this.moonGlow2 = moonGlow2
    this.moonGlow2.setFrame(moonPhase)
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

    this.moon?.destroy()
    this.moon = undefined
    this.moonLuma?.destroy()
    this.moonLuma = undefined
    this.moonContrast?.destroy()
    this.moonContrast = undefined
    this.moonGlow1?.destroy()
    this.moonGlow1 = undefined
    this.moonGlow2?.destroy()
    this.moonGlow2 = undefined
    this.darkness?.destroy()
    this.darkness = undefined
    this.graphics?.destroy()
    this.graphics = undefined
    this.initialized = false
  }

  getCampfireBoost(): { alphaMultiplier: number; radiusMultiplier: number } {
    if (this.currentState === "NIGHT") {
      return { alphaMultiplier: 1.5, radiusMultiplier: 1.2 }
    }
    return { alphaMultiplier: 1, radiusMultiplier: 1 }
  }

  getCurrentState(): TimeState {
    return this.currentState
  }
}