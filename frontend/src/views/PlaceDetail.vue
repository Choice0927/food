<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showConfirmDialog } from 'vant'
import { getPlaceDetailApi, deletePlaceApi } from '@/api/places'

const route = useRoute()
const router = useRouter()
const placeId = route.params.id

const place = ref(null)
const loading = ref(true)
const currentImageIndex = ref(0)
const showImagePreview = ref(false)

const fetchPlaceDetail = async () => {
  loading.value = true
  try {
    const { data } = await getPlaceDetailApi(placeId)
    place.value = data.data
  } catch (error) {
    showFailToast('获取详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const onDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个地点吗？此操作不可恢复。',
    })

    await deletePlaceApi(placeId)
    showSuccessToast('删除成功')
    router.push('/home')
  } catch (error) {
    if (error !== 'cancel') {
      showFailToast('删除失败')
    }
  }
}

const onNavigate = () => {
  if (place.value?.location?.lat && place.value?.location?.lng) {
    const url = `https://uri.amap.com/navigation?to=${place.value.location.lng},${place.value.location.lat},${encodeURIComponent(place.value.name)}&mode=car&policy=1`
    window.open(url, '_blank')
  } else {
    showFailToast('暂无位置信息')
  }
}

const openImagePreview = (index) => {
  currentImageIndex.value = index
  showImagePreview.value = true
}

onMounted(() => {
  fetchPlaceDetail()
})
</script>

<template>
  <div class="place-detail-page">
    <van-nav-bar
      title="地点详情"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="edit" size="18" @click="$router.push(`/edit/${placeId}`)" />
      </template>
    </van-nav-bar>

    <van-skeleton :row="10" :loading="loading">
      <div v-if="place" class="detail-content">
        <!-- 图片轮播 -->
        <div v-if="place.images?.length" class="image-gallery">
          <van-swipe :autoplay="3000" indicator-color="#ff6b3d">
            <van-swipe-item
              v-for="(image, index) in place.images"
              :key="index"
              @click="openImagePreview(index)"
            >
              <img :src="image" :alt="place.name" class="gallery-image">
            </van-swipe-item>
          </van-swipe>
        </div>

        <!-- 基本信息 -->
        <div class="info-section">
          <h1 class="place-name">{{ place.name }}</h1>
          
          <div class="meta-row">
            <van-tag type="primary" size="medium">{{ place.city }}</van-tag>
            <van-rate
              v-if="place.rating > 0"
              :model-value="place.rating"
              readonly
              :size="16"
              color="#FFD21E"
            />
          </div>

          <div class="address-row" @click="onNavigate">
            <van-icon name="location-o" />
            <span class="address-text">{{ place.address }}</span>
            <van-icon name="guide-o" class="navigate-icon" />
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="place.tags?.length" class="tags-section">
          <h3>标签</h3>
          <div class="tags-list">
            <van-tag
              v-for="tag in place.tags"
              :key="tag"
              type="primary"
              plain
              round
              size="medium"
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>

        <!-- 备注 -->
        <div v-if="place.description" class="description-section">
          <h3>备注</h3>
          <p class="description-text">{{ place.description }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button
            round
            block
            type="primary"
            @click="$router.push(`/edit/${placeId}`)"
          >
            <van-icon name="edit" />
            编辑
          </van-button>
          <van-button
            round
            block
            type="danger"
            plain
            @click="onDelete"
          >
            <van-icon name="delete-o" />
            删除
          </van-button>
        </div>
      </div>
    </van-skeleton>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="place?.images || []"
      :start-position="currentImageIndex"
    />
  </div>
</template>

<style scoped>
.place-detail-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.detail-content {
  padding-bottom: 24px;
}

.image-gallery {
  background: #fff;
}

.gallery-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.info-section {
  padding: 16px;
  background: #fff;
  margin-bottom: 12px;
}

.place-name {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  cursor: pointer;
}

.address-text {
  flex: 1;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigate-icon {
  color: #ff6b3d;
  font-size: 20px;
}

.tags-section,
.description-section {
  padding: 16px;
  background: #fff;
  margin-bottom: 12px;
}

.tags-section h3,
.description-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.description-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
</style>
