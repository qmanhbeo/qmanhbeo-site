"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createKeyHandler, createWheelHandler } from "@/utils/handlers"
import {
  clearPendingReturnState,
  readPendingReturnState,
  readReturnSection,
  saveReturnSection,
} from "@/utils/entryNavigation"
import { sections } from "@/utils/sections"
import ScrollArrows from "./ScrollArrows"
import WandererTrail from "./WandererTrail"
import { useAudioContext } from "@/context/AudioContext"

export default function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasSkippedInitialPersistRef = useRef(false)
  const initialRestoreFrameRef = useRef<number | null>(null)

  const [currentSection, setCurrentSection] = useState(0)
  const [revealedSections, setRevealedSections] = useState(() => sections.map((_, i) => i === 0))
  const [animatedSections, setAnimatedSections] = useState(() => sections.map((_, i) => i === 0))
  const [isScrolling, setIsScrolling] = useState(false)

  const scrollTimeoutRef = useRef<number | null>(null)
  const currentSectionRef = useRef(currentSection)
  const resizeFrameRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchTargetRef = useRef<Element | null>(null)

  const { playSfx } = useAudioContext()

  useEffect(() => {
    currentSectionRef.current = currentSection
  }, [currentSection])

  useEffect(() => {
    if (!hasSkippedInitialPersistRef.current) {
      hasSkippedInitialPersistRef.current = true
      return
    }

    saveReturnSection(currentSection)
  }, [currentSection])

  useEffect(() => {
    if (!readPendingReturnState("/")) return
    clearPendingReturnState("/")
  }, [])

  const alignToCurrentSection = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const nextLeft = currentSectionRef.current * container.clientWidth
    const previousBehavior = container.style.scrollBehavior

    // Resize and zoom change the viewport width without updating scrollLeft,
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

        const nextRevealed = previous.map((isRevealed, sectionIndex) =>
          sectionIndex >= start && sectionIndex <= end ? true : isRevealed,
        )

        setAnimatedSections((previousAnimated) =>
          previousAnimated.map((hasAnimated, sectionIndex) =>
            hasAnimated || (nextRevealed[sectionIndex] && !previous[sectionIndex]),
          ),
        )

        return nextRevealed
      })

      playSfx("transition")
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
    scrollToSection((currentSectionRef.current + 1) % sections.length)
  }, [scrollToSection])

  const navigateBackward = useCallback(() => {
    scrollToSection(currentSectionRef.current === 0 ? sections.length - 1 : currentSectionRef.current - 1)
  }, [scrollToSection])

  useEffect(() => {
    const pendingReturnState = readPendingReturnState("/")
    const shouldSuppressEntryAnimation = pendingReturnState !== null
    const restoredSection = readReturnSection(sections.length)

    if (shouldSuppressEntryAnimation) {
      document.documentElement.classList.add("suppress-home-entry-fixed-reveal")
    } else {
      document.documentElement.classList.remove("suppress-home-entry-fixed-reveal")
    }

    if (restoredSection <= 0) {
      return () => {
        document.documentElement.classList.remove("suppress-home-entry-fixed-reveal")
      }
    }

    initialRestoreFrameRef.current = window.requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }

      initialRestoreFrameRef.current = null
      setIsScrolling(true)
      setRevealedSections(sections.map((_, index) => index <= restoredSection))
      setAnimatedSections(
        sections.map((_, index) => !shouldSuppressEntryAnimation && index <= restoredSection),
      )

      container.scrollTo({
        left: restoredSection * container.clientWidth,
        behavior: "smooth",
      })

      setCurrentSection(restoredSection)

      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false)
        scrollTimeoutRef.current = null
      }, 800)
    })

    return () => {
      document.documentElement.classList.remove("suppress-home-entry-fixed-reveal")
      if (initialRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(initialRestoreFrameRef.current)
        initialRestoreFrameRef.current = null
      }
    }
  }, [])

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

    const handleTouchStart = (event: TouchEvent) => {
      touchStartXRef.current = event.touches[0].clientX
      touchStartYRef.current = event.touches[0].clientY
      touchTargetRef.current = event.target as Element
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return

      const deltaX = touchStartXRef.current - event.changedTouches[0].clientX
      const deltaY = touchStartYRef.current - event.changedTouches[0].clientY

      const target = touchTargetRef.current
      touchStartXRef.current = null
      touchStartYRef.current = null
      touchTargetRef.current = null

      // Let inner swipe zones such as Wanderer's Map chapters own the gesture.
      if (target?.closest("[data-swipe-zone]")) return

      // Only navigate if swipe is clearly horizontal.
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
      if (initialRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(initialRestoreFrameRef.current)
        initialRestoreFrameRef.current = null
      }
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
            revealClassName={revealedSections[index] && animatedSections[index] ? "page-load-unblur" : ""}
          />
        ))}
      </div>
    </div>
  )
}
