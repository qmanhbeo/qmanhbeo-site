"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

type MobileSnapCarouselProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  initialIndex?: number
  gap?: number
  itemWidth?: string
  className?: string
  viewportClassName?: string
  itemClassName?: string
}

export default function MobileSnapCarousel<T>({
  items,
  renderItem,
  initialIndex = 0,
  gap = 16,
  itemWidth = "90vw",
  className = "",
  viewportClassName = "",
  itemClassName = "",
}: MobileSnapCarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const scrollFrameRef = useRef<number | null>(null)
  const itemCount = items.length
  const normalizedInitialIndex = itemCount > 0 ? ((initialIndex % itemCount) + itemCount) % itemCount : 0
  const [activeIndex, setActiveIndex] = useState(normalizedInitialIndex)
  const repeatedItems = itemCount > 1 ? [...items, ...items, ...items] : items

  const getLogicalIndex = useCallback(
    (renderIndex: number) => (itemCount > 0 ? ((renderIndex % itemCount) + itemCount) % itemCount : 0),
    [itemCount],
  )

  const getMiddleRenderIndex = useCallback(
    (logicalIndex: number) => (itemCount > 1 ? itemCount + logicalIndex : logicalIndex),
    [itemCount],
  )

  const getCenteredScrollLeft = useCallback((viewport: HTMLDivElement, item: HTMLDivElement) => {
    return Math.max(0, item.offsetLeft - (viewport.clientWidth - item.clientWidth) / 2)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    const target = itemRefs.current[getMiddleRenderIndex(normalizedInitialIndex)]
    if (!viewport || !target) return

    const nextLeft = getCenteredScrollLeft(viewport, target)
    viewport.scrollTo({ left: Math.max(0, nextLeft), behavior: "auto" })
  }, [getCenteredScrollLeft, getMiddleRenderIndex, normalizedInitialIndex])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateActiveIndex = () => {
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2
      let closestRenderIndex = 0
      let smallestDistance = Number.POSITIVE_INFINITY

      itemRefs.current.forEach((item, index) => {
        if (!item) return
        const itemCenter = item.offsetLeft + item.clientWidth / 2
        const distance = Math.abs(itemCenter - viewportCenter)

        if (distance < smallestDistance) {
          smallestDistance = distance
          closestRenderIndex = index
        }
      })

      const nextLogicalIndex = getLogicalIndex(closestRenderIndex)
      setActiveIndex((currentIndex) => (currentIndex === nextLogicalIndex ? currentIndex : nextLogicalIndex))

      if (itemCount > 1 && (closestRenderIndex < itemCount || closestRenderIndex >= itemCount * 2)) {
        const middleItem = itemRefs.current[getMiddleRenderIndex(nextLogicalIndex)]

        if (middleItem) {
          viewport.scrollTo({
            left: getCenteredScrollLeft(viewport, middleItem),
            behavior: "auto",
          })
        }
      }

      scrollFrameRef.current = null
    }

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return
      scrollFrameRef.current = window.requestAnimationFrame(updateActiveIndex)
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      viewport.removeEventListener("scroll", handleScroll)
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }
    }
  }, [getCenteredScrollLeft, getLogicalIndex, getMiddleRenderIndex, itemCount])

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={viewportRef}
        data-swipe-zone
        className={`mobile-card-carousel w-full ${viewportClassName}`}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <div className="mobile-card-carousel-track" style={{ gap: `${gap}px` }}>
          {repeatedItems.map((item, index) => (
            <div
              key={`${index}-${getLogicalIndex(index)}`}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              className={`mobile-card-carousel-item ${itemClassName}`}
              style={{ width: itemWidth }}
            >
              {renderItem(item, getLogicalIndex(index))}
            </div>
          ))}
        </div>
      </div>

      {itemCount > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-5 bg-amber-200" : "w-2 bg-amber-200/40"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
