import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
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

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) ? `${to.meta.title} | DrugList` : 'DrugList';
  next();
});

export default router;
