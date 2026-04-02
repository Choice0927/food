import { createApp } from 'vue'
import Vant from 'vant'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'vant/lib/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Vant)

app.mount('#app')
