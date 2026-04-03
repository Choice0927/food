import http from './http'

export const getPlacesApi = (params = {}) => {
  return http.get('/places', { params })
}

export const getPlaceDetailApi = (id) => {
  return http.get(`/places/${id}`)
}

export const createPlaceApi = (data) => {
  return http.post('/places', data)
}

export const updatePlaceApi = (id, data) => {
  return http.put(`/places/${id}`, data)
}

export const deletePlaceApi = (id) => {
  return http.delete(`/places/${id}`)
}
