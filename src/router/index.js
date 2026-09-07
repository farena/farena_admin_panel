import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/',
    component: () => import('@/views/Auth/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/Auth/Login.vue')
      },
      {
        path: 'forgot_password',
        name: 'forgotPassword',
        component: () => import('@/views/Auth/ForgotPassword.vue')
      },
      {
        path: 'reset_password/:token',
        name: 'resetPassword',
        component: () => import('@/views/Auth/ResetPassword.vue')
      },
      {
        path: 'activate_user/:token',
        name: 'resetPassword',
        component: () => import('@/views/Auth/ActivateUser.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/views/Dashboard/DashboardLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard/Dashboard.vue')
      },
      {
        path: 'forms',
        component: () => import('@/views/UI/Forms.vue')
      },
      {
        path: 'html_editor',
        component: () => import('@/views/UI/FaEditorLab.vue')
      },
      {
        path: 'tables',
        component: () => import('@/views/UI/Tables.vue')
      },
      {
        path: 'modals',
        component: () => import('@/views/UI/Modals.vue')
      },
      {
        path: 'tabs',
        component: () => import('@/views/UI/Tabs.vue')
      },
      {
        path: 'settings',
        component: () => import('@/views/Dashboard/Options.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
