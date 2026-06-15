import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'
import { auth } from './stores/auth.js'
import './styles.css'

// Дать auth-стору возможность перекинуть на /login при 401.
auth._redirect = () => router.replace('/login')

createApp(App).use(router).mount('#app')
