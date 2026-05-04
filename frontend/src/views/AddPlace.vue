<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { usePlacesStore } from '@/stores/places'
import AMapLoader from '@amap/amap-jsapi-loader'
import { searchPOI, regeoCode } from '@/api/amap'
import { uploadImagesApi } from '@/api/upload'
import CityPicker from '@/components/CityPicker.vue'

const router = useRouter()
const placesStore = usePlacesStore()

const formData = ref({
  name: '',
  city: '',
  address: '',
  latitude: null,
  longitude: null,
  description: '',
  images: [],
  tags: [],
  rating: 0,
})

const cities = [
  { text: '北京', value: '北京' },
  { text: '上海', value: '上海' },
  { text: '广州', value: '广州' },
  { text: '深圳', value: '深圳' },
  { text: '杭州', value: '杭州' },
  { text: '成都', value: '成都' },
  { text: '重庆', value: '重庆' },
  { text: '武汉', value: '武汉' },
  { text: '西安', value: '西安' },
  { text: '南京', value: '南京' },
]

const tagOptions = [
  { text: '火锅', value: '火锅' },
  { text: '烧烤', value: '烧烤' },
  { text: '日料', value: '日料' },
  { text: '韩料', value: '韩料' },
  { text: '西餐', value: '西餐' },
  { text: '中餐', value: '中餐' },
  { text: '小吃', value: '小吃' },
  { text: '甜品', value: '甜品' },
  { text: '咖啡', value: '咖啡' },
  { text: '奶茶', value: '奶茶' },
  { text: '酒吧', value: '酒吧' },
  { text: '景点', value: '景点' },
]

const showCityPicker = ref(false)
const showTagPicker = ref(false)
const loading = ref(false)

// 图片上传相关
const fileList = ref([])
const uploading = ref(false)

// 地图搜索相关
const searchKeyword = ref('')
const searchResults = ref([])
const showSearchPanel = ref(false)
const A = ref(null)
const map = ref(null)
const currentMarker = ref(null)
const infoWindow = ref(null)

onMounted(() => {
  initAMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})

// 获取当前位置并初始化地图
const initAMap = async () => {
  try {
    const AMapInstance = await AMapLoader.load({
      key: 'eb61e5f53014f0ca023a5fd2e01c6716',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Marker', 'AMap.InfoWindow', 'AMap.Geolocation']
    })
    
    A.value = AMapInstance
    
    // 初始化地图（默认北京，后面会获取当前位置更新）
    map.value = new AMapInstance.Map('searchMapContainer', {
      zoom: 12,
      center: [116.397428, 39.90923]
    })
    
    // 添加地图控件
    map.value.addControl(new AMapInstance.Scale())
    map.value.addControl(new AMapInstance.ToolBar({
      position: 'RB'
    }))
    
    // 尝试获取当前位置并设置地图中心
    getLocation()
    
  } catch (error) {
    console.error('地图加载失败:', error)
    showFailToast('地图加载失败')
  }
}

// 获取当前位置并更新地图
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    console.log('浏览器不支持地理定位')
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      
      // 更新表单坐标
      formData.value.latitude = latitude
      formData.value.longitude = longitude
      
      // 更新地图中心
      if (map.value && A.value) {
        const lnglat = [longitude, latitude]
        map.value.setCenter(lnglat)
        
        // 添加当前位置标记
        if (currentMarker.value) {
          currentMarker.value.setMap(null)
        }
        
        currentMarker.value = new A.value.Marker({
          position: lnglat,
          title: '当前位置',
          animation: 'AMAP_ANIMATION_DROP'
        })
        currentMarker.value.setMap(map.value)
        
        // 添加信息窗
        if (infoWindow.value) {
          infoWindow.value.close()
        }
        
        infoWindow.value = new A.value.InfoWindow({
          content: '<div style="padding:8px;"><strong>当前位置</strong></div>',
          offset: new A.value.Pixel(0, -30)
        })
        infoWindow.value.open(map.value, lnglat)
      }
      
      // 获取地址信息
      try {
        const result = await regeoCode(`${longitude},${latitude}`)
        if (result.success) {
          formData.value.city = result.city || ''
          formData.value.address = result.address || ''
        }
      } catch (error) {
        console.error('获取地址信息失败:', error)
      }
    },
    (error) => {
      console.error('获取位置失败:', error)
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

// 获取当前位置并更新地图
const getLocation = () => {
  if (!navigator.geolocation) {
    showFailToast('您的浏览器不支持定位功能')
    return
  }

  const loadingToast = showLoadingToast({
    message: '获取位置中...',
    forbidClick: true,
    duration: 0,
  })

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      // 更新表单坐标
      formData.value.latitude = latitude
      formData.value.longitude = longitude

      // 更新地图中心
      if (map.value && A.value) {
        const lnglat = [longitude, latitude]
        map.value.setCenter(lnglat)
        map.value.setZoom(16)

        // 添加当前位置标记
        if (currentMarker.value) {
          currentMarker.value.setMap(null)
        }

        currentMarker.value = new A.value.Marker({
          position: lnglat,
          title: '当前位置',
          animation: 'AMAP_ANIMATION_DROP'
        })
        currentMarker.value.setMap(map.value)

        // 添加信息窗
        if (infoWindow.value) {
          infoWindow.value.close()
        }

        infoWindow.value = new A.value.InfoWindow({
          content: '<div style="padding:8px;"><strong>当前位置</strong></div>',
          offset: new A.value.Pixel(0, -30)
        })
        infoWindow.value.open(map.value, lnglat)
      }

      // 获取地址信息
      try {
        const result = await regeoCode(`${longitude},${latitude}`)
        if (result.success) {
          formData.value.city = result.city || ''
          formData.value.address = result.address || ''
          loadingToast.close()
        } else {
          loadingToast.close()
          showFailToast('获取地址信息失败')
        }
      } catch (error) {
        console.error('获取地址信息失败:', error)
        loadingToast.close()
        showFailToast('获取地址信息失败')
      }
    },
    (error) => {
      console.error('获取位置失败:', error)
      loadingToast.close()
      showFailToast('获取位置失败，请检查定位权限')
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

// 防抖函数
let searchTimeout = null
const debounceSearch = (fn, delay = 500) => {
  return (...args) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fn(...args), delay)
  }
}

const onSearchInput = debounceSearch(async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    showSearchPanel.value = false
    return
  }
  
  try {
    // 使用高德Web服务API搜索POI
    const result = await searchPOI({
      keywords: searchKeyword.value,
      city: formData.value.city || '',
      offset: 10
    })
    
    console.log('搜索结果:', result)
    
    if (result.success && result.pois.length > 0) {
      // 处理搜索结果
      searchResults.value = result.pois.map(poi => ({
        id: poi.id,
        name: poi.name,
        address: poi.address || '',
        district: (poi.pname || '') + (poi.cityname || '') + (poi.adname || ''),
        location: poi.location ? poi.location.split(',').map(Number) : null,
        type: poi.type,
        tel: poi.tel || ''
      })).filter(item => item.location && item.location.length === 2)
      
      showSearchPanel.value = searchResults.value.length > 0
      
      if (searchResults.value.length === 0) {
        showFailToast('未找到相关地点')
      }
    } else {
      searchResults.value = []
      showSearchPanel.value = false
      showFailToast(result.error || '未找到相关地点')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    showFailToast('搜索出错')
  }
}, 500)

const onSelectPlace = (place) => {
  console.log('选中地点:', place)
  
  // 更新表单数据
  formData.value.name = place.name || ''
  formData.value.address = place.address || ''
  formData.value.latitude = place.location[1]
  formData.value.longitude = place.location[0]
  
  // 根据城市更新选择
  const cityMatch = cities.find(c => place.district?.includes(c.value))
  if (cityMatch) {
    formData.value.city = cityMatch.value
  } else {
    // 尝试从district中提取城市
    const cityList = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京']
    for (const city of cityList) {
      if (place.district?.includes(city)) {
        formData.value.city = city
        break
      }
    }
  }
  
  // 更新地图中心并标记
  if (map.value && place.location) {
    const lnglat = place.location
    map.value.setCenter(lnglat)
    map.value.setZoom(17)
    
    // 清除之前的标记
    if (currentMarker.value) {
      currentMarker.value.setMap(null)
    }
    
    // 关闭之前的信息窗
    if (infoWindow.value) {
      infoWindow.value.close()
    }
    
    // 添加新标记
    currentMarker.value = new A.value.Marker({
      position: lnglat,
      title: place.name,
      animation: 'AMAP_ANIMATION_DROP'
    })
    currentMarker.value.setMap(map.value)
    
    // 添加信息窗
    infoWindow.value = new A.value.InfoWindow({
      content: `<div style="padding:8px;"><strong>${place.name}</strong><br/>${place.address || ''}</div>`,
      offset: new A.value.Pixel(0, -30)
    })
    infoWindow.value.open(map.value, lnglat)
  }
  
  // 关闭搜索面板
  showSearchPanel.value = false
  searchKeyword.value = place.name
  
  showSuccessToast('已选择：' + place.name)
}

const onCitySelect = (city) => {
  formData.value.city = city.name
  showCityPicker.value = false
}

const onTagConfirm = ({ selectedOptions }) => {
  formData.value.tags = selectedOptions.map((option) => option.value)
  showTagPicker.value = false
}

// 图片上传相关函数
const onBeforeRead = (file) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    showFailToast('只支持 JPG、PNG、GIF、WEBP 格式的图片')
    return false
  }
  // 检查文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showFailToast('图片大小不能超过 5MB')
    return false
  }
  return true
}

const onAfterRead = async (file) => {
  // 单文件上传
  const filesToUpload = Array.isArray(file) ? file : [file]

  for (const item of filesToUpload) {
    item.status = 'uploading'
    item.message = '上传中...'

    try {
      const formData = new FormData()
      formData.append('images', item.file)

      const { data } = await uploadImagesApi(formData)

      if (data.success && data.data.urls.length > 0) {
        item.status = 'done'
        item.message = '上传成功'
        item.url = data.data.urls[0]

        // 更新表单数据中的图片数组
        formData.value.images.push(data.data.urls[0])
      } else {
        throw new Error(data.message || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      item.status = 'failed'
      item.message = '上传失败'
      showFailToast(error.message || '上传失败')
    }
  }
}

const onDeleteImage = (file, detail) => {
  // 从表单数据中移除图片
  const index = formData.value.images.indexOf(file.url)
  if (index > -1) {
    formData.value.images.splice(index, 1)
  }
}

const validateForm = () => {
  if (!formData.value.name.trim()) {
    showFailToast('请输入地点名称')
    return false
  }
  if (!formData.value.city) {
    showFailToast('请选择城市')
    return false
  }
  if (!formData.value.address.trim()) {
    showFailToast('请输入详细地址')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await placesStore.createPlace(formData.value)
    showSuccessToast('添加成功')
    router.push('/home')
  } catch (error) {
    showFailToast(error.message || '添加失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="add-place-page">
    <van-nav-bar
      title="添加地点"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 地图搜索区域 -->
    <div class="map-search-section">
      <div class="search-input-wrapper">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索美食店、餐厅名称，如：海底捞、星巴克"
          shape="round"
          :clearable="true"
          @input="onSearchInput"
        />
      </div>
      
      <!-- 搜索结果列表 -->
      <div v-if="showSearchPanel" class="search-results-panel">
        <van-list>
          <van-cell
            v-for="place in searchResults"
            :key="place.id"
            :title="place.name"
            :label="place.district + place.address"
            clickable
            @click="onSelectPlace(place)"
          >
            <template #icon>
              <van-icon name="location-o" class="place-icon" />
            </template>
          </van-cell>
        </van-list>
      </div>
      
      <!-- 地图容器 -->
      <div id="searchMapContainer" class="search-map-container"></div>
    </div>

    <van-form @submit="handleSubmit" class="form">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          name="name"
          label="名称"
          placeholder="请输入地点名称"
          :rules="[{ required: true, message: '请输入地点名称' }]"
        />

        <van-field
          v-model="formData.city"
          name="city"
          readonly
          clickable
          label="城市"
          placeholder="请选择城市"
          :rules="[{ required: true, message: '请选择城市' }]"
          @click="showCityPicker = true"
        >
          <template #button>
            <van-button size="small" type="primary" @click.stop="showCityPicker = true">
              <van-icon name="location-o" />
              选择
            </van-button>
          </template>
        </van-field>

        <van-field
          v-model="formData.address"
          name="address"
          label="地址"
          placeholder="请输入详细地址"
          :rules="[{ required: true, message: '请输入地址' }]"
        >
          <template #button>
            <van-button size="small" type="primary" @click="getLocation">
              <van-icon name="location-o" />
              定位
            </van-button>
          </template>
        </van-field>

        <van-field
          v-model="formData.description"
          name="description"
          label="备注"
          type="textarea"
          rows="3"
          autosize
          placeholder="添加一些备注信息..."
          maxlength="300"
          show-word-limit
        />

        <!-- 图片上传 -->
        <van-cell title="图片" class="uploader-cell">
          <template #value>
            <van-uploader
              v-model="fileList"
              :max-count="5"
              :max-size="5 * 1024 * 1024"
              :before-read="onBeforeRead"
              :after-read="onAfterRead"
              @delete="onDeleteImage"
              upload-text="上传图片"
              accept="image/*"
              multiple
            />
          </template>
        </van-cell>

        <van-field
          readonly
          clickable
          label="标签"
          placeholder="请选择标签"
          @click="showTagPicker = true"
        >
          <template #input>
            <div class="tags-display">
              <van-tag
                v-for="tag in formData.tags"
                :key="tag"
                type="primary"
                size="medium"
              >
                {{ tag }}
              </van-tag>
              <span v-if="!formData.tags.length" class="tags-placeholder">请选择标签</span>
            </div>
          </template>
        </van-field>

        <van-cell title="评分" class="rating-cell">
          <template #value>
            <van-rate
              v-model="formData.rating"
              :size="24"
              color="#FFD21E"
              void-color="#C8C9CC"
              allow-half
            />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="form-footer">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="保存中..."
        >
          保存
        </van-button>
      </div>
    </van-form>

    <!-- 城市选择器 -->
    <van-popup v-model:show="showCityPicker" position="bottom" round style="height: 80%;">
      <CityPicker 
        @select="onCitySelect" 
        @cancel="showCityPicker = false"
        :show-cascade="true"
        default-mode="list"
      />
    </van-popup>

    <!-- 标签选择器 -->
    <van-popup v-model:show="showTagPicker" position="bottom" round>
      <van-picker
        :columns="tagOptions"
        multiple
        @confirm="onTagConfirm"
        @cancel="showTagPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.add-place-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100px;
}

.form {
  margin-top: 12px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tags-placeholder {
  color: #c8c9cc;
  font-size: 14px;
}

.rating-cell :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.form-footer {
  margin: 10px;
}

/* 地图搜索区域样式 */
.map-search-section {
  background: #fff;
  padding: 12px 16px;
  position: relative;
}

.search-input-wrapper {
  margin-bottom: 12px;
}

.search-map-container {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.search-results-panel {
  position: absolute;
  top: 70px;
  left: 16px;
  right: 16px;
  max-height: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 999;
  overflow-y: auto;
}

.place-icon {
  margin-right: 8px;
  color: #ff6b3d;
  font-size: 18px;
}

/* 图片上传样式 */
.uploader-cell :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.uploader-cell :deep(.van-uploader__upload) {
  background-color: #f8f8f8;
  border: 1px dashed #d9d9d9;
}
</style>
