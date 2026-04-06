<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showConfirmDialog } from 'vant'
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

const goToEdit = (id, event) => {
  event.stopPropagation()
  router.push(`/edit/${id}`)
}

const onDelete = async (id, event) => {
  event.stopPropagation()

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
      <div class="map-entry">
        <van-button
          size="small"
          type="default"
          round
          icon="map-marked"
          @click="$router.push('/map')"
        >
          地图模式
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
        <div v-if="filteredPlaces.length" class="place-list">
          <div
            v-for="place in filteredPlaces"
            :key="place._id"
            class="place-card"
            @click="goToDetail(place._id)"
          >
            <div class="place-cover">
              <img v-if="place.images?.[0]" :src="place.images[0]" :alt="place.name">
              <div v-else class="placeholder-cover">
                <van-icon name="photo-o" size="32" />
              </div>
              <span class="city-tag">{{ place.city }}</span>
            </div>
            
            <div class="place-info">
              <h3 class="place-name">{{ place.name }}</h3>
              <p class="place-address">
                <van-icon name="location-o" />
                {{ place.address }}
              </p>
              
              <div class="place-tags" v-if="place.tags?.length">
                <van-tag
                  v-for="tag in place.tags.slice(0, 3)"
                  :key="tag"
                  type="primary"
                  size="small"
                  plain
                >
                  {{ tag }}
                </van-tag>
              </div>
              
              <div class="place-rating" v-if="place.rating > 0">
                <van-rate
                  :model-value="place.rating"
                  readonly
                  :size="12"
                  color="#FFD21E"
                />
              </div>
            </div>
            
            <div class="place-actions" @click.stop>
              <van-button
                size="small"
                type="primary"
                plain
                round
                @click="goToEdit(place._id, $event)"
              >
                编辑
              </van-button>
              <van-button
                size="small"
                type="danger"
                plain
                round
                @click="onDelete(place._id, $event)"
              >
                删除
              </van-button>
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
  /* position: sticky; */
  /* top: 0; */
  z-index: 100;
  background: #f8f8f8;
  margin-bottom: 12px;
  /* padding: 12px 16px; */
}

.content {
  height: 200px;
  flex: 1 1 auto;
  overflow-y: auto;
}

.search-bar {
  display: flex;
  gap: 12px;
}

.search-bar .van-search {
  flex: 1;
  padding: 0;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.place-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.place-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f0f0f0;
}

.place-cover img {
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

.city-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.place-info {
  padding: 12px;
}

.place-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.place-address {
  margin: 0 0 8px;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.place-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.place-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.place-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
}

.place-actions .van-button {
  flex: 1;
}

.bottom-button {
  margin-top: 16px;
}
</style>
