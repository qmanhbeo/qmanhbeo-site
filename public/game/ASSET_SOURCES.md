# World Asset Sources

All files in `public/game/characters/`, `public/game/tilesets/`, and `public/game/maps/` are original repo-owned world assets generated from `scripts/generate_world_assets.py`.

No external asset packs, stock art, AI-generated bitmap files, or third-party licensed image files are used in this asset pass.

Regenerate these assets from the repo root with:

```bash
python3 scripts/generate_world_assets.py
```

The generator rewrites the files listed below. If any generated asset is edited manually, document the manual change here or move it out of the generated set before committing.

Generated files:
- `characters/player.png`
- `characters/npc-alex.png`
- `characters/npc-adam.png`
- `characters/npc-avery.png`
- `characters/campfire.png`
- `tilesets/tiny-town.png`
- `maps/world.json`

Supplied runtime spritesheets:
- `tilesets/ground-path-tiles/spritesheet.png`
- `tilesets/ground-path-tiles/spritesheet.json`
- `tilesets/ground-items/spritesheet.png`
- `tilesets/ground-items/spritesheet.json`

These supplied spritesheets are consumed directly by `BootScene`/`WorldScene`. The ground/path frames are normalized into 32x32 in-memory Phaser textures at runtime and are not rewritten by `scripts/generate_world_assets.py`.

Pending assets:
- `sounds/medieval-bgm.mp3`
- `sounds/footstep.wav`
- `sounds/door-enter.wav`
- `sounds/dialogue-bleep.wav`
