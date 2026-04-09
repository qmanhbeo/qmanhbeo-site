#!/usr/bin/env python3
"""Generate repo-owned pixel art sprites for the /world route."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "game" / "characters"

RGBA = tuple[int, int, int, int]

TRANSPARENT: RGBA = (0, 0, 0, 0)
OUTLINE: RGBA = (28, 15, 10, 255)
SHADOW: RGBA = (0, 0, 0, 88)
SKIN: RGBA = (245, 208, 139, 255)
SKIN_NPC: RGBA = (241, 201, 152, 255)
EYE: RGBA = (42, 22, 14, 255)
AMBER: RGBA = (255, 210, 123, 255)


def write_png(path: Path, width: int, height: int, pixels: list[list[RGBA]]) -> None:
    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + chunk_type
            + data
            + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + b"".join(bytes(pixel) for pixel in row) for row in pixels)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def blank(width: int, height: int) -> list[list[RGBA]]:
    return [[TRANSPARENT for _ in range(width)] for _ in range(height)]


def rect(pixels: list[list[RGBA]], x: int, y: int, width: int, height: int, color: RGBA) -> None:
    for row in range(max(0, y), min(len(pixels), y + height)):
        for col in range(max(0, x), min(len(pixels[row]), x + width)):
            pixels[row][col] = color


def ellipse(pixels: list[list[RGBA]], cx: float, cy: float, rx: float, ry: float, color: RGBA) -> None:
    for row in range(len(pixels)):
        for col in range(len(pixels[row])):
            if ((col + 0.5 - cx) / rx) ** 2 + ((row + 0.5 - cy) / ry) ** 2 <= 1:
                pixels[row][col] = color


def triangle(
    pixels: list[list[RGBA]],
    a: tuple[float, float],
    b: tuple[float, float],
    c: tuple[float, float],
    color: RGBA,
) -> None:
    def edge(p: tuple[float, float], q: tuple[float, float], r: tuple[float, float]) -> float:
        return (r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])

    min_x = int(max(0, min(a[0], b[0], c[0])))
    max_x = int(min(len(pixels[0]) - 1, max(a[0], b[0], c[0])))
    min_y = int(max(0, min(a[1], b[1], c[1])))
    max_y = int(min(len(pixels) - 1, max(a[1], b[1], c[1])))

    for row in range(min_y, max_y + 1):
      for col in range(min_x, max_x + 1):
        point = (col + 0.5, row + 0.5)
        w0 = edge(b, c, point)
        w1 = edge(c, a, point)
        w2 = edge(a, b, point)
        if (w0 >= 0 and w1 >= 0 and w2 >= 0) or (w0 <= 0 and w1 <= 0 and w2 <= 0):
            pixels[row][col] = color


def character(
    cloak: RGBA,
    hair: RGBA,
    accent: RGBA,
    skin: RGBA = SKIN_NPC,
    scarf: RGBA | None = None,
) -> list[list[RGBA]]:
    pixels = blank(24, 28)

    ellipse(pixels, 12, 25, 8.5, 2.5, SHADOW)
    rect(pixels, 6, 9, 12, 15, OUTLINE)
    rect(pixels, 5, 12, 14, 9, OUTLINE)
    rect(pixels, 6, 10, 12, 13, cloak)
    rect(pixels, 7, 11, 10, 6, tuple(max(0, channel - 18) if index < 3 else channel for index, channel in enumerate(cloak)))
    rect(pixels, 7, 18, 10, 5, tuple(max(0, channel - 34) if index < 3 else channel for index, channel in enumerate(cloak)))

    rect(pixels, 7, 4, 10, 10, OUTLINE)
    rect(pixels, 8, 5, 8, 8, skin)
    rect(pixels, 6, 3, 12, 4, hair)
    rect(pixels, 6, 6, 3, 4, hair)
    rect(pixels, 15, 6, 3, 4, hair)
    rect(pixels, 9, 8, 2, 2, EYE)
    rect(pixels, 14, 8, 2, 2, EYE)
    rect(pixels, 11, 11, 3, 1, (119, 63, 36, 255))

    rect(pixels, 7, 14, 10, 2, scarf or accent)
    rect(pixels, 10, 20, 4, 3, accent)
    rect(pixels, 8, 24, 3, 2, OUTLINE)
    rect(pixels, 14, 24, 3, 2, OUTLINE)

    return pixels


def campfire() -> list[list[RGBA]]:
    pixels = blank(32, 32)
    log_dark: RGBA = (42, 23, 16, 255)
    log_mid: RGBA = (125, 74, 36, 255)
    stone: RGBA = (58, 42, 34, 255)

    rect(pixels, 7, 20, 18, 3, log_dark)
    rect(pixels, 8, 24, 18, 3, log_dark)
    rect(pixels, 7, 19, 10, 4, log_mid)
    rect(pixels, 16, 23, 11, 4, log_mid)
    ellipse(pixels, 5, 23, 2.5, 2.5, stone)
    ellipse(pixels, 9, 27, 2.5, 2.5, stone)
    ellipse(pixels, 23, 27, 2.5, 2.5, stone)
    ellipse(pixels, 27, 23, 2.5, 2.5, stone)

    triangle(pixels, (16, 3), (8, 22), (24, 22), (255, 210, 123, 255))
    triangle(pixels, (16, 7), (10, 23), (22, 23), (255, 122, 36, 255))
    triangle(pixels, (16, 11), (13, 22), (19, 22), (255, 241, 183, 255))
    rect(pixels, 15, 24, 3, 4, (255, 210, 123, 255))

    return pixels


def main() -> None:
    sprites = {
        "player.png": character(
            cloak=(138, 79, 36, 255),
            hair=(58, 31, 19, 255),
            accent=AMBER,
            skin=SKIN,
            scarf=(255, 196, 88, 255),
        ),
        "npc-alex.png": character(
            cloak=(94, 137, 194, 255),
            hair=(36, 19, 12, 255),
            accent=(255, 210, 123, 255),
        ),
        "npc-adam.png": character(
            cloak=(86, 150, 77, 255),
            hair=(68, 48, 29, 255),
            accent=(255, 210, 123, 255),
        ),
        "npc-avery.png": character(
            cloak=(184, 132, 47, 255),
            hair=(32, 26, 36, 255),
            accent=(255, 235, 160, 255),
        ),
        "campfire.png": campfire(),
    }

    for filename, pixels in sprites.items():
        write_png(OUT_DIR / filename, len(pixels[0]), len(pixels), pixels)


if __name__ == "__main__":
    main()
