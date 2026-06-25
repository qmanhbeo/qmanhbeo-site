import { type BoardState, type Piece, gridToImage } from "./types"

let nextId = 1

function makeElephant(col: number, row: number, side: "red" | "black"): Piece {
  const pos = gridToImage({ col, row })
  return {
    id: `elephant-${side}-${nextId++}`,
    type: "elephant",
    side,
    gridPos: { col, row },
    imageX: pos.x,
    imageY: pos.y,
  }
}

export function createInitialBoard(): BoardState {
  nextId = 1

  const redPositions: [number, number][] = [
    [0, 9], [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
    [0, 6], [2, 6], [4, 6], [6, 6], [8, 6],
    [1, 7], [7, 7],
  ]

  const blackPositions: [number, number][] = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0],
    [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
    [1, 2], [7, 2],
  ]

  const pieces: Piece[] = [
    ...redPositions.map(([c, r]) => makeElephant(c, r, "red")),
    ...blackPositions.map(([c, r]) => makeElephant(c, r, "black")),
    {
      id: "teacup-1",
      type: "teacup",
      side: "neutral",
      gridPos: { col: -1, row: -1 },
      imageX: 55,
      imageY: 255,
    },
  ]

  return {
    pieces,
    selectedPieceId: null,
    validMoves: [],
    teacupHeld: false,
    message: "",
  }
}
