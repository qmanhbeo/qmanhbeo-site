"use client"

import { useEffect, useState } from "react"

export interface OverlayLayoutMetrics {
  viewportHeight: number
  viewportWidth: number
  topOccupiedY: number
  bottomOccupiedY: number
  topBand: {
    start: number
    end: number
  }
  bottomBand: {
    start: number
    end: number
  }
}

export function useWorldOverlayLayout(): OverlayLayoutMetrics | null {
  const [metrics, setMetrics] = useState<OverlayLayoutMetrics | null>(null)

  useEffect(() => {
    const computeMetrics = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      const vw = window.innerWidth

      const headerHeight = 80
      const topOccupiedY = headerHeight

      const bottomControlHeight = 180
      const bottomOccupiedY = vh - bottomControlHeight

      const freeStart = topOccupiedY
      const freeEnd = bottomOccupiedY
      const freeHeight = freeEnd - freeStart

      const topBandStart = freeStart + freeHeight * 0.05
      const topBandEnd = freeStart + freeHeight * 0.35

      const bottomBandStart = freeEnd - freeHeight * 0.40
      const bottomBandEnd = freeEnd - freeHeight * 0.05

      setMetrics({
        viewportHeight: vh,
        viewportWidth: vw,
        topOccupiedY,
        bottomOccupiedY,
        topBand: {
          start: topBandStart,
          end: topBandEnd,
        },
        bottomBand: {
          start: bottomBandStart,
          end: bottomBandEnd,
        },
      })
    }

    computeMetrics()

    const onResize = () => computeMetrics()
    window.addEventListener("resize", onResize)
    window.visualViewport?.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      window.visualViewport?.removeEventListener("resize", onResize)
    }
  }, [])

  return metrics
}