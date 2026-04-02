"use client"

import { useEffect, useRef, useState } from "react"

type UseResponsiveCarouselWidthOptions = {
  gap: number
  minWidth?: number
}

export function useResponsiveCarouselWidth({ gap, minWidth = 240 }: UseResponsiveCarouselWidthOptions) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [itemWidth, setItemWidth] = useState(minWidth)

  useEffect(() => {
    const element = shellRef.current
    if (!element) return

    const computeWidth = () => {
      const shellWidth = element.clientWidth
      const cardsPerView = shellWidth >= 1280 ? 4 : shellWidth >= 1000 ? 3 : shellWidth >= 600 ? 2 : 1
      const candidateWidth = (shellWidth - gap * (cardsPerView - 1)) / cardsPerView
      setItemWidth(Math.max(minWidth, Math.round(candidateWidth)))
    }

    const resizeObserver = new ResizeObserver(computeWidth)
    resizeObserver.observe(element)
    computeWidth()

    return () => {
      resizeObserver.disconnect()
    }
  }, [gap, minWidth])

  return { shellRef, itemWidth }
}

