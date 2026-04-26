# Prompt for Spritesheet Creation

This guide outlines the spritesheet specification used in the `/world` game for any future NPC or character sprites.

## Current Implementation

The system uses 4×4 directional spritesheets with the following layout:

```
┌─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │  ← Row 0: Facing Down
├─────┼─────┼─────┼─────┤
│  4  │  5  │  6  │  7  │  ← Row 1: Facing Left
├─────┼─────┼─────┼─────┤
│  8  │  9  │ 10  │ 11  │  ← Row 2: Facing Right
├─────┼─────┼─────┼─────┤
│ 12  │ 13  │ 14  │ 15  │  ← Row 3: Facing Up
└─────┴─────┴─────┴─────┘
       Columns 0-3
```

### Frame Mapping

- **Column 0**: Idle / standing pose
- **Column 1**: Walk frame 1
- **Column 2**: Walk frame 2
- **Column 3**: Idle variation (subtle hair/cloak sway)

### Direction Mapping

- Row 0 (frames 0-3): Facing down
- Row 1 (frames 4-7): Facing left
- Row 2 (frames 8-11): Facing right
- Row 3 (frames 12-15): Facing up

## Image Requirements

### Recommended Dimensions

- **Tight crop**: Each frame should be individually trimmed with no empty space around the character
- **Uniform size**: All frames within a spritesheet should be the same size
- **Power of 2 preferred**: 32×32, 48×48, 64×64 work well with pixel art scaling

### Acceptable (with spacing)

If the generated image has generous spacing around each sprite:
- The system calculates `frameWidth = image.width / 4` and `frameHeight = image.height / 4`
- This divides the total image into 4 equal columns and 4 equal rows
- The character will appear smaller if there is significant padding

**Tip**: For best results, ask the image generator to crop tightly around each character pose.

### Pixel Art Settings

When generating or exporting:
- Use `image-rendering: pixelated` / `image-rendering: crisp-edges` CSS for display
- Avoid anti-aliasing when exporting from drawing tools
- Use a limited color palette (16-32 colors) for cohesive look

## Prompt Template

Use this prompt as a starting point:

```
Create a 4x4 character spritesheet for a pixel art RPG (32x32 pixels per frame, tight crop around each frame).

The layout should be:
- Row 0 (frames 0-3): Character facing DOWN (idle, walk1, walk2, idle-variation)
- Row 1 (frames 4-7): Character facing LEFT (idle, walk1, walk2, idle-variation)
- Row 2 (frames 8-11): Character facing RIGHT (idle, walk1, walk2, idle-variation)
- Row 3 (frames 12-15): Character facing UP (idle, walk1, walk2, idle-variation)

Each frame should be 32x32 pixels, tightly cropped with no extra padding.
Style: Medieval/fantasy pixel art, warm colors, similar to Stardew Valley.
Character: [describe appearance - clothing, accessories, etc.]
```

## Integration Checklist

After creating a new spritesheet:

1. Place the PNG in `public/game/characters/`
2. Add NPC entry in `game/config/npcData.ts`:
   ```typescript
   {
     id: "unique-id",
     name: "Display Name",
     x: 360,
     y: 280,
     dialogueLines: ["Line 1", "Line 2"],
     spriteConfig: {
       path: "/game/characters/your-spritesheet.png",
       columns: 4,
       rows: 4,
     },
   }
   ```
3. Build passes: `npm run build`
4. Test in `/world` - verify animation plays and wandering works

## Code Reference

See the actual implementation in:
- `game/config/npcData.ts` — `SpriteConfig` interface and NPC definitions
- `game/scenes/BootScene.ts` — `createNpcAnimations()` method for animation setup
- `game/objects/NPC.ts` — `updateWandering()` for autonomous movement logic