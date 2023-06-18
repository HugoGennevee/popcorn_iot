import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Abonnement.vue'
import GestionView from '../views/Gestion.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/:userId/abonnement/',
      name: 'abonnement',
      component: HomeView
    },
    {
      path: '/:userId/abonnement/qrcode',
      name: 'qrcode',
      component: GestionView
    }
  ]
})

export default router
