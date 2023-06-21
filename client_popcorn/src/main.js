import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import axios from 'axios';

axios.interceptors.request.use(
    (config) => {
        if (!config.headers.skipAuth) {
            const token = localStorage.getItem('token');

            // Vérifiez si le token existe
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            } else {
                // Redirigez vers la page de connexion
                console.log("Le Token n'existe pas - redirection vers la page de connexion");
                router.push('/');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // Vérifiez si l'erreur est une 403
        if (error.response.status === 403) {
            // Redirigez vers la page de connexion
            console.log("Acces interdit - redirection vers la page de connexion");
            router.push('/');
        }

        return Promise.reject(error);
    }
);

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

