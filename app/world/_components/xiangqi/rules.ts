import type { GridPos, Piece } from "./types"
import { GRID } from "./types"

interface Delta {
  dc: number
  dr: number
  ec: number
  er: number
}

const ELEPHANT_DELTAS: Delta[] = [
  { dc: -2, dr: -2, ec: -1, er: -1 },
  { dc: 2, dr: -2, ec: 1, er: -1 },
  { dc: -2, dr: 2, ec: -1, er: 1 },
  { dc: 2, dr: 2, ec: 1, er: 1 },
]

function posToIndex(col: number, row: number): number {
  return row * GRID.cols + col
}

function buildOccupancyMap(pieces: Piece[]): (Piece | null)[] {
  const map: (Piece | null)[] = new Array(GRID.cols * GRID.rows).fill(null)
  for (const piece of pieces) {
    if (piece.type !== "elephant") continue
    const idx = posToIndex(piece.gridPos.col, piece.gridPos.row)
    map[idx] = piece
  }
  return map
}

export function getElephantMoves(piece: Piece, allPieces: Piece[]): GridPos[] {
  const { col, row } = piece.gridPos
  const occupancy = buildOccupancyMap(allPieces)
  const results: GridPos[] = []

  for (const delta of ELEPHANT_DELTAS) {
    const nc = col + delta.dc
    const nr = row + delta.dr

    if (nc < 0 || nc >= GRID.cols || nr < 0 || nr >= GRID.rows) continue

    const sameSide = (row < 5 && nr < 5) || (row > 4 && nr > 4)
    if (!sameSide) continue

    const eyeIdx = posToIndex(col + delta.ec, row + delta.er)
    if (occupancy[eyeIdx] !== null) continue

    const destIdx = posToIndex(nc, nr)
    const occupant = occupancy[destIdx]
    if (occupant && occupant.side === piece.side) continue

    results.push({ col: nc, row: nr })
  }

  return results
}
