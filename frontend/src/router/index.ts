import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory('/portal/'),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/about', name: 'About', component: () => import('../views/About.vue') },
    { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
    { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
  ],
})

export default router
