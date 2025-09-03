// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'บัญชียาโรงพยาบาล' }
  },
  {
    path: '/decommissioned',
    name: 'Decommissioned',
    // Lazy load the component for better performance
    component: () => import('../views/DecommissionedView.vue'),
    meta: { title: 'ยาที่นำออกจากบัญชี' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Set the document title for each route
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | DrugList` || 'DrugList'
  next()
})

export default router