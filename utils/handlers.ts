import type React from "react"
import { sections } from "./sections"
import { travelYears } from "./travel"

export interface NavigationHandlers {
  navigateForward: () => void
  navigateBackward: () => void
  scrollToSection: (index: number) => void
  scrollToMapYear: (index: number) => void
}

export const createNavigationHandlers = (
  containerRef: React.RefObject<HTMLDivElement>,
  currentSection: number,
  setCurrentSection: (section: number) => void,
  isScrolling: boolean,
  setIsScrolling: (scrolling: boolean) => void,
  isMapExpanded: boolean,
  currentMapYear: number,
  setCurrentMapYear: (year: number) => void,
  isMapScrolling: boolean,
  setIsMapScrolling: (scrolling: boolean) => void,
): NavigationHandlers => {
  const scrollToSection = (index: number) => {
    if (!containerRef.current || isScrolling || isMapExpanded) return

    setIsScrolling(true)
    const container = containerRef.current
    const sectionWidth = container.clientWidth

    container.scrollTo({
      left: index * sectionWidth,
      behavior: "smooth",
    })

    setCurrentSection(index)

    setTimeout(() => {
      setIsScrolling(false)
    }, 800)
  }

  const scrollToMapYear = (index: number) => {
    if (isMapScrolling) return

    setIsMapScrolling(true)
    setCurrentMapYear(index)

    setTimeout(() => {
      setIsMapScrolling(false)
    }, 800)
  }

  const navigateForward = () => {
    if (isMapExpanded) {
      const nextYear = (currentMapYear + 1) % travelYears.length
      scrollToMapYear(nextYear)
    } else {
      const nextSection = (currentSection + 1) % sections.length
      scrollToSection(nextSection)
    }
  }

  const navigateBackward = () => {
    if (isMapExpanded) {
      const prevYear = currentMapYear === 0 ? travelYears.length - 1 : currentMapYear - 1
      scrollToMapYear(prevYear)
    } else {
      const prevSection = currentSection === 0 ? sections.length - 1 : currentSection - 1
      scrollToSection(prevSection)
    }
  }

  return {
    navigateForward,
    navigateBackward,
    scrollToSection,
    scrollToMapYear,
  }
}

// Helper function to check if an element is scrollable and has scrollable content
const isElementScrollable = (element: Element): boolean => {
  const hasScrollableContent = element.scrollHeight > element.clientHeight
  const overflowY = window.getComputedStyle(element).overflowY
  return hasScrollableContent && (overflowY === "scroll" || overflowY === "auto")
}

// Helper function to check if element can scroll in the given direction
const canElementScroll = (element: Element, direction: "up" | "down"): boolean => {
  if (direction === "up") {
    return element.scrollTop > 0
  } else {
    return element.scrollTop < element.scrollHeight - element.clientHeight
  }
}

export const createWheelHandler = (
  isMapExpanded: boolean,
  isScrolling: boolean,
  isMapScrolling: boolean,
  navigateForward: () => void,
  navigateBackward: () => void,
) => {
  return (e: WheelEvent) => {
    if ((isMapExpanded && isMapScrolling) || (!isMapExpanded && isScrolling)) return

    // Check if the mouse is over a scrollable element
    const target = e.target as Element
    let currentElement = target

    // Walk up the DOM tree to find a scrollable element
    while (currentElement && currentElement !== document.body) {
      if (currentElement.classList?.contains("scrollable-content") || isElementScrollable(currentElement)) {
        const isScrollingDown = e.deltaY > 0
        const isScrollingUp = e.deltaY < 0

        // Check if the element can scroll in the intended direction
        if (
          (isScrollingDown && canElementScroll(currentElement, "down")) ||
          (isScrollingUp && canElementScroll(currentElement, "up"))
        ) {
          // Allow normal scrolling within the element
          return
        }
        // If we can't scroll in that direction, break and allow page navigation
        break
      }
      currentElement = currentElement.parentElement as Element
    }

    // If we're not over a scrollable element, or it can't scroll further, handle page navigation
    e.preventDefault()
    e.stopPropagation()

    const isForward = e.deltaY > 0 || e.deltaX > 0
    const isBackward = e.deltaY < 0 || e.deltaX < 0

    if (isForward) {
      navigateForward()
    } else if (isBackward) {
      navigateBackward()
    }
  }
}

export const createKeyHandler = (
  isMapExpanded: boolean,
  isScrolling: boolean,
  isMapScrolling: boolean,
  navigateForward: () => void,
  navigateBackward: () => void,
) => {
  return (e: KeyboardEvent) => {
    if ((isMapExpanded && isMapScrolling) || (!isMapExpanded && isScrolling)) return

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault()
        navigateForward()
        break
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault()
        navigateBackward()
        break
    }
  }
}
