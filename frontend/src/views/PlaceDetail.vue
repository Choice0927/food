<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthStore } from '@/stores/auth'
import http from '@/api/http'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

const placeId = computed(() => route.params.id)
const action = computed(() => route.query.action)

const place = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const showImagePreview = ref(false)
const currentImageIndex = ref(0)
const showShareDialog = ref(false)

const isFavorited = computed(() => {
  if (!place.value) return false
  return favoritesStore.isFavorited(place.value.id)
})

const buildCoverStyle = (image) => {
  if (image) {
    return {
      backgroundImage: `url(${image})`,
    }
  }
  return {
    backgroundImage:
      'linear-gradient(135deg, rgba(255, 107, 61, 0.18), rgba(255, 179, 71, 0.3))',
  }
}

const fetchPlaceDetail = async () => {
  loading.value = true

  try {
    const { data } = await http.get(`/places/${placeId.value}`)
    place.value = data.place
  } catch (error) {
    showFailToast(error.response?.data?.message || '获取地点详情失败')
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchPlaceDetail()
}

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    showFailToast('请先登录')
    return
  }

  try {
    await favoritesStore.toggleFavorite(placeId.value)
    await fetchPlaceDetail()
  } catch (error) {
    showFailToast(error.response?.data?.message || '操作失败')
  }
}

const toggleLike = async () => {
  if (!authStore.isAuthenticated) {
    showFailToast('请先登录')
    return
  }

  try {
    const { data } = await http.post(`/places/${placeId.value}/like`)
    showSuccessToast(data.message)
    await fetchPlaceDetail()
  } catch (error) {
    showFailToast(error.response?.data?.message || '操作失败')
  }
}

const openImagePreview = (index) => {
  currentImageIndex.value = index
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
}

const nextImage = () => {
  if (!place.value?.images?.length) return
  currentImageIndex.value = (currentImageIndex.value + 1) % place.value.images.length
}

const prevImage = () => {
  if (!place.value?.images?.length) return
  currentImageIndex.value = (currentImageIndex.value - 1 + place.value.images.length) % place.value.images.length
}

const sharePlace = () => {
  showShareDialog.value = true
}

const copyLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    showSuccessToast('链接已复制')
  }).catch(() => {
    showFailToast('复制失败')
  })
  showShareDialog.value = false
}

const shareToWechat = () => {
  showFailToast('微信分享功能开发中')
  showShareDialog.value = false
}

const goToCheckin = () => {
  router.push(`/places/${placeId.value}?action=checkin`)
}

const addToTrip = () => {
  showFailToast('行程功能开发中')
}

const navigate = () => {
  if (place.value?.latitude && place.value?.longitude) {
    const url = `https://uri.amap.com/?marker=style:${place.value.longitude},${place.value.latitude}&title=${encodeURIComponent(place.value.name)}`
    window.open(url, '_blank')
  } else {
    showFailToast('暂无位置信息')
  }
}

onMounted(async () => {
  await fetchPlaceDetail()
})
</script>

<template>
  <section class="place-detail-page">
    <div v-if="loading" class="skeleton-container">
      <van-skeleton title :row="3" :loading="true">
        <template #template>
          <div class="skeleton-cover"></div>
          <div class="skeleton-content">
            <van-skeleton-title class="skeleton-title" />
            <van-skeleton-paragraph row-width="80%" />
            <van-skeleton-paragraph row-width="60%" />
          </div>
        </template>
      </van-skeleton>
    </div>

    <div v-else-if="place" class="place-detail-container">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="place-detail__cover" :style="buildCoverStyle(place.images?.[0])">
          <button class="place-detail__back" type="button" @click="router.back()">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
        </div>

        <div class="place-detail__content">
          <div class="place-detail__header">
            <h1>{{ place.name }}</h1>
            <div class="place-detail__meta">
              <span class="place-detail__city">
                <i class="fa-solid fa-location-dot"></i>
                {{ place.city }}
              </span>
              <span class="place-detail__rating" v-if="place.rating">
                <van-rate
                  :model-value="place.rating"
                  readonly
                  :size="14"
                  color="#FFD21E"
                  void-color="#C8C9CC"
                />
              </span>
            </div>
          </div>

          <div class="place-detail__address">
            <i class="fa-solid fa-map-pin"></i>
            {{ place.address }}
            <button class="place-detail__navigate" type="button" @click="navigate">
              <i class="fa-solid fa-diamond-turn-right"></i>
              导航
            </button>
          </div>

          <div class="place-detail__description" v-if="place.description">
            <h3>简介</h3>
            <p>{{ place.description }}</p>
          </div>

          <div class="place-detail__notes" v-if="place.notes">
            <h3>备注</h3>
            <p>{{ place.notes }}</p>
          </div>

          <div class="place-detail__images" v-if="place.images?.length">
            <h3>图片</h3>
            <div class="image-gallery">
              <div
                v-for="(image, index) in place.images"
                :key="index"
                class="image-item"
                @click="openImagePreview(index)"
              >
                <img :src="image" :alt="place.name" />
              </div>
            </div>
          </div>

          <div class="place-detail__tags" v-if="place.tags?.length">
            <van-tag
              v-for="tag in place.tags"
              :key="tag"
              type="primary"
              size="small"
            >
              {{ tag }}
            </van-tag>
          </div>

          <div class="place-detail__stats">
            <div class="stat-item">
              <i class="fa-regular fa-thumbs-up"></i>
              <span>{{ place.likesCount }}</span>
            </div>
            <div class="stat-item">
              <i class="fa-regular fa-bookmark"></i>
              <span>{{ place.favoritesCount }}</span>
            </div>
            <div class="stat-item">
              <i class="fa-regular fa-comment"></i>
              <span>{{ place.commentsCount }}</span>
            </div>
          </div>

          <div class="place-detail__actions">
            <van-button
              :type="isFavorited ? 'danger' : 'primary'"
              :icon="isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"
              @click="toggleFavorite"
            >
              {{ isFavorited ? '已收藏' : '收藏' }}
            </van-button>

            <van-button
              type="default"
              icon="fa-regular fa-thumbs-up"
              @click="toggleLike"
            >
              点赞
            </van-button>

            <van-button
              type="default"
              icon="fa-solid fa-share-nodes"
              @click="sharePlace"
            >
              分享
            </van-button>
          </div>

          <div class="place-detail__checkin" v-if="action === 'checkin'">
            <van-button
              type="success"
              size="large"
              block
              @click="goToCheckin"
            >
              <i class="fa-solid fa-check"></i>
              我去过
            </van-button>
          </div>

          <div class="place-detail__add-trip">
            <van-button
              type="default"
              icon="fa-solid fa-route"
              @click="addToTrip"
            >
              添加到行程
            </van-button>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <van-image-preview
      v-model:show="showImagePreview"
      :images="place?.images || []"
      :start-position="currentImageIndex"
      @close="closeImagePreview"
    >
      <template #index="{ index }">
        <div class="image-preview__index">{{ index + 1 }} / {{ place?.images?.length || 0 }}</div>
      </template>
    </van-image-preview>

    <van-dialog
      v-model:show="showShareDialog"
      title="分享"
      :show-confirm-button="false"
      class="share-dialog"
    >
      <div class="share-options">
        <van-button
          type="primary"
          icon="fa-solid fa-link"
          @click="copyLink"
        >
          复制链接
        </van-button>
        <van-button
          type="success"
          icon="fa-brands fa-weixin"
          @click="shareToWechat"
        >
          分享到微信
        </van-button>
      </div>
    </van-dialog>
  </section>
</template>

<style scoped>
.place-detail-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.skeleton-container {
  padding: 16px;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.12), rgba(255, 179, 71, 0.22));
  border-radius: 16px;
  margin-bottom: 16px;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-title {
  width: 60%;
  margin-bottom: 12px;
}

.place-detail-container {
  padding-bottom: 100px;
}

.place-detail__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 0 0 16px 16px 0;
}

.place-detail__back {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  cursor: pointer;
  z-index: 10;
}

.place-detail__content {
  padding: 16px;
}

.place-detail__header {
  margin-bottom: 20px;
}

.place-detail__header h1 {
  margin: 0 0 12px 0;
  color: #333333;
  font-size: 24px;
  line-height: 1.3;
}

.place-detail__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.place-detail__city {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 107, 61, 0.1);
  color: #ff6b3d;
  font-size: 14px;
  font-weight: 600;
}

.place-detail__rating {
  display: flex;
  align-items: center;
}

.place-detail__address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 16px;
  color: #666666;
  font-size: 14px;
}

.place-detail__navigate {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #ff6b3d;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.place-detail__description,
.place-detail__notes {
  margin-bottom: 20px;
}

.place-detail__description h3,
.place-detail__notes h3 {
  margin: 0 0 12px 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.place-detail__description p,
.place-detail__notes p {
  margin: 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
}

.place-detail__images {
  margin-bottom: 20px;
}

.place-detail__images h3 {
  margin: 0 0 12px 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.place-detail__stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666666;
  font-size: 14px;
}

.place-detail__actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.place-detail__actions .van-button {
  flex: 1;
}

.place-detail__checkin {
  margin-bottom: 20px;
}

.place-detail__add-trip {
  margin-bottom: 20px;
}

.share-dialog {
  border-radius: 16px;
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-options .van-button {
  width: 100%;
}

.image-preview__index {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 12px;
}
</style>
