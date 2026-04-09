import Phaser from "phaser"
import { gameBridge } from "@/game/GameBridge"

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene")
  }

  create() {
    const syncPromptText = (_parent: Phaser.Data.DataManager, value: string) => {
      gameBridge.emit("prompt-changed", { prompt: value ?? "" })
    }

    const currentPrompt = this.registry.get("promptText")
    if (typeof currentPrompt === "string") {
      syncPromptText(this.registry, currentPrompt)
    }

    this.registry.events.on("changedata-promptText", syncPromptText)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off("changedata-promptText", syncPromptText)
    })
  }
}
