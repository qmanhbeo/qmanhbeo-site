"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

type UseBoundaryPagedScrollOptions = {
  itemCount: number
  panelSelector: string
  transitionMs: number
  settleMs?: number
  flipThreshold?: number
  gestureIdleMs?: number
  initialIndex?: number
  initialPanelScrollTop?: number
}

export function useBoundaryPagedScroll({
  itemCount,
  panelSelector,
  transitionMs,
  settleMs = 0,
  flipThreshold = 90,
  gestureIdleMs = 160,
  initialIndex = 0,
  initialPanelScrollTop = 0,
}: UseBoundaryPagedScrollOptions) {
  const normalizedInitialIndex = itemCount > 0 ? ((initialIndex % itemCount) + itemCount) % itemCount : 0

  const [currentIndex, setCurrentIndex] = useState(normalizedInitialIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentIndexRef = useRef(normalizedInitialIndex)
  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const hasRestoredInitialPanelScrollRef = useRef(false)
  const initialPanelScrollTopRef = useRef(initialPanelScrollTop)
  const wheelStateRef = useRef({
    accum: 0,
    inhibitUntil: 0,
    lastWheelAt: 0,
    gestureId: 0,
    boundaryArmed: false,
    boundaryDirection: 0 as 1 | -1 | 0,
  })

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  useLayoutEffect(() => {
    const activePanel = panelRefs.current[currentIndex]
    if (!activePanel) return

    const nextTop = hasRestoredInitialPanelScrollRef.current ? 0 : initialPanelScrollTopRef.current

    activePanel.scrollTo({
      top: nextTop,
      behavior: "auto",
    })

    hasRestoredInitialPanelScrollRef.current = true
  }, [currentIndex])

  const resetBoundaryState = useCallback(() => {
    wheelStateRef.current.accum = 0
    wheelStateRef.current.boundaryArmed = false
    wheelStateRef.current.boundaryDirection = 0
  }, [])

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
  }, [])

  const goToIndex = useCallback(
    (index: number) => {
      if (isTransitioningRef.current || itemCount <= 0) return

      const normalizedIndex = ((index % itemCount) + itemCount) % itemCount
      isTransitioningRef.current = true
      setIsTransitioning(true)
      setCurrentIndex(normalizedIndex)
      wheelStateRef.current.inhibitUntil = performance.now() + transitionMs

      clearTransitionTimeout()
      transitionTimeoutRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false
        setIsTransitioning(false)
        transitionTimeoutRef.current = null
      }, transitionMs + settleMs)
    },
    [clearTransitionTimeout, itemCount, settleMs, transitionMs],
  )

  const goPrevious = useCallback(() => {
    goToIndex(currentIndexRef.current - 1)
  }, [goToIndex])

  const goNext = useCallback(() => {
    goToIndex(currentIndexRef.current + 1)
  }, [goToIndex])

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement
      const contentArea = target.closest(panelSelector)
      if (!(contentArea instanceof HTMLElement)) return

      const wheelState = wheelStateRef.current
      const absX = Math.abs(event.deltaX)
      const absY = Math.abs(event.deltaY)
      const verticalIntent = absY >= absX
      const now = performance.now()

      if (now - wheelState.lastWheelAt > gestureIdleMs) {
        wheelState.gestureId += 1
        wheelState.accum = 0
      }
      wheelState.lastWheelAt = now

      if (isTransitioningRef.current) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (verticalIntent && now < wheelState.inhibitUntil) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (!verticalIntent) return

      const atTop = contentArea.scrollTop <= 0
      const atBottom = contentArea.scrollTop + contentArea.clientHeight >= contentArea.scrollHeight - 1
      const goingDown = event.deltaY > 0
      const goingUp = event.deltaY < 0

      if ((goingDown && atBottom) || (goingUp && atTop)) {
        event.preventDefault()
        event.stopPropagation()

        const direction: 1 | -1 = goingDown ? 1 : -1

        if (!wheelState.boundaryArmed || wheelState.boundaryDirection !== direction) {
          wheelState.boundaryArmed = true
          wheelState.boundaryDirection = direction
          wheelState.accum = 0
          return
        }

        wheelState.accum += event.deltaY

        if (Math.abs(wheelState.accum) >= flipThreshold) {
          resetBoundaryState()
          goToIndex(currentIndexRef.current + direction)
        }

        return
      }

      resetBoundaryState()
    }

    document.addEventListener("wheel", handleWheel, { passive: false, capture: true })
    return () => {
      document.removeEventListener("wheel", handleWheel, true)
    }
  }, [flipThreshold, gestureIdleMs, goToIndex, panelSelector, resetBoundaryState])

  useEffect(() => {
    return () => {
      clearTransitionTimeout()
    }
  }, [clearTransitionTimeout])

  return {
    currentIndex,
    isTransitioning,
    panelRefs,
    goToIndex,
    goPrevious,
    goNext,
  }
}
