import type { Piece, BoardState } from "./types"
import { createInitialBoard } from "./board"

const KEY = "xiangqi:board:v1"

export function saveBoardState(pieces: Piece[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(pieces))
  } catch {
    // storage full or unavailable — silently skip
  }
}

export function loadBoardState(): BoardState {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return createInitialBoard()
    const pieces = JSON.parse(raw) as Piece[]
    if (!Array.isArray(pieces) || pieces.length === 0) return createInitialBoard()
    return {
      pieces,
      selectedPieceId: null,
      validMoves: [],
      teacupHeld: false,
      message: "",
    }
  } catch {
    return createInitialBoard()
  }
}

export function clearBoardState() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // silently skip
  }
}
