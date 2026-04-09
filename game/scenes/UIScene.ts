import Phaser from "phaser"

export class UIScene extends Phaser.Scene {
  private promptText?: Phaser.GameObjects.Text

  constructor() {
    super("UIScene")
  }

  create() {
    this.promptText = this.add.text(320, 602, "", {
      align: "center",
      color: "#ffe6b7",
      fontFamily: "var(--font-cinzel), serif",
      fontSize: "15px",
      stroke: "#0a0604",
      strokeThickness: 4,
    })
      .setDepth(200)
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setVisible(false)

    const syncPromptText = (_parent: Phaser.Data.DataManager, value: string) => {
      if (!this.promptText) return
      this.promptText.setText(value ?? "")
      this.promptText.setVisible(Boolean(value))
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
