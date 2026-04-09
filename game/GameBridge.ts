import type { WorldDialogueState } from "@/context/WorldContext"
import type { WorldSectionId } from "@/utils/worldSections"
import type { PlayerPosition } from "@/game/types"

type WorldBridgeEventMap = {
  "dialogue-closed": undefined
  "load-progress": { progress: number; label?: string }
  "open-dialogue": WorldDialogueState
  "open-section": { sectionId: WorldSectionId }
  "player-position": PlayerPosition
  "section-closed": undefined
}

class WorldBridge extends EventTarget {
  emit<EventName extends keyof WorldBridgeEventMap>(
    type: EventName,
    detail: WorldBridgeEventMap[EventName],
  ) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }

  on<EventName extends keyof WorldBridgeEventMap>(
    type: EventName,
    listener: (detail: WorldBridgeEventMap[EventName]) => void,
  ) {
    const handler: EventListener = (event) => {
      listener((event as CustomEvent<WorldBridgeEventMap[EventName]>).detail)
    }

    this.addEventListener(type, handler)
    return () => this.removeEventListener(type, handler)
  }
}

export const gameBridge = new WorldBridge()
