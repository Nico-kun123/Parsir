import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Общие стили
import './assets/base.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Плагины
app.use(createPinia())
app.use(router)

app.mount('#app')
