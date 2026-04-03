export type ScatteredCardIntensity = "soft" | "medium"

export interface ScatteredCardPreset {
  hoverLiftPx: number
  hoverScale: number
  rotateDeg: number
  translateYPx: number
}

const SCATTER_PRESETS: Record<ScatteredCardIntensity, ScatteredCardPreset[]> = {
  soft: [
    { rotateDeg: -1.45, translateYPx: 4, hoverScale: 1.016, hoverLiftPx: -1 },
    { rotateDeg: -0.95, translateYPx: -2, hoverScale: 1.018, hoverLiftPx: -2 },
    { rotateDeg: -0.4, translateYPx: 3, hoverScale: 1.017, hoverLiftPx: -1 },
    { rotateDeg: 0.6, translateYPx: -3, hoverScale: 1.016, hoverLiftPx: -2 },
    { rotateDeg: 1.05, translateYPx: 2, hoverScale: 1.018, hoverLiftPx: -1 },
    { rotateDeg: 1.5, translateYPx: -1, hoverScale: 1.017, hoverLiftPx: -2 },
  ],
  medium: [
    { rotateDeg: -3.1, translateYPx: 6, hoverScale: 1.022, hoverLiftPx: -2 },
    { rotateDeg: -2.35, translateYPx: -4, hoverScale: 1.024, hoverLiftPx: -3 },
    { rotateDeg: -1.55, translateYPx: 5, hoverScale: 1.021, hoverLiftPx: -2 },
    { rotateDeg: 1.35, translateYPx: -5, hoverScale: 1.022, hoverLiftPx: -3 },
    { rotateDeg: 2.15, translateYPx: 4, hoverScale: 1.023, hoverLiftPx: -2 },
    { rotateDeg: 2.95, translateYPx: -2, hoverScale: 1.024, hoverLiftPx: -3 },
  ],
}

const getSeedHash = (seed: string) => {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 33 + char.charCodeAt(0)) % 100000
  }

  return hash
}

export const getScatteredCardPreset = (seed: string, intensity: ScatteredCardIntensity): ScatteredCardPreset => {
  const presets = SCATTER_PRESETS[intensity]
  const presetIndex = getSeedHash(seed) % presets.length

  return presets[presetIndex]
}
