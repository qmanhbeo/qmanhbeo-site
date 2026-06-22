"use client"

import { type MutableRefObject, useEffect, useRef, useState } from "react"
import type { JoystickInputState } from "@/game/types"
import { useWorld } from "@/context/WorldContext"
import { gameBridge } from "@/game/GameBridge"

interface VirtualJoystickProps {
  joystickRef: MutableRefObject<JoystickInputState>
  placement?: "overlay" | "docked"
}

const ZERO_INPUT: JoystickInputState = {
  x: 0,
  y: 0,
  interact: false,
}

export default function VirtualJoystick({ joystickRef, placement = "overlay" }: VirtualJoystickProps) {
  const { dialogueState } = useWorld()
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [stickOffset, setStickOffset] = useState({ x: 0, y: 0 })
  const padRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const choicesVisibleRef = useRef(false)
  const lastChoiceNavRef = useRef<"up" | "down" | null>(null)
  choicesVisibleRef.current = !!dialogueState.choices && dialogueState.choices.length > 0

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)")
    const sync = () => setIsCoarsePointer(mediaQuery.matches)
    sync()
    mediaQuery.addEventListener("change", sync)
    return () => mediaQuery.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    joystickRef.current = ZERO_INPUT
  }, [joystickRef])

  useEffect(() => {
    if (!isCoarsePointer) return

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current || !padRef.current) return

      const rect = padRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = event.clientX - centerX
      const deltaY = event.clientY - centerY
      const maxRadius = rect.width * 0.28
      const distance = Math.hypot(deltaX, deltaY)
      const ratio = distance > maxRadius ? maxRadius / distance : 1
      const nextX = deltaX * ratio
      const nextY = deltaY * ratio

      setStickOffset({ x: nextX, y: nextY })
      joystickRef.current = {
        ...joystickRef.current,
        x: nextX / maxRadius,
        y: nextY / maxRadius,
      }

      if (choicesVisibleRef.current) {
        const normalizedY = nextY / maxRadius
        if (normalizedY < -0.5 && lastChoiceNavRef.current !== "up") {
          lastChoiceNavRef.current = "up"
          gameBridge.emit("choice-navigate", { direction: "up" })
        } else if (normalizedY > 0.5 && lastChoiceNavRef.current !== "down") {
          lastChoiceNavRef.current = "down"
          gameBridge.emit("choice-navigate", { direction: "down" })
        } else if (Math.abs(normalizedY) < 0.3) {
          lastChoiceNavRef.current = null
        }
      }
    }

    const resetPad = () => {
      isDraggingRef.current = false
      lastChoiceNavRef.current = null
      setStickOffset({ x: 0, y: 0 })
      joystickRef.current = {
        ...joystickRef.current,
        x: 0,
        y: 0,
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", resetPad)
    window.addEventListener("pointercancel", resetPad)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", resetPad)
      window.removeEventListener("pointercancel", resetPad)
    }
  }, [isCoarsePointer, joystickRef])

  if (!isCoarsePointer) return null

  const joystickPad = (
    <div
      ref={padRef}
      data-testid="world-joystick-pad"
      className="relative h-32 w-32 rounded-full border border-amber-300/20 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
      onPointerDown={() => {
        isDraggingRef.current = true
      }}
    >
      <div className="absolute inset-[26px] rounded-full border border-amber-400/10" />
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/20 bg-amber-100/5 transition-transform"
        style={{ transform: `translate(calc(-50% + ${stickOffset.x}px), calc(-50% + ${stickOffset.y}px))` }}
      />
    </div>
  )

  const handleInteract = () => {
    if (dialogueState.isOpen) {
      gameBridge.emit("dialogue-interact", undefined)
      return
    }
    joystickRef.current = {
      ...joystickRef.current,
      interact: true,
    }
  }

  const handleInteractEnd = () => {
    if (dialogueState.isOpen) return
    joystickRef.current = {
      ...joystickRef.current,
      interact: false,
    }
  }

  const interactButton = (
    <button
      type="button"
      data-testid="world-interact-button"
      className="h-32 w-32 rounded-full border border-amber-400/25 bg-transparent font-cinzel text-lg text-amber-200/70 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
      onPointerDown={handleInteract}
      onPointerUp={handleInteractEnd}
      onPointerLeave={handleInteractEnd}
    >
      E
    </button>
  )

  if (placement === "docked") {
    return (
      <div
        data-testid="world-mobile-controls"
        className="flex min-h-[8.5rem] items-center justify-between rounded-[1.75rem] border border-amber-500/18 bg-transparent px-6 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      >
        <div className="flex flex-col items-center gap-2">
          {joystickPad}
          <span className="font-cinzel text-[0.62rem] uppercase tracking-[0.24em] text-amber-300/55">Move</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          {interactButton}
          <span className="font-cinzel text-[0.62rem] uppercase tracking-[0.24em] text-amber-300/55">Action</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="pointer-events-auto absolute"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 48px)",
          left: "48px",
        }}
      >
        {joystickPad}
      </div>

      <div
        className="pointer-events-auto absolute"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 48px)",
          right: "48px",
        }}
      >
        {interactButton}
      </div>
    </div>
  )
}
