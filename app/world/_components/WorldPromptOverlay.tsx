"use client"

import { useEffect, useReducer, useRef, useState } from "react"

export const WORLD_TUTORIAL_PROMPT = "Use WASD or arrows to walk. Press E near a building or friend."
export const WORLD_TUTORIAL_PROMPT_HOLD_MS = 2200
export const WORLD_PROMPT_FADE_MS = 450

export type WorldPromptKind = "tutorial" | "contextual" | null

export interface WorldPromptState {
  isVisible: boolean
  renderedKind: WorldPromptKind
  renderedPrompt: string
}

interface PromptOverlayMachineState {
  isVisible: boolean
  renderedKind: WorldPromptKind
  renderedPrompt: string
}

type PromptOverlayAction =
  | {
      kind: WorldPromptKind
      prompt: string
      type: "hydrate"
    }
  | {
      type: "set-visible"
      visible: boolean
    }
  | {
      type: "clear"
    }

interface UseWorldPromptStateArgs {
  contextualPrompt: string
  uiLocked: boolean
}

interface WorldPromptOverlayProps {
  promptState: WorldPromptState
}

function promptOverlayReducer(
  state: PromptOverlayMachineState,
  action: PromptOverlayAction,
): PromptOverlayMachineState {
  if (action.type === "hydrate") {
    return {
      ...state,
      renderedKind: action.kind,
      renderedPrompt: action.prompt,
    }
  }

  if (action.type === "set-visible") {
    return {
      ...state,
      isVisible: action.visible,
    }
  }

  return {
    isVisible: false,
    renderedKind: null,
    renderedPrompt: "",
  }
}

export function useWorldPromptState({
  contextualPrompt,
  uiLocked,
}: UseWorldPromptStateArgs): WorldPromptState {
  const shouldShowTutorialOnMount = !uiLocked
  const [tutorialPhase, setTutorialPhase] = useState<"visible" | "fading" | "done">(
    shouldShowTutorialOnMount ? "visible" : "done",
  )
  const [promptOverlayState, dispatchPromptOverlay] = useReducer(promptOverlayReducer, {
    isVisible: shouldShowTutorialOnMount,
    renderedKind: shouldShowTutorialOnMount ? "tutorial" : null,
    renderedPrompt: shouldShowTutorialOnMount ? WORLD_TUTORIAL_PROMPT : "",
  })
  const clearPromptTimeoutRef = useRef<number | null>(null)
  const visibilityFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!shouldShowTutorialOnMount) return

    const fadeTimer = window.setTimeout(() => {
      setTutorialPhase("fading")
    }, WORLD_TUTORIAL_PROMPT_HOLD_MS)
    const doneTimer = window.setTimeout(() => {
      setTutorialPhase("done")
    }, WORLD_TUTORIAL_PROMPT_HOLD_MS + WORLD_PROMPT_FADE_MS)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(doneTimer)
    }
  }, [shouldShowTutorialOnMount])

  useEffect(() => {
    return () => {
      if (clearPromptTimeoutRef.current) {
        window.clearTimeout(clearPromptTimeoutRef.current)
      }
      if (visibilityFrameRef.current) {
        window.cancelAnimationFrame(visibilityFrameRef.current)
      }
    }
  }, [])

  const targetKind: WorldPromptKind = uiLocked
    ? null
    : tutorialPhase === "done"
      ? (contextualPrompt ? "contextual" : null)
      : "tutorial"
  const targetPrompt = targetKind === "tutorial"
    ? WORLD_TUTORIAL_PROMPT
    : targetKind === "contextual"
      ? contextualPrompt
      : ""
  const targetVisible = !uiLocked && (
    targetKind === "tutorial"
      ? tutorialPhase === "visible"
      : Boolean(contextualPrompt)
  )

  useEffect(() => {
    if (clearPromptTimeoutRef.current) {
      window.clearTimeout(clearPromptTimeoutRef.current)
      clearPromptTimeoutRef.current = null
    }
    if (visibilityFrameRef.current) {
      window.cancelAnimationFrame(visibilityFrameRef.current)
      visibilityFrameRef.current = null
    }

    if (!targetPrompt) {
      visibilityFrameRef.current = window.requestAnimationFrame(() => {
        dispatchPromptOverlay({ type: "set-visible", visible: false })
      })
      clearPromptTimeoutRef.current = window.setTimeout(() => {
        dispatchPromptOverlay({ type: "clear" })
      }, WORLD_PROMPT_FADE_MS)
      return
    }

    dispatchPromptOverlay({
      type: "hydrate",
      prompt: targetPrompt,
      kind: targetKind,
    })
    visibilityFrameRef.current = window.requestAnimationFrame(() => {
      dispatchPromptOverlay({ type: "set-visible", visible: targetVisible })
    })
  }, [targetKind, targetPrompt, targetVisible])

  return promptOverlayState
}

export default function WorldPromptOverlay({ promptState }: WorldPromptOverlayProps) {
  const { isVisible, renderedKind, renderedPrompt } = promptState

  if (!renderedPrompt) return null

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-7 z-20 flex justify-center sm:bottom-8">
      <div
        data-testid="world-prompt"
        data-prompt-kind={renderedKind ?? undefined}
        className={`max-w-[min(86%,27rem)] rounded-[1.25rem] border border-amber-300/18 bg-[#090504]/72 px-4 py-2.5 text-center font-cinzel text-[0.68rem] leading-5 text-amber-100/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all ease-out sm:max-w-[min(82%,29rem)] sm:px-5 sm:py-3 sm:text-[0.78rem] ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDuration: `${WORLD_PROMPT_FADE_MS}ms` }}
      >
        {renderedPrompt}
      </div>
    </div>
  )
}
