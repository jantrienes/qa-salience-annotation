import { createRouter, createWebHistory } from 'vue-router'
import AnnotationView from '../views/AnnotationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AnnotationView,
    },
  ],
})

export default router
