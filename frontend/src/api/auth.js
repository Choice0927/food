import http from './http'

export const login = (data) => {
  return http.post('/auth/login', data)
}

export const register = (data) => {
  return http.post('/auth/register', data)
}

export const getProfile = () => {
  return http.get('/auth/profile')
}
