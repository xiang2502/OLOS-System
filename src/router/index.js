// src/router/index.js
// Defines all application routes and navigation guards.
// - Public routes: Login, Register, ResetPassword
// - Protected routes (requiresAuth): all user pages
// - Admin-only routes (requiresAdmin): Dashboard, ManageUsers, ManageClaims

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  // ── Public ──────────────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true }  // Redirect away if already logged in
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { guest: true }
  },

  // ── Authenticated user routes ────────────────────────────────────────────
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: () => import('@/views/ItemDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/ReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-claims',
    name: 'MyClaims',
    component: () => import('@/views/MyClaimsView.vue'),
    meta: { requiresAuth: true }
  },

  // ── Admin-only routes ────────────────────────────────────────────────────
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'ManageUsers',
    component: () => import('@/views/admin/ManageUsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/claims',
    name: 'ManageClaims',
    component: () => import('@/views/admin/ManageClaimsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Navigation Guard ──────────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Wait for auth to initialise (prevents flash of wrong screen on first load)
  if (auth.loading) {
    await new Promise(resolve => {
      const unwatch = auth.$subscribe(() => {
        if (!auth.loading) { unwatch(); resolve() }
      })
    })
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'Home' })
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
