import axios from 'axios'

// 高德地图Web服务API配置
const AMAP_KEY = '3bc4a8fb4398ccef75e646555b4fb37d'
const AMAP_WEB_SERVICE_BASE = 'https://restapi.amap.com/v3'

// 创建axios实例
const amapClient = axios.create({
  baseURL: AMAP_WEB_SERVICE_BASE,
  timeout: 10000,
  params: {
    key: AMAP_KEY
  }
})

/**
 * 搜索POI（地点）
 * @param {Object} params 搜索参数
 * @param {string} params.keywords 搜索关键词（必填）
 * @param {string} params.city 城市名称或城市编码（可选）
 * @param {string} params.types POI分类编码（可选）
 * @param {number} params.offset 每页记录数，默认20（可选）
 * @param {number} params.page 当前页码，默认1（可选）
 * @returns {Promise<Object>} 搜索结果
 */
export const searchPOI = async (params) => {
  try {
    const response = await amapClient.get('/place/text', {
      params: {
        keywords: params.keywords,
        city: params.city || '',
        types: params.types || '',
        offset: params.offset || 20,
        page: params.page || 1,
        extensions: 'all' // 返回详细数据
      }
    })

    const data = response.data

    // 检查API返回状态
    if (data.status === '1' && data.info === 'OK') {
      return {
        success: true,
        count: parseInt(data.count) || 0,
        pois: data.pois || []
      }
    } else {
      console.error('高德API返回错误:', data)
      return {
        success: false,
        error: data.info || '搜索失败',
        pois: []
      }
    }
  } catch (error) {
    console.error('搜索POI请求失败:', error)
    return {
      success: false,
      error: error.message || '网络请求失败',
      pois: []
    }
  }
}

/**
 * 根据POI ID获取详细信息
 * @param {string} poiId POI的ID
 * @returns {Promise<Object>} POI详细信息
 */
export const getPOIDetail = async (poiId) => {
  try {
    const response = await amapClient.get('/place/detail', {
      params: {
        id: poiId,
        extensions: 'all'
      }
    })

    const data = response.data

    if (data.status === '1' && data.info === 'OK') {
      return {
        success: true,
        poi: data.pois?.[0] || null
      }
    } else {
      return {
        success: false,
        error: data.info || '获取详情失败'
      }
    }
  } catch (error) {
    console.error('获取POI详情失败:', error)
    return {
      success: false,
      error: error.message || '网络请求失败'
    }
  }
}

/**
 * 坐标转换（GPS转高德）
 * @param {string} locations 坐标，格式："经度,纬度"
 * @returns {Promise<Object>} 转换结果
 */
export const convertCoord = async (locations) => {
  try {
    const response = await amapClient.get('/assistant/coordinate/convert', {
      params: {
        locations: locations,
        coordsys: 'gps' // 从GPS坐标转换
      }
    })

    const data = response.data

    if (data.status === '1' && data.info === 'OK') {
      return {
        success: true,
        locations: data.locations
      }
    } else {
      return {
        success: false,
        error: data.info || '坐标转换失败'
      }
    }
  } catch (error) {
    console.error('坐标转换失败:', error)
    return {
      success: false,
      error: error.message || '网络请求失败'
    }
  }
}

/**
 * 逆地理编码 - 根据坐标获取地址信息
 * @param {string} location 坐标，格式："经度,纬度"
 * @returns {Promise<Object>} 地址信息
 */
export const regeoCode = async (location) => {
  try {
    const response = await amapClient.get('/geocode/regeo', {
      params: {
        location: location,
        extensions: 'all' // 返回详细数据
      }
    })

    const data = response.data

    if (data.status === '1' && data.info === 'OK') {
      const regeocode = data.regeocode
      return {
        success: true,
        address: regeocode.formatted_address,
        city: regeocode.addressComponent?.city || regeocode.addressComponent?.province,
        district: regeocode.addressComponent?.district,
        street: regeocode.addressComponent?.street,
        streetNumber: regeocode.addressComponent?.streetNumber,
        township: regeocode.addressComponent?.township
      }
    } else {
      return {
        success: false,
        error: data.info || '逆地理编码失败'
      }
    }
  } catch (error) {
    console.error('逆地理编码请求失败:', error)
    return {
      success: false,
      error: error.message || '网络请求失败'
    }
  }
}

export default {
  searchPOI,
  getPOIDetail,
  convertCoord,
  regeoCode
}
