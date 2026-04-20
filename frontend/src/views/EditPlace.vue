<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { getPlaceDetailApi, updatePlaceApi } from '@/api/places'
import AMapLoader from '@amap/amap-jsapi-loader'

const route = useRoute()
const router = useRouter()
const placeId = route.params.id

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
  '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆',
  '武汉', '西安', '南京', '天津', '苏州', '长沙', '郑州'
]

const tagOptions = [
  '火锅', '烧烤', '日料', '韩料', '西餐', '中餐',
  '小吃', '甜品', '咖啡', '奶茶', '酒吧', '景点'
]

const showCityPicker = ref(false)
const showTagPicker = ref(false)
const loading = ref(false)
const pageLoading = ref(true)

// 地图相关
const A = ref(null)
const map = ref(null)
const marker = ref(null)
const infoWindow = ref(null)

const fetchPlaceDetail = async () => {
  try {
    const { data } = await getPlaceDetailApi(placeId)
    const place = data.data
    
    formData.value = {
      name: place.name || '',
      city: place.city || '',
      address: place.address || '',
      latitude: place.location?.lat || null,
      longitude: place.location?.lng || null,
      description: place.description || '',
      images: place.images || [],
      tags: place.tags || [],
      rating: place.rating || 0,
    }
  } catch (error) {
    showFailToast('获取详情失败')
    router.back()
  } finally {
    pageLoading.value = false
  }
}

const onCityConfirm = ({ selectedOptions }) => {
  formData.value.city = selectedOptions[0].value
  showCityPicker.value = false
}

const onTagConfirm = ({ selectedOptions }) => {
  formData.value.tags = selectedOptions.map((option) => option.value)
  showTagPicker.value = false
}

const getLocation = () => {
  if (!navigator.geolocation) {
    showFailToast('您的浏览器不支持定位功能')
    return
  }

  showLoadingToast({
    message: '获取位置中...',
    forbidClick: true,
    duration: 0,
  })

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      formData.value.latitude = latitude
      formData.value.longitude = longitude
    },
    (error) => {
      showFailToast('获取位置失败，请检查定位权限')
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
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
    await updatePlaceApi(placeId, formData.value)
    showSuccessToast('更新成功')
    router.push('/home')
  } catch (error) {
    showFailToast(error.message || '更新失败')
  } finally {
    loading.value = false
  }
}

// 初始化地图
const initMap = async () => {
  if (!formData.value.latitude || !formData.value.longitude) {
    console.log('暂无位置信息，无法显示地图')
    return
  }

  try {
    const AMapInstance = await AMapLoader.load({
      key: 'eb61e5f53014f0ca023a5fd2e01c6716',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Marker', 'AMap.InfoWindow']
    })

    A.value = AMapInstance

    const lnglat = [formData.value.longitude, formData.value.latitude]

    // 初始化地图
    map.value = new AMapInstance.Map('editMapContainer', {
      zoom: 16,
      center: lnglat
    })

    // 添加控件
    map.value.addControl(new AMapInstance.Scale())
    map.value.addControl(new AMapInstance.ToolBar({
      position: 'RB'
    }))

    // 添加标记
    marker.value = new AMapInstance.Marker({
      position: lnglat,
      title: formData.value.name,
      animation: 'AMAP_ANIMATION_DROP'
    })
    marker.value.setMap(map.value)

    // 添加信息窗
    infoWindow.value = new AMapInstance.InfoWindow({
      content: `<div style="padding:8px;"><strong>${formData.value.name}</strong><br/>${formData.value.address || ''}</div>`,
      offset: new AMapInstance.Pixel(0, -30)
    })
    infoWindow.value.open(map.value, lnglat)

  } catch (error) {
    console.error('地图加载失败:', error)
  }
}

// 监听 formData 变化，加载地图
watch(() => formData.value.latitude, (newLat) => {
  if (newLat && formData.value.longitude && !map.value) {
    // 延迟初始化地图，确保 DOM 已渲染
    setTimeout(() => {
      initMap()
    }, 100)
  }
}, { immediate: false })

onMounted(() => {
  fetchPlaceDetail()
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})
</script>

<template>
  <div class="edit-place-page">
    <van-nav-bar
      title="编辑地点"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <van-skeleton :row="10" :loading="pageLoading">
      <!-- 地图区域 -->
      <div v-if="formData.latitude && formData.longitude" class="map-section">
        <div id="editMapContainer" class="edit-map-container"></div>
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
          />

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
    </van-skeleton>

    <!-- 城市选择器 -->
    <van-popup v-model:show="showCityPicker" position="bottom" round>
      <van-picker
        :columns="cities.map(c => ({ text: c, value: c }))"
        @confirm="onCityConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>

    <!-- 标签选择器 -->
    <van-popup v-model:show="showTagPicker" position="bottom" round>
      <van-picker
        :columns="tagOptions.map(t => ({ text: t, value: t }))"
        multiple
        @confirm="onTagConfirm"
        @cancel="showTagPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.edit-place-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100px;
}

.map-section {
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.edit-map-container {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
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
  margin: 24px 16px;
}
</style>
