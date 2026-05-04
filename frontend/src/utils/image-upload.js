/**
 * 图片上传工具
 * 支持从相机拍摄和从相册选择图片
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import {
  hasCameraPermission,
  hasPhotosPermission,
  requestPermission,
  PermissionType
} from './permissions'
import { showFailToast } from 'vant'

/**
 * 检查相机权限
 */
const checkCameraPermission = async () => {
  try {
    const hasPermission = await hasCameraPermission()
    if (!hasPermission) {
      const result = await requestPermission(PermissionType.CAMERA)
      if (result.state !== 'granted') {
        showFailToast('需要相机权限才能拍照')
        return false
      }
    }
    return true
  } catch (error) {
    console.error('检查相机权限失败:', error)
    return false
  }
}

/**
 * 检查相册权限
 */
const checkPhotosPermission = async () => {
  try {
    const hasPermission = await hasPhotosPermission()
    if (!hasPermission) {
      const result = await requestPermission(PermissionType.PHOTOS)
      if (result.state !== 'granted') {
        showFailToast('需要相册权限才能选择图片')
        return false
      }
    }
    return true
  } catch (error) {
    console.error('检查相册权限失败:', error)
    return false
  }
}

/**
 * 从相机拍摄照片
 * @returns {Promise<string|null>} 图片的 WebPath
 */
export const takePhoto = async () => {
  try {
    const hasPermission = await checkCameraPermission()
    if (!hasPermission) {
      return null
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      width: 1920,
      height: 1920,
      promptLabelHeader: '拍照',
      promptLabelCancel: '取消',
      promptLabelPhoto: '拍照',
      promptLabelPicture: '选择图片'
    })

    return image.webPath
  } catch (error) {
    console.error('拍照失败:', error)
    showFailToast('拍照失败：' + error.message)
    return null
  }
}

/**
 * 从相册选择照片
 * @returns {Promise<string|null>} 图片的 WebPath
 */
export const selectFromGallery = async () => {
  try {
    const hasPermission = await checkPhotosPermission()
    if (!hasPermission) {
      return null
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      width: 1920,
      height: 1920,
      promptLabelHeader: '选择图片',
      promptLabelCancel: '取消',
      promptLabelPhoto: '拍照',
      promptLabelPicture: '选择图片'
    })

    return image.webPath
  } catch (error) {
    console.error('选择图片失败:', error)
    if (error.message === 'User cancelled photos app') {
      showFailToast('已取消选择')
    } else {
      showFailToast('选择图片失败：' + error.message)
    }
    return null
  }
}

/**
 * 选择图片来源（相机或相册）
 * @param {string} source - 'camera' | 'gallery'
 * @returns {Promise<string|null>} 图片的 WebPath
 */
export const selectImageSource = async (source) => {
  if (source === 'camera') {
    return await takePhoto()
  } else if (source === 'gallery') {
    return await selectFromGallery()
  } else {
    showFailToast('无效的图片来源')
    return null
  }
}

/**
 * 检查是否在 Capacitor 环境
 */
export const isCapacitorAvailable = () => {
  try {
    return typeof window !== 'undefined' && window.Capacitor !== undefined
  } catch (error) {
    return false
  }
}

/**
 * 转换图片为 File 对象
 * @param {string} imagePath - 图片路径
 * @returns {Promise<File|null>} File 对象
 */
export const convertToFile = async (imagePath) => {
  try {
    const response = await fetch(imagePath)
    const blob = await response.blob()
    const fileName = imagePath.split('/').pop() || 'image.jpg'
    return new File([blob], fileName, { type: blob.type })
  } catch (error) {
    console.error('转换图片失败:', error)
    return null
  }
}

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<File>} 压缩后的文件
 */
export const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 验证图片文件
 * @param {File} file - 图片文件
 * @returns {Object} 验证结果
 */
export const validateImage = (file) => {
  const result = {
    valid: true,
    error: ''
  }
  
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    result.valid = false
    result.error = '只支持 JPG、PNG、GIF、WEBP 格式的图片'
    return result
  }
  
  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    result.valid = false
    result.error = '图片大小不能超过 5MB'
    return result
  }
  
  return result
}