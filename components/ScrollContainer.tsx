"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createKeyHandler, createWheelHandler } from "@/utils/handlers"
import { sections } from "@/utils/sections"
import ScrollArrows from "./ScrollArrows"
import WandererTrail from "./WandererTrail"

export default function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null)

  const [currentSection, setCurrentSection] = useState(0)

  const [revealedSections, setRevealedSections] = useState(() =>
    sections.map((_, i) => i === 0)
  )

  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const currentSectionRef = useRef(currentSection)
  const resizeFrameRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchTargetRef = useRef<Element | null>(null)

  // Restore scroll position from sessionStorage after hydration
  useEffect(() => {
    const saved = sessionStorage.getItem('returnSection')
    if (!saved) return
    const n = parseInt(saved, 10)
    const idx = isNaN(n) || n < 0 || n >= sections.length ? 0 : n
    if (idx === 0) return
    setCurrentSection(idx)
    setRevealedSections(sections.map((_, i) => i <= idx))
    const container = containerRef.current
    if (container) {
      container.style.scrollBehavior = 'auto'
      container.scrollLeft = idx * container.clientWidth
      container.style.scrollBehavior = ''
    }
  }, []) // intentionally empty — runs once after first render

  useEffect(() => {
    currentSectionRef.current = currentSection
  }, [currentSection])

  useEffect(() => {
    sessionStorage.setItem('returnSection', String(currentSection))
  }, [currentSection])

  const alignToCurrentSection = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const nextLeft = currentSectionRef.current * container.clientWidth
    const previousBehavior = container.style.scrollBehavior

    // Resize/zoom changes the viewport width without updating scrollLeft,
    // so pin the current section back to the new width immediately.
    container.style.scrollBehavior = "auto"
    container.scrollLeft = nextLeft
    container.style.scrollBehavior = previousBehavior
  }, [])

  const scrollToSection = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || isScrolling) return

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }

      setIsScrolling(true)
      setRevealedSections((previous) => {
        const from = currentSectionRef.current
        const to = index

        if (from === to) return previous

        const start = Math.min(from, to)
        const end = Math.max(from, to)

        return previous.map((isRevealed, sectionIndex) =>
          sectionIndex >= start && sectionIndex <= end ? true : isRevealed,
        )
      })

      container.scrollTo({
        left: index * container.clientWidth,
        behavior: "smooth",
      })

      setCurrentSection(index)

      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false)
        scrollTimeoutRef.current = null
      }, 800)
    },
    [isScrolling],
  )

  const navigateForward = useCallback(() => {
    scrollToSection((currentSection + 1) % sections.length)
  }, [currentSection, scrollToSection])

  const navigateBackward = useCallback(() => {
    scrollToSection(currentSection === 0 ? sections.length - 1 : currentSection - 1)
  }, [currentSection, scrollToSection])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wheelHandler = createWheelHandler(false, isScrolling, false, navigateForward, navigateBackward)
    container.addEventListener("wheel", wheelHandler, { passive: false })

    return () => {
      container.removeEventListener("wheel", wheelHandler)
    }
  }, [isScrolling, navigateBackward, navigateForward])

  useEffect(() => {
    const keyHandler = createKeyHandler(false, isScrolling, false, navigateForward, navigateBackward)
    document.addEventListener("keydown", keyHandler)

    return () => {
      document.removeEventListener("keydown", keyHandler)
    }
  }, [isScrolling, navigateBackward, navigateForward])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX
      touchStartYRef.current = e.touches[0].clientY
      touchTargetRef.current = e.target as Element
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return

      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY

      const target = touchTargetRef.current
      touchStartXRef.current = null
      touchStartYRef.current = null
      touchTargetRef.current = null

      // Let inner swipe zones (e.g. Wanderer's Map chapters) own the gesture
      if (target?.closest('[data-swipe-zone]')) return

      // Only navigate if swipe is clearly horizontal (not a vertical scroll attempt)
      if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 48) return

      if (deltaX > 0) {
        navigateForward()
      } else {
        navigateBackward()
      }
    }

    const handleTouchCancel = () => {
      touchStartXRef.current = null
      touchStartYRef.current = null
      touchTargetRef.current = null
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchCancel)
    }
  }, [navigateForward, navigateBackward])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let previousWidth = container.clientWidth

    const handleResize = () => {
      const nextWidth = container.clientWidth
      if (nextWidth === previousWidth) return
      previousWidth = nextWidth

      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current)
      }

      resizeFrameRef.current = requestAnimationFrame(() => {
        alignToCurrentSection()
        resizeFrameRef.current = null
      })
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)
    window.addEventListener("resize", handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current)
        resizeFrameRef.current = null
      }
    }
  }, [alignToCurrentSection])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative h-dvh overflow-hidden forest-campfire">
      <WandererTrail currentSection={currentSection} isMapExpanded={false} onSectionClick={scrollToSection} />

      <ScrollArrows onNavigateForward={navigateForward} onNavigateBackward={navigateBackward} />

      <div
        ref={containerRef}
        className="horizontal-sections flex h-full overflow-x-hidden scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {sections.map((section, index) => (
          <section.Component
            key={section.id}
            revealClassName={revealedSections[index] ? "page-load-unblur" : ""}
          />
        ))}
      </div>
    </div>
  )
}
