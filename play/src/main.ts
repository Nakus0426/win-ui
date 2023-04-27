import { createApp } from 'vue'
import { WButton } from '@win-ui/components'
import App from './App.vue'

const app = createApp(App)

app.use(WButton)
app.mount('#app')
