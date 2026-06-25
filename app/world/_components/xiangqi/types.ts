export type Side = "red" | "black" | "neutral"

export interface GridPos {
  col: number
  row: number
}

export interface Piece {
  id: string
  type: "elephant" | "teacup"
  side: Side
  gridPos: GridPos
  imageX: number
  imageY: number
}

export interface BoardState {
  pieces: Piece[]
  selectedPieceId: string | null
  validMoves: GridPos[]
  teacupHeld: boolean
  message: string
}

export const GRID = {
  originX: 173,
  originY: 122,
  cellSize: 85,
  cols: 9,
  rows: 10,
}

export function gridToImage(pos: GridPos): { x: number; y: number } {
  return {
    x: GRID.originX + pos.col * GRID.cellSize,
    y: GRID.originY + pos.row * GRID.cellSize,
  }
}

export function imageToGrid(imgX: number, imgY: number): GridPos | null {
  const col = Math.round((imgX - GRID.originX) / GRID.cellSize)
  const row = Math.round((imgY - GRID.originY) / GRID.cellSize)
  if (col < 0 || col >= GRID.cols || row < 0 || row >= GRID.rows) return null
  const snapped = gridToImage({ col, row })
  const dist = Math.abs(snapped.x - imgX) + Math.abs(snapped.y - imgY)
  if (dist > GRID.cellSize * 0.6) return null
  return { col, row }
}
