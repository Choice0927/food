import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { pinia } from '@/stores'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', public: true },
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '我的收藏' },
      },
      {
        path: 'add',
        name: 'add',
        component: () => import('@/views/AddPlace.vue'),
        meta: { title: '添加地点' },
      },
      {
        path: 'edit/:id',
        name: 'edit',
        component: () => import('@/views/EditPlace.vue'),
        meta: { title: '编辑地点' },
      },
      {
        path: 'places/:id',
        name: 'place-detail',
        component: () => import('@/views/PlaceDetail.vue'),
        meta: { title: '地点详情' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)
  const isPublicRoute = to.matched.some((record) => record.meta.public)

  if (!isPublicRoute && !authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (isPublicRoute && authStore.isAuthenticated && ['login', 'register'].includes(to.name)) {
    return '/home'
  }

  return true
})

export default router
