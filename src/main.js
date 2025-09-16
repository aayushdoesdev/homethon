import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'

import App from './App.vue'
import router from './router'
import Vue3Marquee from 'vue3-marquee'
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'primeicons/primeicons.css'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3Marquee)

app.mount('#app')
