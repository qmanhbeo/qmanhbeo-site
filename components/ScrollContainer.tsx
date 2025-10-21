// File: components/ScrollContainer.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { createNavigationHandlers, createWheelHandler, createKeyHandler } from "@/utils/handlers"
import WandererTrail from "./WandererTrail"
import ScrollArrows from "./ScrollArrows"
import HeroSection from "./HeroSection"
import AboutSection from "./AboutSection"
import MapSection from "./MapSection"
import ProjectsSection from "./ProjectsSection"
import PublicationsSection from "./PublicationsSection"
import BlogSection from "./BlogSection"
import LetterSection from "./LetterSection"
import SocialsSection from "./SocialsSection"

export default function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const navigationHandlers = createNavigationHandlers(
    containerRef,
    currentSection,
    setCurrentSection,
    isScrolling,
    setIsScrolling,
    false, // isMapExpanded
    0,     // currentMapYear
    () => {},
    false, // isMapScrolling
    () => {},
  )

  const wheelHandler = createWheelHandler(
    false,          // isMapExpanded
    isScrolling,
    false,          // isMapScrolling
    navigationHandlers.navigateForward,
    navigationHandlers.navigateBackward,
  )

  const keyHandler = createKeyHandler(
    false,
    isScrolling,
    false,
    navigationHandlers.navigateForward,
    navigationHandlers.navigateBackward,
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener("wheel", wheelHandler, { passive: false })
    return () => container.removeEventListener("wheel", wheelHandler)
  }, [wheelHandler])

  useEffect(() => {
    document.addEventListener("keydown", keyHandler)
    return () => document.removeEventListener("keydown", keyHandler)
  }, [keyHandler])

  return (
    <div className="relative h-screen overflow-hidden forest-campfire">
      <WandererTrail
        currentSection={currentSection}
        isMapExpanded={false}
        onSectionClick={navigationHandlers.scrollToSection}
      />

      <ScrollArrows
        onNavigateForward={navigationHandlers.navigateForward}
        onNavigateBackward={navigationHandlers.navigateBackward}
      />

      {/* Horizontal Scrolling Container */}
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
