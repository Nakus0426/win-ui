import type { PropType } from 'vue'
import type { ButtonLayout, ButtonSize, ButtonStyle } from './types'

export const buttonProps = {
  size: {
    type: String as PropType<ButtonSize>,
    default: 'standard',
  },
  style: {
    type: String as PropType<ButtonStyle>,
    default: 'standrad',
  },
  layout: {
    type: String as PropType<ButtonLayout>,
    default: 'text',
  },
}
