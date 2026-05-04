/**
 * 权限管理工具
 * 用于在 App 中请求和处理各种权限
 * 
 * 注意：此文件在浏览器环境中会回退到 Web API
 * 在 Capacitor App 环境中会使用原生权限 API
 */

// 注意：Capacitor 模块会在运行时动态导入
// 这样可以确保在浏览器环境中不会报错

// 定义权限类型
export const PermissionType = {
  LOCATION: 'LOCATION',
  CAMERA: 'CAMERA',
  PHOTOS: 'PHOTOS',
  STORAGE: 'STORAGE',
  NOTIFICATIONS: 'NOTIFICATIONS'
}

/**
 * 检查是否在 Capacitor 环境中
 */
const isCapacitor = () => {
  return typeof window !== 'undefined' && 
         window.Capacitor !== undefined && 
         window.Capacitor.isNativePlatform()
}

/**
 * 检查定位权限（使用浏览器 Geolocation API）
 */
const checkBrowserLocationPermission = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ state: 'denied', canRequest: false })
      return
    }
    
    navigator.permissions?.query({ name: 'geolocation' })
      .then(result => {
        resolve({ 
          state: result.state, 
          canRequest: result.state === 'prompt' 
        })
      })
      .catch(() => {
        // 如果不支持 permissions API，假设可以请求
        resolve({ state: 'prompt', canRequest: true })
      })
  })
}

/**
 * 检查单个权限状态
 * @param {string} permissionType - 权限类型
 * @returns {Promise<Object>} 权限状态对象
 */
export const checkPermission = async (permissionType) => {
  try {
    // 在浏览器环境中使用 Web API
    if (!isCapacitor()) {
      if (permissionType === PermissionType.LOCATION) {
        return await checkBrowserLocationPermission()
      }
      // 其他权限在浏览器中默认允许
      return { state: 'granted', canRequest: false }
    }
    
    // 在 Capacitor 环境中使用原生权限 API
    // 这里需要动态导入 Capacitor 模块
    const { Permissions } = await import('@capacitor/core')
    
    const result = await Permissions.check({
      permissions: [permissionType]
    })
    return result[permissionType]
  } catch (error) {
    console.error(`检查权限失败 (${permissionType}):`, error)
    return {
      state: 'prompt',
      canRequest: true
    }
  }
}

/**
 * 请求单个权限
 * @param {string} permissionType - 权限类型
 * @returns {Promise<Object>} 权限结果
 */
export const requestPermission = async (permissionType) => {
  try {
    // 在浏览器环境中
    if (!isCapacitor()) {
      if (permissionType === PermissionType.LOCATION) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve({ state: 'granted' }),
            () => resolve({ state: 'denied' })
          )
        })
      }
      return { state: 'granted' }
    }
    
    // 在 Capacitor 环境中
    const { Permissions } = await import('@capacitor/core')
    
    const result = await Permissions.request({
      permissions: [permissionType]
    })
    return result[permissionType]
  } catch (error) {
    console.error(`请求权限失败 (${permissionType}):`, error)
    return {
      state: 'denied',
      canRequest: false
    }
  }
}

/**
 * 检查多个权限状态
 * @param {string[]} permissions - 权限类型数组
 * @returns {Promise<Object>} 所有权限的状态
 */
export const checkPermissions = async (permissions) => {
  const results = {}
  for (const permission of permissions) {
    results[permission] = await checkPermission(permission)
  }
  return results
}

/**
 * 请求多个权限
 * @param {string[]} permissions - 权限类型数组
 * @returns {Promise<Object>} 所有权限的请求结果
 */
export const requestPermissions = async (permissions) => {
  const results = {}
  for (const permission of permissions) {
    results[permission] = await requestPermission(permission)
  }
  return results
}

/**
 * 请求应用所需的所有核心权限
 * 包括：定位、相机、相册访问
 * @returns {Promise<Object>} 权限请求结果
 */
export const requestCorePermissions = async () => {
  const corePermissions = [
    PermissionType.LOCATION,
    PermissionType.CAMERA,
    PermissionType.PHOTOS
  ]

  try {
    const results = await requestPermissions(corePermissions)

    // 统计权限状态
    const granted = []
    const denied = []
    const prompt = []


    for (const [permission, result] of Object.entries(results)) {
      if (result.state === 'granted') {
        granted.push(permission)
      } else if (result.state === 'denied') {
        denied.push(permission)
      } else if (result.state === 'prompt') {
        prompt.push(permission)
      }
    }

    return {
      results,
      summary: {
        granted,
        denied,
        prompt,
        total: corePermissions.length
      }
    }
  } catch (error) {
    console.error('请求核心权限失败:', error)
    return {
      results: {},
      summary: {
        granted: [],
        denied: [],
        prompt: [],
        total: 0
      }
    }
  }
}

/**
 * 检查是否拥有定位权限
 * @returns {Promise<boolean>}
 */
export const hasLocationPermission = async () => {
  const result = await checkPermission(PermissionType.LOCATION)
  return result.state === 'granted'
}

/**
 * 检查是否拥有相机权限
 * @returns {Promise<boolean>}
 */
export const hasCameraPermission = async () => {
  const result = await checkPermission(PermissionType.CAMERA)
  return result.state === 'granted'
}

/**
 * 检查是否拥有相册权限
 * @returns {Promise<boolean>}
 */
export const hasPhotosPermission = async () => {
  const result = await checkPermission(PermissionType.PHOTOS)
  return result.state === 'granted'
}

/**
 * 获取权限状态的中文描述
 * @param {string} state - 权限状态
 * @returns {string} 中文描述
 */
export const getPermissionStateText = (state) => {
  const stateMap = {
    granted: '已授权',
    denied: '已拒绝',
    prompt: '未授权',
    'prompt-with-rationale': '需再次请求授权'
  }
  return stateMap[state] || state
}

/**
 * 权限类型对应的中文描述
 * @param {string} permissionType - 权限类型
 * @returns {string} 中文描述
 */
export const getPermissionTypeName = (permissionType) => {
  const nameMap = {
    LOCATION: '定位权限',
    CAMERA: '相机权限',
    PHOTOS: '相册权限',
    STORAGE: '存储权限',
    NOTIFICATIONS: '通知权限'
  }
  return nameMap[permissionType] || permissionType
}