import type { PropType } from 'vue'
import type { ButtonLayout, ButtonSize, ButtonTheme } from './types'

export const buttonProps = {
  size: {
    type: String as PropType<ButtonSize>,
    default: 'medium',
  },
  theme: {
    type: String as PropType<ButtonTheme>,
    default: 'standrad',
  },
  layout: {
    type: String as PropType<ButtonLayout>,
    default: 'text',
  },
}
