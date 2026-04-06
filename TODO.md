# Todo

## 1. Source audio files (required for atmosphere upgrade to work)

Go to freesound.org, filter by "Creative Commons 0" license, download and convert:

| Target file | Search term | Notes |
|------------|-------------|-------|
| `public/sounds/fire.ogg` | "fireplace crackling loop" | Seamless loop, 30–120s |
| `public/sounds/rain.ogg` | "rain ambience loop" | Steady rain, seamless loop |
| `public/sounds/music.ogg` | "medieval lute ambient loop" | Soft, no vocals, 60–180s |
| `public/sounds/click.ogg` | "wood tap" or "soft click" | Very short < 0.5s |
| `public/sounds/transition.ogg` | "paper whoosh" or "soft whoosh" | Short < 1s |

Convert with ffmpeg (adjust input filenames):
```bash
mkdir -p public/sounds
ffmpeg -i ~/Downloads/fire-crackling.wav  -c:a libvorbis -q:a 3 public/sounds/fire.ogg
ffmpeg -i ~/Downloads/rain-ambience.wav   -c:a libvorbis -q:a 3 public/sounds/rain.ogg
ffmpeg -i ~/Downloads/medieval-music.mp3  -c:a libvorbis -q:a 3 public/sounds/music.ogg
ffmpeg -i ~/Downloads/wood-tap.wav        -c:a libvorbis -q:a 2 public/sounds/click.ogg
ffmpeg -i ~/Downloads/paper-whoosh.wav    -c:a libvorbis -q:a 2 public/sounds/transition.ogg
```

Target sizes: fire/rain/music < 2 MB each, click/transition < 100 KB each.

## 2. Fill in content (the main thing that makes the site feel alive)

These entries have placeholder/brief text that needs real writing:

**Notes** (8 total — all need fleshing out):
- `content/notes/note-procurement-records-whisper.ts`
- `content/notes/note-what-birmingham-changed.ts`
- `content/notes/note-market-sandbox.ts`
- `content/notes/note-building-gaia.ts`
- `content/notes/note-energy-poverty-transition.ts`
- `content/notes/note-design-still-matters.ts`
- `content/notes/note-stories-that-remember-you.ts`
- `content/notes/note-housing-listings-taught-me.ts`

**Projects** (6 total):
- `content/projects/project-gaia.ts`
- `content/projects/project-vn-stock-rl-sandbox.ts`
- `content/projects/project-uk-procurement-pipeline.ts`
- `content/projects/project-vn-real-estate-pipeline.ts`
- `content/projects/project-arduino-environment-robot.ts`
- `content/projects/project-paths-untold.ts`

**Arcs / travel** (4 total):
- `content/arcs/arc-xian-design-lens.ts`
- `content/arcs/arc-eepsea-energy-policy.ts`
- `content/arcs/arc-birmingham-ai-sustainability.ts`
- `content/arcs/arc-ho-chi-minh-city-foundations.ts`

**Publications** (3 total — mainly add abstracts/summaries if missing):
- `content/publications/paper-snowflake-generation-youth.ts`
- `content/publications/paper-renewable-delay-vietnam.ts`
- `content/publications/paper-urban-rural-energy-burden-vietnam.ts`

## 3. Test the atmosphere upgrade in the browser

```bash
npm run dev
```

- Open http://localhost:3000
- Click 🌙 in the bottom nav → verify parchment light mode
- Click 🔊 → verify it mutes/unmutes
- Navigate to any item page (e.g. /item/project-gaia)
- Click the 🔥 Ambience pill → should expand and start fire audio (once files are added)
- Navigate between sections → should hear a subtle whoosh
