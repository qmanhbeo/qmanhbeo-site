# Moon Sprite Trials

## Generated Lunar Phases (NOT CANON)

- **File**: `assets/sprites/lunar-phases-generated.png`
- **Status**: Trial only — visual quality not production-ready
- **Script**: `scripts/generate-moon-phases.js`
- **Verdict**: Terminator geometry and phase shapes need more work. The two-circle mask
  approach is sound but the implementation produces unconvincing crescent/gibbous silhouettes.

## Cannon Sprite

- **Use**: `public/assets/sprites/lunar-phases.png` (loaded in BootScene.ts as `lunar-phases`)
- The `generate-moon-phases.js` script is kept for experimentation but should not replace the
  existing sprite until the render quality matches or exceeds it.

## Why Keep the Script?

- Seeded deterministic generation (useful for reproducible test outputs)
- Two-circle mask model is conceptually correct — just needs tighter math
- Can iterate without touching the working asset