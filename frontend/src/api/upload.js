import http from './http'

/**
 * 上传图片
 * @param {FormData} formData - 包含图片文件的 FormData 对象
 * @returns {Promise} 上传结果
 */
export const uploadImagesApi = (formData) => {
  return http.post('/places/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
