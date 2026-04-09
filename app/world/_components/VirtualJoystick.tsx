"use client"

import { type MutableRefObject, useEffect, useRef, useState } from "react"
import type { JoystickInputState } from "@/game/types"

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
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [stickOffset, setStickOffset] = useState({ x: 0, y: 0 })
  const padRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

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
    }

    const resetPad = () => {
      isDraggingRef.current = false
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
      className="relative h-28 w-28 rounded-full border border-amber-300/18 bg-[#120a08]/75 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      onPointerDown={() => {
        isDraggingRef.current = true
      }}
    >
      <div className="absolute inset-[26px] rounded-full border border-amber-400/12" />
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/30 bg-amber-200/10 transition-transform"
        style={{ transform: `translate(calc(-50% + ${stickOffset.x}px), calc(-50% + ${stickOffset.y}px))` }}
      />
    </div>
  )

  const interactButton = (
    <button
      type="button"
      data-testid="world-interact-button"
      className="h-20 w-20 rounded-full border border-amber-400/30 bg-[#3a2010]/88 font-cinzel text-lg text-amber-50 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      onPointerDown={() => {
        joystickRef.current = {
          ...joystickRef.current,
          interact: true,
        }
      }}
      onPointerUp={() => {
        joystickRef.current = {
          ...joystickRef.current,
          interact: false,
        }
      }}
      onPointerLeave={() => {
        joystickRef.current = {
          ...joystickRef.current,
          interact: false,
        }
      }}
    >
      E
    </button>
  )

  if (placement === "docked") {
    return (
      <div
        data-testid="world-mobile-controls"
        className="flex min-h-[8.5rem] items-center justify-between rounded-[1.75rem] border border-amber-500/18 bg-[#140c08]/88 px-6 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm"
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
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute bottom-6 left-5">
        {joystickPad}
      </div>

      <div className="pointer-events-auto absolute bottom-7 right-5">
        {interactButton}
      </div>
    </div>
  )
}
