const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

const FRAME_SIZE = 64;
const FRAME_COUNT = 8;
const OUTPUT_PATH = path.join(
  process.cwd(),
  "assets",
  "sprites",
  "lunar-phases-generated.png"
);

const RENDER_SCALE = 2;
const TILE = FRAME_SIZE * RENDER_SCALE;
const SHEET_WIDTH = FRAME_SIZE * FRAME_COUNT;
const SHEET_HEIGHT = FRAME_SIZE;

const MOON_RADIUS = 24 * RENDER_SCALE;
const MOON_CX = TILE / 2;
const MOON_CY = TILE / 2;

const PHASES = [
  { name: "new",          litFrac: 0    },
  { name: "wax-crescent", litFrac: 0.18 },
  { name: "first-quarter",litFrac: 0.5  },
  { name: "wax-gibbous",  litFrac: 0.78 },
  { name: "full",         litFrac: 1    },
  { name: "wan-gibbous",  litFrac: 0.78 },
  { name: "third-quarter",litFrac: 0.5  },
  { name: "wan-crescent", litFrac: 0.18 },
];

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function drawFullMoon(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  ctx.clip();

  const g = ctx.createRadialGradient(
    MOON_CX - 9 * RENDER_SCALE, MOON_CY - 11 * RENDER_SCALE, 2 * RENDER_SCALE,
    MOON_CX, MOON_CY, MOON_RADIUS
  );
  g.addColorStop(0,   "#fafaff");
  g.addColorStop(0.5, "#dde6f5");
  g.addColorStop(1,   "#9aacc8");
  ctx.fillStyle = g;
  ctx.fillRect(MOON_CX - MOON_RADIUS, MOON_CY - MOON_RADIUS, MOON_RADIUS * 2, MOON_RADIUS * 2);

  const rng = mulberry32(987654);
  for (let i = 0; i < 28; i++) {
    const a  = rng() * Math.PI * 2;
    const r  = Math.sqrt(rng()) * MOON_RADIUS * 0.82;
    const cx = MOON_CX + Math.cos(a) * r;
    const cy = MOON_CY + Math.sin(a) * r;
    const cr = (1.0 + rng() * 2.5) * RENDER_SCALE;
    const al = 0.06 + rng() * 0.08;

    ctx.globalAlpha = al;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fillStyle = "#2a2830";
    ctx.fill();

    ctx.globalAlpha = al * 0.4;
    ctx.beginPath();
    ctx.arc(cx - cr * 0.2, cy - cr * 0.2, cr * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "#f0f0ff";
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  const rimG = ctx.createRadialGradient(
    MOON_CX, MOON_CY, MOON_RADIUS * 0.78,
    MOON_CX, MOON_CY, MOON_RADIUS
  );
  rimG.addColorStop(0, "rgba(255,255,255,0)");
  rimG.addColorStop(1, "rgba(190,210,240,0.22)");
  ctx.fillStyle = rimG;
  ctx.fill();
  ctx.restore();
}

function drawDarkBase(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  ctx.clip();

  const g = ctx.createRadialGradient(
    MOON_CX - 6 * RENDER_SCALE, MOON_CY - 8 * RENDER_SCALE, 2 * RENDER_SCALE,
    MOON_CX, MOON_CY, MOON_RADIUS
  );
  g.addColorStop(0, "#2a2d3a");
  g.addColorStop(1, "#0c0d14");
  ctx.fillStyle = g;
  ctx.fillRect(MOON_CX - MOON_RADIUS, MOON_CY - MOON_RADIUS, MOON_RADIUS * 2, MOON_RADIUS * 2);

  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  const rimG = ctx.createRadialGradient(
    MOON_CX, MOON_CY, MOON_RADIUS * 0.78,
    MOON_CX, MOON_CY, MOON_RADIUS
  );
  rimG.addColorStop(0, "rgba(255,255,255,0)");
  rimG.addColorStop(1, "rgba(80,100,140,0.14)");
  ctx.fillStyle = rimG;
  ctx.fill();
  ctx.restore();
}

function drawLitShape(ctx, phaseIdx, litFrac) {
  if (litFrac >= 1) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  ctx.clip();

  if (litFrac <= 0) {
    ctx.restore();
    return;
  }

  const D = MOON_RADIUS;

  if (phaseIdx === 1 || phaseIdx === 7) {
    const offset = D * (1 - litFrac * 2.0);
    if (offset > 0) {
      ctx.beginPath();
      ctx.arc(MOON_CX + offset, MOON_CY, D, 0, Math.PI * 2);
      ctx.arc(MOON_CX, MOON_CY, D, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.arc(MOON_CX + offset, MOON_CY, D, 0, Math.PI * 2);
      ctx.clip();
    }

  } else if (phaseIdx === 3 || phaseIdx === 5) {
    const offset = D * (litFrac - 0.5) * 2.0;
    ctx.beginPath();
    ctx.arc(MOON_CX, MOON_CY, D, 0, Math.PI * 2);
    ctx.arc(MOON_CX + offset, MOON_CY, D, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

  } else if (phaseIdx === 2) {
    ctx.beginPath();
    ctx.rect(MOON_CX, MOON_CY - D, D, D * 2);
    ctx.clip();

  } else if (phaseIdx === 6) {
    ctx.beginPath();
    ctx.rect(MOON_CX - D, MOON_CY - D, D, D * 2);
    ctx.clip();
  }

  ctx.clearRect(0, 0, TILE, TILE);
  ctx.restore();
}

function applyTerminatorShadow(ctx, phaseIdx, litFrac) {
  if (litFrac <= 0 || litFrac >= 1) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  ctx.clip();

  const image = ctx.getImageData(0, 0, TILE, TILE);
  const data = image.data;

  for (let py = 0; py < TILE; py++) {
    for (let px = 0; px < TILE; px++) {
      const dx = px - MOON_CX;
      const dy = py - MOON_CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MOON_RADIUS) continue;

      let inLit = false;

      if (phaseIdx === 2) {
        inLit = dx >= 0;
      } else if (phaseIdx === 6) {
        inLit = dx <= 0;
      } else {
        const nx  = dx / MOON_RADIUS;
        const ny  = dy / MOON_RADIUS;
        const arc = Math.sqrt(clamp(1 - nx * nx, 0, 1));

        if (phaseIdx === 1) {
          const off = 1 - litFrac * 2.0;
          inLit = nx > off * arc;
        } else if (phaseIdx === 7) {
          const off = 1 - litFrac * 2.0;
          inLit = nx < -off * arc;
        } else if (phaseIdx === 3) {
          const off = (litFrac - 0.5) * 2.0;
          inLit = nx > off * arc;
        } else if (phaseIdx === 5) {
          const off = (litFrac - 0.5) * 2.0;
          inLit = nx < off * arc;
        }
      }

      const i = (py * TILE + px) * 4;
      if (!inLit) {
        const edge = clamp((MOON_RADIUS - dist) / (4 * RENDER_SCALE), 0, 1);
        const s = 0.08 + 0.08 * edge;
        data[i]     = Math.round(data[i]     * s);
        data[i + 1] = Math.round(data[i + 1] * s);
        data[i + 2] = Math.round(data[i + 2] * s);
        data[i + 3] = Math.round(data[i + 3] * 0.88);
      } else {
        const w = clamp((dx / MOON_RADIUS + 1) / 2, 0, 1);
        const b = 1.0 + w * 0.15;
        data[i]     = clamp(Math.round(data[i]     * b + 8),  0, 255);
        data[i + 1] = clamp(Math.round(data[i + 1] * b + 8),  0, 255);
        data[i + 2] = clamp(Math.round(data[i + 2] * b + 14), 0, 255);
      }
    }
  }
  ctx.putImageData(image, 0, 0);
  ctx.restore();
}

function drawFrame(ctx, phaseIdx) {
  const litFrac = PHASES[phaseIdx].litFrac;

  drawDarkBase(ctx);

  if (litFrac > 0) {
    const tmp = createCanvas(TILE, TILE);
    const tctx = tmp.getContext("2d");
    tctx.imageSmoothingEnabled = false;
    drawFullMoon(tctx);
    drawLitShape(tctx, phaseIdx, litFrac);
    applyTerminatorShadow(tctx, phaseIdx, litFrac);
    ctx.drawImage(tmp, 0, 0);
  }

  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.beginPath();
  ctx.arc(MOON_CX, MOON_CY, MOON_RADIUS, 0, Math.PI * 2);
  const edgeG = ctx.createRadialGradient(
    MOON_CX, MOON_CY, MOON_RADIUS * 0.80,
    MOON_CX, MOON_CY, MOON_RADIUS
  );
  edgeG.addColorStop(0, "rgba(255,255,255,0)");
  edgeG.addColorStop(1, "rgba(180,205,240,0.18)");
  ctx.fillStyle = edgeG;
  ctx.fill();
  ctx.restore();
}

function downscale(src) {
  const out = createCanvas(FRAME_SIZE, FRAME_SIZE);
  const oc  = out.getContext("2d");
  oc.imageSmoothingEnabled = false;
  oc.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
  oc.drawImage(src, 0, 0, FRAME_SIZE, FRAME_SIZE);
  return out;
}

function generate() {
  const sheet = createCanvas(SHEET_WIDTH, SHEET_HEIGHT);
  const sc    = sheet.getContext("2d");
  sc.imageSmoothingEnabled = false;
  sc.clearRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);

  for (let f = 0; f < FRAME_COUNT; f++) {
    const fc = createCanvas(TILE, TILE);
    const fc_ctx = fc.getContext("2d");
    fc_ctx.imageSmoothingEnabled = false;
    drawFrame(fc_ctx, f);
    sc.drawImage(downscale(fc), f * FRAME_SIZE, 0);
  }
  return sheet;
}

function main() {
  const img = generate();
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, img.toBuffer("image/png"));
  console.log(`Generated: ${OUTPUT_PATH} (${SHEET_WIDTH}x${SHEET_HEIGHT})`);
}

main();