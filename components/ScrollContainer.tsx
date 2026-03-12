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
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)

  const scrollToSection = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || isScrolling) return

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }

      setIsScrolling(true)

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
        <HeroSection />
        <AboutSection />
        <MapSection />
        <ProjectsSection />
        <PublicationsSection />
        <BlogSection />
        <LetterSection />
        <SocialsSection />
      </div>
    </div>
  )
}
