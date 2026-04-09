export interface PlayerPosition {
  x: number
  y: number
}

export interface JoystickInputState {
  x: number
  y: number
  interact: boolean
}

export type GetJoystickInput = () => JoystickInputState
