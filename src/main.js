// src/main.js
// Application entry point.
// Mounts the Vue app, registers Pinia and Vue Router,
// and bootstraps the Firebase Auth listener before rendering.

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/auth'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Start the auth listener so the store tracks sign-in/out automatically.
// This must run before the app mounts so guards have access to auth state.
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
