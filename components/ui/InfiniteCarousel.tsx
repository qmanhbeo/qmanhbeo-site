// File: components/ui/InfiniteCarousel.tsx
"use client"

import React, { useEffect, useLayoutEffect, useRef } from "react"

type InfiniteCarouselProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemWidth: number
  gap?: number
  className?: string
  snap?: "left" | "center"
}

export default function InfiniteCarousel<T>({
  items,
  renderItem,
  itemWidth,
  gap = 20,
  className = "",
  snap = "left",
}: InfiniteCarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const xRef = useRef(0)
  const vRef = useRef(0)
  const draggingRef = useRef(false)
  const pointerStartXRef = useRef(0)
  const startXRef = useRef(0)
  const wheelIdleTimer = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const n = items.length
  const span = itemWidth + gap
  const totalSpan = n * span
  const centerX = useRef(0)

  const setTransform = (x: number) => {
    const track = trackRef.current
    if (track) track.style.transform = `translate3d(${x}px,0,0)`
  }

  const wrapIfNeeded = () => {
    const center = centerX.current
    const x = xRef.current
    const diff = x - center
    if (diff < -totalSpan) {
      xRef.current = x + totalSpan
      setTransform(xRef.current)
    } else if (diff > totalSpan) {
      xRef.current = x - totalSpan
      setTransform(xRef.current)
    }
  }

  const snapTargetLeft = (x: number) => {
    const center = centerX.current
    const diff = x - center
    const k = Math.round(diff / span)
    return center + k * span
  }

  const snapTargetCenter = (x: number) => {
    const vp = viewportRef.current
    const center = centerX.current
    const vpCenter = (vp?.clientWidth || 0) / 2
    const targetWithoutK = vpCenter - itemWidth / 2
    const base = Math.round((x - targetWithoutK) / span) * span + targetWithoutK
    const k = Math.round((base - center) / span)
    return center + k * span
  }

  const getSnapTarget = (x: number) => (snap === "center" ? snapTargetCenter(x) : snapTargetLeft(x))

  const startRaf = () => {
    if (rafRef.current != null) return
    const friction = 0.94
    const minV = 0.08

    const tick = () => {
      rafRef.current = null
      if (draggingRef.current) return

      if (Math.abs(vRef.current) > minV) {
        xRef.current += vRef.current
        vRef.current *= friction
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
  }

  const stopRaf = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true
      vp.classList.add("is-dragging")
      pointerStartXRef.current = e.clientX
      startXRef.current = xRef.current
      vRef.current = 0
      vp.setPointerCapture(e.pointerId)
      e.preventDefault()
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - pointerStartXRef.current
      const newX = startXRef.current + dx
      vRef.current = newX - xRef.current
      xRef.current = newX
      wrapIfNeeded()
      setTransform(xRef.current)
      e.preventDefault()
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      vp.classList.remove("is-dragging")
      vp.releasePointerCapture(e.pointerId)
      startRaf()
      e.preventDefault()
    }

    vp.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove, { passive: false })
    window.addEventListener("pointerup", onPointerUp, { passive: false })
    return () => {
      vp.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove as any)
      window.removeEventListener("pointerup", onPointerUp as any)
    }
  }, [])

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      const primary = absX > absY ? e.deltaX : e.deltaY
      const applied = -primary // down/right reveals next → move track left

      e.preventDefault()
      e.stopPropagation()

      xRef.current += applied
      vRef.current = applied
      wrapIfNeeded()
      setTransform(xRef.current)

      if (wheelIdleTimer.current) window.clearTimeout(wheelIdleTimer.current)
      wheelIdleTimer.current = window.setTimeout(() => startRaf(), 60)
    }

    vp.addEventListener("wheel", onWheel, { passive: false })
    return () => vp.removeEventListener("wheel", onWheel as any)
  }, [])

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      e.preventDefault()
      const dir = e.key === "ArrowRight" ? -1 : 1
      animateTo(xRef.current + dir * span)
    }
    vp.addEventListener("keydown", onKey)
    return () => vp.removeEventListener("keydown", onKey)
  }, [])

  const animateTo = (target: number) => {
    stopRaf()
    const ease = 0.18
    const step = () => {
      const d = target - xRef.current
      if (Math.abs(d) < 0.5) {
        xRef.current = target
        setTransform(xRef.current)
        startRaf()
        return
      }
      xRef.current += d * ease
      wrapIfNeeded()
      setTransform(xRef.current)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  useLayoutEffect(() => {
    const track = trackRef.current
    const vp = viewportRef.current
    if (!track || !vp) return
    centerX.current = -n * span
    xRef.current = centerX.current
    track.style.gap = `${gap}px`
    setTransform(xRef.current)
  }, [n, span, gap])

  useEffect(() => () => stopRaf(), [])

  const renderDeck = () => {
    const deck = [...items, ...items, ...items]
    return deck.map((item, i) => (
      <div
        key={`${i}-${(i % n + n) % n}`}
        className="carousel-item"
        style={{ width: `${itemWidth}px` }}
      >
        {renderItem(item, i % n)}
      </div>
    ))
  }

  return (
    <div
      ref={viewportRef}
      className={`carousel-viewport outline-none ${className}`}
      tabIndex={0}
      aria-label="Infinite carousel"
      role="region"
    >
      <div ref={trackRef} className="carousel-track">
        {renderDeck()}
      </div>
    </div>
  )
}
