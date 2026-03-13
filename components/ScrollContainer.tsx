"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createKeyHandler, createWheelHandler } from "@/utils/handlers"
import { sections } from "@/utils/sections"
import AboutSection from "./AboutSection"
import BlogSection from "./BlogSection"
import HeroSection from "./HeroSection"
import LetterSection from "./LetterSection"
import MapSection from "./MapSection"
import ProjectsSection from "./ProjectsSection"
import PublicationsSection from "./PublicationsSection"
import ScrollArrows from "./ScrollArrows"
import SocialsSection from "./SocialsSection"
import WandererTrail from "./WandererTrail"

export default function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [revealedSections, setRevealedSections] = useState(() => sections.map((_, index) => index === 0))
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const currentSectionRef = useRef(0)
  const resizeFrameRef = useRef<number | null>(null)

  useEffect(() => {
    currentSectionRef.current = currentSection
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
        if (previous[index]) return previous

        return previous.map((isRevealed, sectionIndex) => (sectionIndex === index ? true : isRevealed))
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
    <div className="relative h-screen overflow-hidden forest-campfire">
      <WandererTrail currentSection={currentSection} isMapExpanded={false} onSectionClick={scrollToSection} />

      <ScrollArrows onNavigateForward={navigateForward} onNavigateBackward={navigateBackward} />

      <div
        ref={containerRef}
        className="horizontal-sections flex h-full overflow-x-hidden scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <HeroSection revealClassName={revealedSections[0] ? "page-load-unblur" : ""} />
        <AboutSection revealClassName={revealedSections[1] ? "page-load-unblur" : ""} />
        <MapSection revealClassName={revealedSections[2] ? "page-load-unblur" : ""} />
        <ProjectsSection revealClassName={revealedSections[3] ? "page-load-unblur" : ""} />
        <PublicationsSection revealClassName={revealedSections[4] ? "page-load-unblur" : ""} />
        <BlogSection revealClassName={revealedSections[5] ? "page-load-unblur" : ""} />
        <LetterSection revealClassName={revealedSections[6] ? "page-load-unblur" : ""} />
        <SocialsSection revealClassName={revealedSections[7] ? "page-load-unblur" : ""} />
      </div>
    </div>
  )
}
