import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'food-travel-token'
const USER_KEY = 'food-travel-user'

const parseUser = () => {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(parseUser())
  const isAuthenticated = computed(() => Boolean(token.value))

  const setAuth = ({ token: newToken, user: newUser }) => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  const clearAuth = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
  }
})
