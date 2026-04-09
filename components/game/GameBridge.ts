import type { DialogueState, GameSectionId } from "@/context/FunModeContext"

type GameBridgeEventMap = {
  "open-section": { sectionId: GameSectionId }
  "section-closed": undefined
  "open-dialogue": DialogueState
  "dialogue-closed": undefined
  "load-progress": { progress: number; label?: string }
}

class GameBridge extends EventTarget {
  emit<EventName extends keyof GameBridgeEventMap>(
    type: EventName,
    detail: GameBridgeEventMap[EventName],
  ) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }

  on<EventName extends keyof GameBridgeEventMap>(
    type: EventName,
    listener: (detail: GameBridgeEventMap[EventName]) => void,
  ) {
    const handler: EventListener = (event) => {
      listener((event as CustomEvent<GameBridgeEventMap[EventName]>).detail)
    }

    this.addEventListener(type, handler)
    return () => this.removeEventListener(type, handler)
  }
}

export const gameBridge = new GameBridge()
