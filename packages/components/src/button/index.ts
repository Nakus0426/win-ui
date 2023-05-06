import { withInstall } from '../utils'
import _Button from './Button.vue'

export const Button = withInstall(_Button)
export default Button
export type { ButtonSize, ButtonStyle } from './types'

declare module 'vue' {
  export interface GlobalComponents {
    WinButton: typeof Button
  }
}
