import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vuetify } from './shared/vuetify'
import './assets/styles/main.css'

// Import mock adapters (remove in production)
import './modules/billing/api/mock'
// import './modules/room/api/mock'
import './modules/contract/api/mock'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
