import axios from 'axios'
import router from '@/router'
import { pinia } from '@/stores'
import { getStoredToken, useAuthStore } from '@/stores/auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore(pinia)
      const currentRoute = router.currentRoute.value
      const isPublicRoute = currentRoute.matched.some((record) => record.meta.public)

      authStore.clearAuth()

      if (!isPublicRoute) {
        router.replace({
          path: '/login',
          query: currentRoute.fullPath ? { redirect: currentRoute.fullPath } : undefined,
        })
      }
    }

    return Promise.reject(error)
  },
)

export default http
