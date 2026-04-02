import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HomeView from '@/views/Home.vue'
import LoginView from '@/views/Login.vue'
import TripsView from '@/views/TripsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import RegisterView from '@/views/Register.vue'
import PublishView from '@/views/Publish.vue'
import PlaceDetailView from '@/views/PlaceDetail.vue'
import { pinia } from '@/stores'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: '登录',
      public: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: '注册',
      public: true,
    },
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        alias: '/explore',
        name: 'home',
        component: HomeView,
        meta: {
          title: '首页',
          public: true,
        },
      },
      {
        path: 'trips',
        name: 'trips',
        component: TripsView,
        meta: {
          title: '我的行程',
        },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          title: '个人中心',
        },
      },
      {
        path: 'publish',
        name: 'publish',
        component: PublishView,
        meta: {
          title: '发布美食打卡',
        },
      },
      {
        path: 'places/:id',
        name: 'place-detail',
        component: PlaceDetailView,
        meta: {
          title: '地点详情',
        },
      },
    ],
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
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (
    isPublicRoute &&
    authStore.isAuthenticated &&
    (to.name === 'login' || to.name === 'register')
  ) {
    return '/home'
  }

  return true
})

export default router
