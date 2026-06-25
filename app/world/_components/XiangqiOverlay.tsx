"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import FocusTrap from "focus-trap-react"
import { X } from "lucide-react"
import { type BoardState, gridToImage, imageToGrid } from "./xiangqi/types"
import { createInitialBoard } from "./xiangqi/board"
import { getElephantMoves } from "./xiangqi/rules"
import { loadBoardState, saveBoardState, clearBoardState } from "./xiangqi/persist"

const BOARD_SIZE = 1024
const PIECE_SIZE_PCT = (75 / BOARD_SIZE) * 100

interface XiangqiOverlayProps {
  onClose: () => void
}

export default function XiangqiOverlay({ onClose }: XiangqiOverlayProps) {
  const [board, setBoard] = useState<BoardState>(loadBoardState)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => saveBoardState(board.pieces)
  }, [board.pieces])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handlePieceClick = useCallback((pieceId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setBoard((prev) => {
      const piece = prev.pieces.find((p) => p.id === pieceId)
      if (!piece) return prev

      if (piece.type === "teacup") {
        const nextHeld = !prev.teacupHeld
        return {
          ...prev,
          selectedPieceId: nextHeld ? pieceId : null,
          validMoves: [],
          teacupHeld: nextHeld,
          message: nextHeld ? "Place the teacup anywhere on the board" : "",
        }
      }

      if (prev.teacupHeld) return prev

      if (prev.selectedPieceId === pieceId) {
        return { ...prev, selectedPieceId: null, validMoves: [], message: "" }
      }

      const moves = getElephantMoves(piece, prev.pieces)
      if (moves.length === 0) {
        return {
          ...prev,
          selectedPieceId: null,
          validMoves: [],
          message: "This elephant has no valid moves",
        }
      }

      return {
        ...prev,
        selectedPieceId: pieceId,
        validMoves: moves,
        message: "",
      }
    })
  }, [])

  const handleBoardClick = useCallback((e: React.MouseEvent) => {
    if (!boardRef.current) return

    const rect = boardRef.current.getBoundingClientRect()
    const scaleX = BOARD_SIZE / rect.width
    const scaleY = BOARD_SIZE / rect.height
    const imgX = (e.clientX - rect.left) * scaleX
    const imgY = (e.clientY - rect.top) * scaleY

    setBoard((prev) => {
      if (prev.teacupHeld && prev.selectedPieceId) {
        return {
          ...prev,
          pieces: prev.pieces.map((p) =>
            p.id === prev.selectedPieceId
              ? { ...p, imageX: imgX, imageY: imgY, gridPos: { col: -1, row: -1 } }
              : p,
          ),
          selectedPieceId: null,
          teacupHeld: false,
          message: "",
        }
      }

      if (!prev.selectedPieceId || prev.validMoves.length === 0) {
        return { ...prev, selectedPieceId: null, validMoves: [], message: "" }
      }

      const clickGrid = imageToGrid(imgX, imgY)
      if (!clickGrid) {
        return { ...prev, selectedPieceId: null, validMoves: [], message: "" }
      }

      const matchedMove = prev.validMoves.find(
        (m) => m.col === clickGrid.col && m.row === clickGrid.row,
      )
      if (!matchedMove) {
        return { ...prev, selectedPieceId: null, validMoves: [], message: "" }
      }

      const selectedPiece = prev.pieces.find((p) => p.id === prev.selectedPieceId)
      if (!selectedPiece) return { ...prev, selectedPieceId: null, validMoves: [], message: "" }

      const destPos = gridToImage(matchedMove)

      const captured = prev.pieces.find(
        (p) =>
          p.id !== prev.selectedPieceId &&
          p.type === "elephant" &&
          p.gridPos.col === matchedMove.col &&
          p.gridPos.row === matchedMove.row,
      )

      const message = captured ? "Captured!" : ""

      return {
        ...prev,
        pieces: [
          ...prev.pieces.filter((p) => !captured || p.id !== captured.id).map((p) =>
            p.id === prev.selectedPieceId
              ? { ...p, gridPos: matchedMove, imageX: destPos.x, imageY: destPos.y }
              : p,
          ),
        ],
        selectedPieceId: null,
        validMoves: [],
        message,
      }
    })
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-slate-950/78 backdrop-blur-md" />

      <FocusTrap active={true} focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: false }}>
        <div
          className="relative z-10 flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Xiangqi board"
          onWheelCapture={(e) => e.stopPropagation()}
        >
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => {
                clearBoardState()
                setBoard(loadBoardState())
              }}
              className="rounded-full px-3 py-1.5 font-cinzel text-xs text-amber-300/60 transition hover:text-amber-200"
            >
              New Game
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-amber-100/70 transition hover:text-amber-50"
              aria-label="Close Xiangqi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={boardRef}
            tabIndex={0}
            className="relative cursor-pointer outline-none"
            style={{ width: "min(92vw, 90dvh)", height: "min(92vw, 90dvh)" }}
            onClick={handleBoardClick}
          >
            <img
              src="/game/xiangqi/xiangqi_boardonly.png"
              alt="Xiangqi board"
              className="pointer-events-none block h-full w-full select-none"
              draggable={false}
            />

            {board.pieces.map((piece) => {
              const src =
                piece.type === "teacup"
                  ? "/game/xiangqi/teacup.png"
                  : piece.side === "red"
                    ? "/game/xiangqi/red_elephant.png"
                    : "/game/xiangqi/black_elephant.png"

              const isSelected = piece.id === board.selectedPieceId
              const isHeld = board.teacupHeld && isSelected
              const pieceSize = piece.type === "teacup" ? PIECE_SIZE_PCT * 3 : PIECE_SIZE_PCT

              return (
                <img
                  key={piece.id}
                  src={src}
                  alt={piece.type === "teacup" ? "Teacup" : `${piece.side} elephant`}
                  className={`absolute cursor-pointer select-none transition-transform ${
                    isSelected && !board.teacupHeld
                      ? "scale-110 ring-2 ring-yellow-400/80 rounded-full"
                      : ""
                  } ${isHeld ? "opacity-60" : ""}`}
                  style={{
                    left: `${(piece.imageX / BOARD_SIZE) * 100}%`,
                    top: `${(piece.imageY / BOARD_SIZE) * 100}%`,
                    width: `${pieceSize}%`,
                    height: `${pieceSize}%`,
                    transform: "translate(-50%, -50%)",
                    objectFit: "contain",
                  }}
                  draggable={false}
                  onClick={(e) => handlePieceClick(piece.id, e)}
                />
              )
            })}

            {board.validMoves.map((move, i) => {
              const pos = gridToImage(move)
              return (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-yellow-400/60 bg-yellow-400/30 animate-pulse pointer-events-none"
                  style={{
                    left: `${(pos.x / BOARD_SIZE) * 100}%`,
                    top: `${(pos.y / BOARD_SIZE) * 100}%`,
                    width: `${PIECE_SIZE_PCT * 0.8}%`,
                    height: `${PIECE_SIZE_PCT * 0.8}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )
            })}

            {board.message && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-xl bg-slate-950/70 px-5 py-2.5 font-cinzel text-xs text-amber-200/90 backdrop-blur-sm md:text-sm">
                  {board.message}
                </div>
              </div>
            )}
          </div>
        </div>
      </FocusTrap>
    </div>,
    document.body,
  )
}
