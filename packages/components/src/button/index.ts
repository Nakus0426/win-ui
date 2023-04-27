import { withInstall } from '../utils'
import _Button from './Button.vue'

export const WButton = withInstall(_Button)
export default WButton

declare module 'vue' {
  export interface GlobalComponents {
    WButton: typeof WButton
  }
}
