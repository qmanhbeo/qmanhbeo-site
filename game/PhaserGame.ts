import Phaser from "phaser"
import { BootScene } from "@/game/scenes/BootScene"
import { UIScene } from "@/game/scenes/UIScene"
import { WorldScene } from "@/game/scenes/WorldScene"
import type { GetJoystickInput, PlayerPosition } from "@/game/types"

interface CreatePhaserGameOptions {
  container: HTMLDivElement
  getJoystickInput: GetJoystickInput
  initialPlayerPosition: PlayerPosition
  initialUiLocked: boolean
}

export function createPhaserGame({
  container,
  getJoystickInput,
  initialPlayerPosition,
  initialUiLocked,
}: CreatePhaserGameOptions) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: 640,
    height: 640,
    backgroundColor: "#0a0604",
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set("getJoystickInput", getJoystickInput)
        game.registry.set("initialPlayerPosition", initialPlayerPosition)
        game.registry.set("initialUiLocked", initialUiLocked)
      },
    },
    scene: [BootScene, WorldScene, UIScene],
  })
}
