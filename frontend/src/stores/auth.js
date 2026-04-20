import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const TOKEN_KEY = 'food-travel-token'
export const USER_KEY = 'food-travel-user'

const decodeTokenPayload = (token) => {
  const [, payload] = token.split('.')
  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
  return JSON.parse(atob(paddedPayload))
}

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getStoredToken = () => {
  const storedToken = localStorage.getItem(TOKEN_KEY) || ''

  if (!storedToken) {
    return ''
  }

  try {
    const payload = decodeTokenPayload(storedToken)

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      clearStoredAuth()
      return ''
    }

    return storedToken
  } catch {
    clearStoredAuth()
    return ''
  }
}

const parseUser = () => {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    clearStoredAuth()
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getStoredToken())
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
    clearStoredAuth()
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
  }
})
