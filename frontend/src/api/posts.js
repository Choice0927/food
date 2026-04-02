import http from './http'

export const getPostsApi = (params) => http.get('/posts', { params })

export const getPostDetailApi = (id) => http.get(`/posts/${id}`)

export const createPostApi = (data) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }

  return http.post('/posts', data, config)
}
