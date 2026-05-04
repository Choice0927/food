<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { usePlacesStore } from '@/stores/places'
import PermissionDialog from '@/components/PermissionDialog.vue'
import {
  hasLocationPermission,
  requestCorePermissions,
  getPermissionStateText,
  PermissionType
} from '@/utils/permissions'
import { showFailToast, showConfirmDialog } from 'vant'

const placesStore = usePlacesStore()

let map = null
let markers = []
let A = null
const selectedPlace = ref(null)
const showPlaceCard = ref(false)
const showPermissionDialog = ref(false)
const permissionType = ref('location')
const permissionDescription = ref('')
const permissionRationale = ref('')

const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

const checkAndRequestLocationPermission = async () => {
  try {
    // 在 App 环境中使用 Capacitor 权限
    const hasPermission = await hasLocationPermission()

    if (hasPermission) {
      return true
    }

    // 没有权限，显示请求对话框
    permissionType.value = 'location'
    permissionDescription.value = '食mini 需要访问您的位置信息来显示地图和查找附近的美食地点'
    permissionRationale.value = '定位功能用于：\n1. 显示地图上的当前位置\n2. 查找附近的美食地点\n3. 提供导航服务'

    showPermissionDialog.value = true
    return false
  } catch (error) {
    console.error('检查定位权限失败:', error)
    return false
  }
}

const handlePermissionConfirm = async () => {
  try {
    showPermissionDialog.value = false

    // 请求核心权限（包括定位）
    const result = await requestCorePermissions()

    if (result) {
      const locationResult = result.results[PermissionType.LOCATION]

      if (locationResult.state === 'granted') {
        showFailToast('权限已授权，请重新获取位置')
        setTimeout(() => {
          initializeMap()
        }, 1000)
      } else if (locationResult.state === 'denied') {
        showConfirmDialog({
          title: '权限被拒绝',
          message: '定位权限已被拒绝。您可以在系统设置中手动开启权限。',
          confirmButtonText: '去设置',
          cancelButtonText: '取消'
        }).then((action) => {
          if (action === 'confirm') {
            // 打开系统设置（需要安装 @capacitor/app-settings 插件）
            showFailToast('请在系统设置中开启定位权限')
          }
        })
      }
    } else {
      showFailToast('权限请求失败，请重试')
    }
  } catch (error) {
    console.error('请求权限失败:', error)
    showFailToast('权限请求失败：' + error.message)
  }
}

const initializeMap = async () => {
  try {
    // 检查定位权限
    const hasPermission = await checkAndRequestLocationPermission()
    if (!hasPermission) {
      return
    }

    AMapLoader.load({
      key: '3bc4a8fb4398ccef75e646555b4fb37d',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar']
    })
      .then(async (AMapInstance) => {
        A = AMapInstance
        let center = [116.397428, 39.90923]

        try {
          const position = await getCurrentPosition()
          center = [position.lng, position.lat]
          console.log('当前位置:', position)
        } catch (error) {
          console.log('获取位置失败，使用默认中心:', error)
        }

        map = new A.Map('container', {
          viewMode: '2D',
          zoom: 11,
          center: center
        })

        map.addControl(new A.Scale())
        map.addControl(new A.ToolBar({
          position: 'RB'
        }))

        await placesStore.fetchPlaces({ limit: 1000 })
        console.log('获取到的地点数据:', placesStore.places)

        const places = placesStore.places
        places.forEach((place) => {
          if (place.location?.lat && place.location?.lng) {
            const position = [place.location.lng, place.location.lat]
            const marker = new A.Marker({
              position: position,
              title: place.name,
              extData: place,
              label: {
                content: `<div class="map-marker-label">${place.name}</div>`,
                direction: 'bottom'
              }
            })

            marker.on('click', () => {
              console.log('点击的地点:', place)
              selectedPlace.value = place
              showPlaceCard.value = true
            })

            marker.setMap(map)
            markers.push(marker)
          }
        })
      })
      .catch((e) => {
        console.log(e)
      })
  } catch (error) {
    console.error('初始化地图失败:', error)
  }
}

const closePlaceCard = () => {
  showPlaceCard.value = false
  selectedPlace.value = null
}

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  markers.forEach((marker) => {
    marker.setMap(null)
  })
  markers = []
  map?.destroy()
})
</script>

<template>
  <div id="container"></div>

  <PermissionDialog
    :show="showPermissionDialog"
    :type="permissionType"
    :description="permissionDescription"
    :rationale="permissionRationale"
    @confirm="handlePermissionConfirm"
  />

  <transition name="slide-up">
    <div v-if="showPlaceCard && selectedPlace" class="place-card-wrapper">
      <div class="place-card">
        <div class="place-card__header">
          <h3 class="place-name">{{ selectedPlace.name }}</h3>
          <span class="close-icon" @click="closePlaceCard">✕</span>
        </div>
        
        <div class="place-card__info">
          <div class="info-item">
            <span class="info-label">地址：</span>
            <span class="info-value">{{ selectedPlace.address }}</span>
          </div>
          <div v-if="selectedPlace.tags?.length" class="tags">
            <span class="info-label">标签：</span>
            <span
              v-for="tag in selectedPlace.tags.slice(0, 3)"
              :key="tag"
              class="tag-item"
            >
              {{ (tag) }}
            </span>
          </div>
          <div v-if="selectedPlace.rating > 0" class="rating">
            <span class="info-label">评分：</span>
            <span class="rating-value">{{ selectedPlace.rating }} 星</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
#container {
  width: 100%;
  height: 800px;
}

:deep(.map-marker-label) {
  padding: 4px 8px;
  background: rgba(255, 107, 61, 0.9);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.place-card-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.1));
  z-index: 100;
}

.place-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.place-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.place-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-icon {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.place-card__info {
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.info-label {
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.info-value {
  color: #666;
}

.tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  padding: 4px 8px;
  background: #f0f0f0;
  color: #ff6b3d;
  border-radius: 4px;
  font-size: 12px;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-value {
  color: #FFD21E;
  font-weight: 600;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
