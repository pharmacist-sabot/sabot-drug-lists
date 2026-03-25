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
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('../views/ActivityView.vue'),
    meta: { title: 'บันทึกการเปลี่ยนแปลง' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | DrugList` : 'DrugList';
  next();
});

export default router;
