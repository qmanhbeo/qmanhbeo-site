"use client"

import { useEffect, useState } from "react"
import { gameBridge, type BuildingLabelState } from "@/game/GameBridge"

export default function BuildingLabelsOverlay() {
  const [labels, setLabels] = useState<BuildingLabelState[]>([])

  useEffect(() => {
    const off = gameBridge.on("building-labels", (data) => {
      setLabels(data)
    })
    return off
  }, [])

  return (
    <>
      {labels.map(
        (b) =>
          b.visible && (
            <span
              key={b.id}
              className="font-cinzel text-[15px] text-[#f4dcb1] drop-shadow-[0_2px_4px_rgba(27,18,8,0.8)]"
              style={{
                position: "absolute",
                left: b.screenX,
                top: b.screenY,
                transform: "translate3d(-50%, 0, 0)",
                willChange: "transform",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {b.label}
            </span>
          ),
      )}
    </>
  )
}
