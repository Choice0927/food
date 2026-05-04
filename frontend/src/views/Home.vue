<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showConfirmDialog } from 'vant'
import { usePlacesStore } from '@/stores/places'
import { useAuthStore } from '@/stores/auth'
import { deletePlaceApi } from '@/api/places'

const router = useRouter()
const placesStore = usePlacesStore()
const authStore = useAuthStore()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = 10

const searchKeyword = ref('')
const selectedCity = ref('')
const showCityPicker = ref(false)
const viewMode = ref('list')

const cityColumns = computed(() => {
  const cities = placesStore.cities.map(city => ({ text: city, value: city }))
  return [{ text: '全部城市', value: '' }, ...cities]
})

const filteredPlaces = computed(() => {
  let list = [...placesStore.places]

  if (selectedCity.value) {
    list = list.filter(item => item.city === selectedCity.value)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    list = list.filter(item =>
      item.name?.toLowerCase().includes(keyword) ||
      item.address?.toLowerCase().includes(keyword) ||
      item.tags?.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  return list
})

const onCityConfirm = ({ selectedOptions }) => {
  selectedCity.value = selectedOptions[0].value
  showCityPicker.value = false
}

const fetchPlaces = async (reset = false) => {
  if (reset) {
    currentPage.value = 1
    finished.value = false
  }

  if (finished.value && !reset) return

  loading.value = true

  try {
    await placesStore.fetchPlaces({
      city: selectedCity.value,
      keyword: searchKeyword.value,
      page: currentPage.value,
      limit: pageSize
    })

    finished.value = placesStore.places.length < pageSize * currentPage.value
    if (!finished.value) {
      currentPage.value++
    }
  } catch (error) {
    showFailToast('获取列表失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchPlaces(true)
}

const onLoad = async () => {
  await fetchPlaces()
}

const goToDetail = (id) => {
  router.push(`/places/${id}`)
}

const goToEdit = (id) => {
  router.push(`/edit/${id}`)
}

const onDelete = async (id) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个地点吗？此操作不可恢复。',
    })

    await deletePlaceApi(id)
    await placesStore.fetchPlaces({ reset: true })
    showSuccessToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      showFailToast('删除失败')
    }
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchPlaces(true)
  }
})
</script>

<template>
  <div class="home-page">
    <!-- 固定的顶部搜索栏 -->
    <div class="header">
      <div class="search-bar">
        <van-search
          v-model="searchKeyword"
          shape="round"
          placeholder="搜索店名、地址或标签"
          @search="fetchPlaces(true)"
        />
        <van-button 
          size="small" 
          type="primary" 
          round
          @click="showCityPicker = true"
        >
          {{ selectedCity || '城市' }}
        </van-button>
      </div>
      <!-- 地图模式入口 -->
      <div class="header-actions">
        <van-button
          size="small"
          type="default"
          round
          @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
        >
          <van-icon :name="viewMode === 'list' ? 'apps-o' : 'bars'" />
        </van-button>
        <van-button
          size="small"
          type="default"
          round
          icon="map-marked"
          @click="$router.push('/map')"
        >
          地图
        </van-button>
      </div>
    </div>

    <!-- 城市选择器 -->
    <van-popup v-model:show="showCityPicker" position="bottom" round>
      <van-picker
        :columns="cityColumns"
        @confirm="onCityConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>

    <!-- 可滚动的地点列表区域 -->
    <van-pull-refresh class="content" v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="filteredPlaces.length" :class="['place-list', `place-list--${viewMode}`]">
          <div
            v-for="place in filteredPlaces"
            :key="place._id"
            :class="['place-card', `place-card--${viewMode}`]"
          >
            <div v-if="viewMode === 'list'" class="place-card-list">
              <van-swipe-cell :disabled="false" class="custom-swipe-cell">
                <div class="place-card-content" @click="goToDetail(place._id)">
                  <div class="place-thumbnail">
                    <img v-if="place.images?.[0]" :src="place.images[0]" :alt="place.name">
                    <div v-else class="placeholder-thumbnail">
                      <van-icon name="photo-o" size="20" />
                    </div>
                  </div>
                  
                  <div class="place-content">
                    <div class="place-header">
                      <h3 class="place-name">{{ place.name }}</h3>
                      <span class="city-badge">{{ place.city }}</span>
                    </div>
                    <p class="place-address">
                      <van-icon name="location-o" />
                      {{ place.address }}
                    </p>
                    <div class="place-tags" v-if="place.tags?.length">
                      <van-tag
                        v-for="tag in place.tags.slice(0, 2)"
                        :key="tag"
                        type="primary"
                        size="small"
                        plain
                      >
                        {{ tag }}
                      </van-tag>
                      <span v-if="place.tags.length > 2" class="tags-more">
                        +{{ place.tags.length - 2 }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <template #right>
                  <van-button
                    square
                    type="primary"
                    text="编辑"
                    class="swipe-button swipe-button-edit"
                    style="width: 80px;"
                    @click.stop="goToEdit(place._id)"
                  />
                  <van-button
                    square
                    type="danger"
                    text="删除"
                    class="swipe-button swipe-button-delete"
                    style="width: 80px;"
                    @click.stop="onDelete(place._id)"
                  />
                </template>
              </van-swipe-cell>
            </div>
            
            <div v-else class="place-card-grid" @click="goToDetail(place._id)">
              <div class="grid-cover">
                <img v-if="place.images?.[0]" :src="place.images[0]" :alt="place.name">
                <div v-else class="placeholder-cover">
                  <van-icon name="photo-o" size="32" />
                </div>
              </div>
              <div class="grid-info">
                <h4 class="grid-name">{{ place.name }}</h4>
                <p class="grid-city">{{ place.city }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <van-empty
          v-else
          image="search"
          description="还没有收藏任何地点"
        >
          <van-button
            round
            type="primary"
            class="bottom-button"
            @click="$router.push('/add')"
          >
            去添加第一个地点
          </van-button>
        </van-empty>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f8f8;
}

/* 固定的顶部搜索栏 */
.header {
  z-index: 100;
  background: #f8f8f8;
  margin-bottom: 12px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.content {
  height: 200px;
  flex: 1 1 auto;
  overflow-y: auto;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.search-bar .van-search {
  flex: 1;
  padding: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.place-list--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.place-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.place-card--list {
  margin-bottom: 0;
}

.place-card-list {
  padding: 0;
}

.place-card-list :deep(.van-swipe-cell) {
  border-radius: 12px;
  overflow: hidden;
}

.custom-swipe-cell :deep(.van-swipe-cell__right) {
  display: flex !important;
  height: 100% !important;
}

.custom-swipe-cell :deep(.van-swipe-cell__wrapper) {
  height: 100% !important;
}

.place-card-content {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 12px;
  background: #fff;
}

.swipe-button {
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.swipe-button-edit {
  width: 65px;
  padding: 0 10px;
}

.swipe-button-delete {
  width: 65px;
  padding: 0 10px;
}

.place-thumbnail {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.place-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  background: #f5f5f5;
}

.place-content {
  flex: 1;
  min-width: 0;
}

.place-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.place-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 50px);
}

.city-badge {
  padding: 2px 8px;
  background: #f0f5ff;
  color: #1677ff;
  font-size: 11px;
  border-radius: 10px;
  flex-shrink: 0;
}

.place-address {
  margin: 0 0 6px;
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.tags-more {
  font-size: 11px;
  color: #999;
}

.place-card-grid {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 220px;
}

.grid-cover {
  width: 100%;
  height: 160px;
  flex-shrink: 0;
  background: #f5f5f5;
}

.grid-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.grid-info {
  padding: 8px;
}

.grid-name {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-city {
  margin: 0;
  font-size: 11px;
  color: #999;
}

.bottom-button {
  margin-top: 16px;
}
</style>
