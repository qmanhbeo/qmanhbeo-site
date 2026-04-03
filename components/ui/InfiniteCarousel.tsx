"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"

type InfiniteCarouselProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemWidth: number
  gap?: number
  className?: string
  snap?: "left" | "center"
  itemAlign?: "stretch" | "start" | "center"
  initialIndex?: number
}

export default function InfiniteCarousel<T>({
  items,
  renderItem,
  itemWidth,
  gap = 20,
  className = "",
  snap = "left",
  itemAlign = "stretch",
  initialIndex = 0,
}: InfiniteCarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const xRef = useRef(0)
  const velocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const wheelIdleTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const centerXRef = useRef(0)

  const itemCount = items.length
  const span = itemWidth + gap
  const totalSpan = itemCount * span
  const normalizedInitialIndex = itemCount > 0 ? ((initialIndex % itemCount) + itemCount) % itemCount : 0

  const setTransform = useCallback((x: number) => {
    const track = trackRef.current
    if (track) {
      track.style.transform = `translate3d(${x}px, 0, 0)`
    }
  }, [])

  const wrapIfNeeded = useCallback(() => {
    const currentX = xRef.current
    const distanceFromCenter = currentX - centerXRef.current

    if (distanceFromCenter < -totalSpan) {
      xRef.current = currentX + totalSpan
      setTransform(xRef.current)
    } else if (distanceFromCenter > totalSpan) {
      xRef.current = currentX - totalSpan
      setTransform(xRef.current)
    }
  }, [setTransform, totalSpan])

  const getSnapTarget = useCallback(
    (x: number) => {
      if (snap === "center") {
        const viewportCenter = (viewportRef.current?.clientWidth ?? 0) / 2
        const centeredOffset = viewportCenter - itemWidth / 2
        const base = Math.round((x - centeredOffset) / span) * span + centeredOffset
        const k = Math.round((base - centerXRef.current) / span)
        return centerXRef.current + k * span
      }

      const k = Math.round((x - centerXRef.current) / span)
      return centerXRef.current + k * span
    },
    [itemWidth, snap, span],
  )

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const startRaf = useCallback(() => {
    if (rafRef.current !== null) return

    const friction = 0.94
    const minVelocity = 0.08

    const tick = () => {
      rafRef.current = null

      if (isDraggingRef.current) return

      if (Math.abs(velocityRef.current) > minVelocity) {
        xRef.current += velocityRef.current
        velocityRef.current *= friction
        wrapIfNeeded()
        setTransform(xRef.current)
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const target = getSnapTarget(xRef.current)
      const delta = target - xRef.current

      if (Math.abs(delta) > 0.5) {
        xRef.current += delta * 0.12
        wrapIfNeeded()
        setTransform(xRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [getSnapTarget, setTransform, wrapIfNeeded])

  const animateTo = useCallback(
    (target: number) => {
      stopRaf()

      const step = () => {
        const delta = target - xRef.current

        if (Math.abs(delta) < 0.5) {
          xRef.current = target
          setTransform(xRef.current)
          startRaf()
          return
        }

        xRef.current += delta * 0.18
        wrapIfNeeded()
        setTransform(xRef.current)
        rafRef.current = requestAnimationFrame(step)
      }

      rafRef.current = requestAnimationFrame(step)
    },
    [setTransform, startRaf, stopRaf, wrapIfNeeded],
  )

  // Disable drag-to-scroll to ensure click events on items work reliably.
  // Horizontal movement is still available via wheel and keyboard.
  useEffect(() => {
    // Intentionally left blank – pointer dragging is disabled.
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const appliedDelta = -primaryDelta

      event.preventDefault()
      event.stopPropagation()

      xRef.current += appliedDelta
      velocityRef.current = appliedDelta
      wrapIfNeeded()
      setTransform(xRef.current)

      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current)
      }

      wheelIdleTimerRef.current = window.setTimeout(() => {
        startRaf()
      }, 60)
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      viewport.removeEventListener("wheel", handleWheel)
    }
  }, [setTransform, startRaf, wrapIfNeeded])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

      event.preventDefault()
      const direction = event.key === "ArrowRight" ? -1 : 1
      animateTo(xRef.current + direction * span)
    }

    viewport.addEventListener("keydown", handleKeyDown)
    return () => {
      viewport.removeEventListener("keydown", handleKeyDown)
    }
  }, [animateTo, span])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track || itemCount === 0) return

    centerXRef.current = -itemCount * span
    xRef.current = centerXRef.current - normalizedInitialIndex * span
    track.style.gap = `${gap}px`
    setTransform(xRef.current)
  }, [gap, itemCount, normalizedInitialIndex, setTransform, span])

  useEffect(() => {
    return () => {
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current)
      }

      stopRaf()
    }
  }, [stopRaf])

  const trackAlignItems =
    itemAlign === "start" ? "flex-start" : itemAlign === "center" ? "center" : "stretch"
  const fadeStateClassName = className.includes("scroll-fade-horizontal") ? "mask-both-horizontal" : ""

  return (
    <div
      ref={viewportRef}
      data-swipe-zone
      className={`carousel-viewport outline-none ${fadeStateClassName} ${className}`}
      tabIndex={0}
      aria-label="Infinite carousel"
      role="region"
    >
      <div ref={trackRef} className="carousel-track" style={{ alignItems: trackAlignItems }}>
        {itemCount === 0
          ? null
          : [...items, ...items, ...items].map((item, index) => (
              <div key={`${index}-${index % itemCount}`} className="carousel-item" style={{ width: `${itemWidth}px` }}>
                {renderItem(item, index % itemCount)}
              </div>
            ))}
      </div>
    </div>
  )
}
