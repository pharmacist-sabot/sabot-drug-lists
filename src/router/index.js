// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'บัญชียาโรงพยาบาล' },
  },
  {
    path: '/decommissioned',
    name: 'Decommissioned',

    component: () => import('../views/DecommissionedView.vue'),
    meta: { title: 'ยาที่นำออกจากบัญชี' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // ใช้ Ternary Operator ( ? : ) เช็คเงื่อนไขให้ชัดเจน
  document.title = to.meta.title ? `${to.meta.title} | DrugList` : 'DrugList';

  next();
});

export default router;
