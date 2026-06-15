import { createRouter, createWebHistory } from 'vue-router'
import { auth } from './stores/auth.js'

const routes = [
  { path: '/login', component: () => import('./views/LoginView.vue'), meta: { public: true } },
  { path: '/register', component: () => import('./views/RegisterView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('./components/AppLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('./views/DashboardView.vue') },
      { path: 'deals', component: () => import('./views/DealsView.vue') },
      { path: 'clients', component: () => import('./views/ClientsView.vue') },
      { path: 'properties', component: () => import('./views/PropertiesView.vue') },
      { path: 'activities', component: () => import('./views/ActivitiesView.vue') },
      { path: 'employees', component: () => import('./views/EmployeesView.vue'), meta: { manage: true } },
      { path: 'agency', component: () => import('./views/AgencyView.vue'), meta: { manage: true } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

export const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  if (!to.meta.public && !auth.isAuthed) return '/login'
  if (to.meta.public && auth.isAuthed) return '/dashboard'
  // Разделы «Сотрудники» и «Агентство» — только для владельца/админа
  if (to.meta.manage && !auth.canManage) return '/dashboard'
  return true
})
