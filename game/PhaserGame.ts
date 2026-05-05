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
  const width = container.clientWidth || window.innerWidth || 640
  const height = container.clientHeight || window.innerHeight || 640

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width,
    height,
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
      mode: Phaser.Scale.RESIZE,
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
