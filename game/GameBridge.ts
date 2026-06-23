import type { WorldDialogueState } from "@/context/WorldContext"
import type { WorldSectionId } from "@/utils/worldSections"
import type { PlayerPosition } from "@/game/types"

export type WorldSfxCue = "dialogue-advance" | "dialogue-open" | "panel-open" | "ui-close"

type WorldBridgeEventMap = {
  "bard-mute-changed": { muted: boolean }
  "chat-keyboard-state": { active: boolean }
  "chat-navigate": { direction: "up" | "down" }
  "bard-started-playing": undefined
  "bard-stopped-playing": undefined
  "choice-navigate": { direction: "up" | "down" }
  "dialogue-closed": undefined
  "manh-chat-move-to": { locationId: string }
  "manh-start-guide": { choiceId: string }
  "dialogue-interact": undefined
  "load-progress": { progress: number; label?: string }
  "open-dialogue": WorldDialogueState
  "open-section": { sectionId: WorldSectionId }
  "player-position": PlayerPosition
  "prompt-changed": { prompt: string }
  "section-closed": undefined
  "world-notification": { text: string }
  "world-sfx": { cue: WorldSfxCue }
}

const IS_DEV = process.env.NODE_ENV === "development"

function logEvent(type: string, direction: "emit" | "on", detail?: unknown) {
  if (!IS_DEV) return
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 12)
  console.log(`[GameBridge:${timestamp}] ${direction} -> ${type}`, detail ?? "")
}

class WorldBridge extends EventTarget {
  emit<EventName extends keyof WorldBridgeEventMap>(
    type: EventName,
    detail: WorldBridgeEventMap[EventName],
  ) {
    logEvent(type, "emit", detail)
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }

  on<EventName extends keyof WorldBridgeEventMap>(
    type: EventName,
    listener: (detail: WorldBridgeEventMap[EventName]) => void,
  ) {
    const handler: EventListener = (event) => {
      listener((event as CustomEvent<WorldBridgeEventMap[EventName]>).detail)
    }

    logEvent(type, "on")
    this.addEventListener(type, handler)
    return () => this.removeEventListener(type, handler)
  }
}

export const gameBridge = new WorldBridge()
