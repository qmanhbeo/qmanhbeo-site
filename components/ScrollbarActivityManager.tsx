"use client"

import { useEffect } from "react"

const ACTIVE_CLASS_NAME = "scrollbar-active"
const SCROLLABLE_SELECTOR = ".scrollbar-fade"
const SCROLLBAR_IDLE_DELAY_MS = 700
const INDICATOR_CLASS_NAME = "scrollbar-fade-indicator"
const INDICATOR_THUMB_CLASS_NAME = "scrollbar-fade-thumb"
const INDICATOR_WIDTH_PX = 8
const INDICATOR_TOP_INSET_PX = 12
const INDICATOR_BOTTOM_INSET_PX = 12
const INDICATOR_RIGHT_INSET_PX = 8

interface TrackedScrollbar {
  clearTimeout: () => void
  handleInput: () => void
  handleScroll: () => void
  indicator: HTMLDivElement
  resizeObserver: ResizeObserver
  updateIndicator: () => void
}

export default function ScrollbarActivityManager() {
  useEffect(() => {
    const trackedElements = new Map<HTMLElement, TrackedScrollbar>()

    const syncTrackedElements = () => {
      const currentElements = new Set(document.querySelectorAll<HTMLElement>(SCROLLABLE_SELECTOR))

      currentElements.forEach((element) => {
        if (trackedElements.has(element)) return

        const indicator = document.createElement("div")
        indicator.className = INDICATOR_CLASS_NAME

        const thumb = document.createElement("div")
        thumb.className = INDICATOR_THUMB_CLASS_NAME
        indicator.appendChild(thumb)
        document.body.appendChild(indicator)

        let timeoutId: number | null = null

        const clearTimeoutRef = () => {
          if (timeoutId !== null) {
            window.clearTimeout(timeoutId)
            timeoutId = null
          }
        }

        const updateIndicator = () => {
          const hasOverflow = element.scrollHeight > element.clientHeight + 1
          const rect = element.getBoundingClientRect()

          if (!hasOverflow || rect.height <= 0 || rect.width <= 0) {
            indicator.classList.remove(ACTIVE_CLASS_NAME)
            indicator.dataset.visible = "false"
            return
          }

          const trackHeight = Math.max(0, rect.height - INDICATOR_TOP_INSET_PX - INDICATOR_BOTTOM_INSET_PX)
          const maxScroll = element.scrollHeight - element.clientHeight
          const thumbHeight =
            maxScroll > 0 ? Math.max(36, Math.round(trackHeight * (element.clientHeight / element.scrollHeight))) : trackHeight
          const thumbTravel = Math.max(0, trackHeight - thumbHeight)
          const scrollProgress = maxScroll > 0 ? element.scrollTop / maxScroll : 0
          const thumbOffset = Math.round(thumbTravel * scrollProgress)

          indicator.style.top = `${Math.round(rect.top + INDICATOR_TOP_INSET_PX)}px`
          indicator.style.left = `${Math.round(rect.right - INDICATOR_RIGHT_INSET_PX - INDICATOR_WIDTH_PX)}px`
          indicator.style.width = `${INDICATOR_WIDTH_PX}px`
          indicator.style.height = `${Math.round(trackHeight)}px`
          thumb.style.height = `${thumbHeight}px`
          thumb.style.transform = `translateY(${thumbOffset}px)`
          indicator.dataset.visible = "true"
        }

        const handleScroll = () => {
          updateIndicator()
          if (indicator.dataset.visible !== "true") return

          indicator.classList.add(ACTIVE_CLASS_NAME)
          clearTimeoutRef()

          timeoutId = window.setTimeout(() => {
            indicator.classList.remove(ACTIVE_CLASS_NAME)
            timeoutId = null
          }, SCROLLBAR_IDLE_DELAY_MS)
        }

        const handleInput = () => {
          updateIndicator()
        }

        const resizeObserver = new ResizeObserver(() => {
          updateIndicator()
        })

        resizeObserver.observe(element)
        element.addEventListener("scroll", handleScroll, { passive: true })
        element.addEventListener("input", handleInput, { passive: true })

        const trackedScrollbar: TrackedScrollbar = {
          handleScroll,
          handleInput,
          clearTimeout: clearTimeoutRef,
          indicator,
          resizeObserver,
          updateIndicator,
        }

        trackedElements.set(element, trackedScrollbar)
        updateIndicator()
      })

      trackedElements.forEach(({ handleScroll, handleInput, clearTimeout, indicator, resizeObserver }, element) => {
        if (currentElements.has(element)) return

        clearTimeout()
        resizeObserver.disconnect()
        indicator.remove()
        element.removeEventListener("scroll", handleScroll)
        element.removeEventListener("input", handleInput)
        trackedElements.delete(element)
      })
    }

    const updateAllIndicators = () => {
      trackedElements.forEach(({ updateIndicator }) => {
        updateIndicator()
      })
    }

    syncTrackedElements()

    const observer = new MutationObserver(() => {
      syncTrackedElements()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener("resize", updateAllIndicators)
    window.addEventListener("scroll", updateAllIndicators, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateAllIndicators)
      window.removeEventListener("scroll", updateAllIndicators)

      trackedElements.forEach(({ handleScroll, handleInput, clearTimeout, indicator, resizeObserver }, element) => {
        clearTimeout()
        resizeObserver.disconnect()
        indicator.remove()
        element.removeEventListener("scroll", handleScroll)
        element.removeEventListener("input", handleInput)
      })

      trackedElements.clear()
    }
  }, [])

  return null
}
