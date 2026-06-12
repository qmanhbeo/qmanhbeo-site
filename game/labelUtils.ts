import type Phaser from "phaser"

/**
 * Resolve the actual game font family from the --font-cinzel CSS custom property.
 *
 * Phaser builds text by drawing on an off-screen <canvas> via Canvas 2D then
 * uploading the result as a WebGL texture. CSS custom property *values* are
 * not resolved by the Canvas 2D API — `var(--font-cinzel, serif)` in a Phaser
 * text style silently falls back to `serif` without any warning. Always resolve
 * the computed value from the DOM and pass the resolved string instead.
 *
 * Future Phaser world labels should use this helper or a similar DOM-resolved
 * font family string rather than referencing CSS custom properties directly.
 * Future HUD, UI, dialogue, or tooltip text that needs crisp responsive text
 * should prefer a React DOM overlay over Phaser canvas text.
 */
export function resolveGameFont(): string {
  if (typeof document === "undefined") return "Cinzel, serif"
  const raw = getComputedStyle(document.body)
    .getPropertyValue("--font-cinzel")
    .trim()
  return raw ? `${raw}, serif` : "Cinzel, serif"
}

/** Shared text style configuration for world building nameplates. */
export function getBuildingLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    color: "#f4dcb1",
    fontFamily: resolveGameFont(),
    fontSize: "15px",
    stroke: "#1b1208",
    strokeThickness: 1,
    padding: { x: 2, y: 1 },
  }
}
