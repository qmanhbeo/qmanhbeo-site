"use client"

import { type MutableRefObject, useEffect, useRef, useState } from "react"
import { gameBridge } from "@/game/GameBridge"
import type { JoystickInputState, PlayerPosition } from "@/game/types"

interface WorldCanvasProps {
  initialPlayerPosition: PlayerPosition
  initialUiLocked: boolean
  joystickRef: MutableRefObject<JoystickInputState>
}

export default function WorldCanvas({
  initialPlayerPosition,
  initialUiLocked,
  joystickRef,
}: WorldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const initialPlayerPositionRef = useRef(initialPlayerPosition)
  const initialUiLockedRef = useRef(initialUiLocked)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    let cancelled = false
    let phaserGame: { destroy: (removeCanvas: boolean, noReturn?: boolean) => void } | null = null

    const offLoadProgress = gameBridge.on("load-progress", ({ progress }) => {
      setLoadProgress(progress)
    })

    void (async () => {
      const { createPhaserGame } = await import("@/game/PhaserGame")
      if (cancelled || !containerRef.current) return

      phaserGame = createPhaserGame({
        container: containerRef.current,
        getJoystickInput: () => joystickRef.current,
        initialPlayerPosition: initialPlayerPositionRef.current,
        initialUiLocked: initialUiLockedRef.current,
      })
    })()

    return () => {
      cancelled = true
      offLoadProgress()
      phaserGame?.destroy(true)
    }
  }, [joystickRef])

  return (
    <div
      data-testid="world-canvas-shell"
      className="relative h-full w-full overflow-hidden rounded-[2rem] border border-amber-500/16 bg-[#080605]"
    >
      <div ref={containerRef} className="h-full w-full" />

      {loadProgress < 1 ? (
        <div className="pointer-events-none absolute inset-x-8 top-8 z-20 rounded-full border border-amber-200/12 bg-black/35 px-4 py-3 backdrop-blur-sm">
          <div className="h-2 overflow-hidden rounded-full bg-amber-50/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 transition-[width] duration-300"
              style={{ width: `${Math.max(loadProgress * 100, 12)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
