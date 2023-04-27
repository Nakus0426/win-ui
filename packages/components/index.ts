import type { App, Plugin } from 'vue'
import Button from './src/button'

const components: Record<string, Plugin> = {
  Button,
}

function install(app: App, options?: any) {
  for (const key of Object.keys(components))
    app.use(components[key], options)
}

export * from './src/button'

export default {
  ...components,
  install,
}
