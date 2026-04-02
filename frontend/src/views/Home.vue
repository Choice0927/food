<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant'
import { getPostsApi } from '@/api/posts'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

const activeTab = ref('favorites')
const posts = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const initialLoading = ref(true)
const currentPage = ref(1)
const pageSize = 6
const searchKeyword = ref('')

const showRandomDialog = ref(false)
const randomPlace = ref(null)

const tabs = [
  { name: 'favorites', label: '我的收藏' },
  { name: 'nearby', label: '附近热门' },
]

const tagOptions = [
  { text: '全部', value: '' },
  { text: '火锅', value: '火锅' },
  { text: '烧烤', value: '烧烤' },
  { text: '小吃', value: '小吃' },
  { text: '甜品', value: '甜品' },
  { text: '咖啡', value: '咖啡' },
  { text: '景点', 'value': '景点' },
]

const selectedTag = ref('')
const showTagPicker = ref(false)

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const tag = selectedTag.value

  let list = posts.value

  if (tag) {
    list = list.filter((item) => item.tags?.includes(tag))
  }

  if (keyword) {
    list = list.filter((item) =>
      [item.name, item.city, item.description].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(keyword),
      ),
    )
  }

  return list
})

const buildCoverStyle = (post) => {
  const image = post.images?.[0]

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

const fetchPosts = async ({ reset = false } = {}) => {
  if (reset) {
    currentPage.value = 1
    finished.value = false
  }

  if (finished.value && !reset) {
    return
  }

  loading.value = true

  try {
    const { data } = await getPostsApi({
      page: currentPage.value,
      limit: pageSize,
    })

    const incomingList = data.list || []

    if (reset) {
      posts.value = incomingList
    } else {
      posts.value = [...posts.value, ...incomingList]
    }

    finished.value = !data.pagination?.hasMore

    if (data.pagination?.hasMore) {
      currentPage.value += 1
    }
  } catch (error) {
    showFailToast(error.response?.data?.message || '获取美食列表失败')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    initialLoading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchPosts({ reset: true })
}

const onLoad = async () => {
  await fetchPosts()
}

const openMap = () => {
  showFailToast('地图功能开发中')
}

const onTabChange = async (name) => {
  activeTab.value = name

  if (name === 'favorites') {
    await favoritesStore.fetchFavorites({ reset: true })
    posts.value = favoritesStore.favorites
  } else {
    await fetchPosts({ reset: true })
  }
}

const onTagConfirm = ({ selectedOptions }) => {
  selectedTag.value = selectedOptions[0].value
  showTagPicker.value = false
}

const getRandomPlace = async () => {
  try {
    const { data } = await getPostsApi('/places/random', {
      params: {
        city: selectedTag.value,
      },
    })

    randomPlace.value = data.place
    showRandomDialog.value = true
  } catch (error) {
    showFailToast(error.response?.data?.message || '随机推荐失败')
  }
}

const onRandomPlaceAction = async (action) => {
  if (action === 'navigate') {
    showRandomDialog.value = false
    router.push(`/places/${randomPlace.value.id}`)
  } else if (action === 'checkin') {
    showRandomDialog.value = false
    router.push(`/places/${randomPlace.value.id}?action=checkin`)
  } else if (action === 'reroll') {
    await getRandomPlace()
  }
}

const goToPlaceDetail = (placeId) => {
  router.push(`/places/${placeId}`)
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await favoritesStore.fetchFavorites({ reset: true })
    posts.value = favoritesStore.favorites
  } else {
    await fetchPosts({ reset: true })
  }
})
</script>

<template>
  <section class="home-page">
    <div class="home-page__toolbar">
      <van-search
        v-model="searchKeyword"
        shape="round"
        placeholder="搜索城市、店名或关键词"
        class="home-page__search"
      />

      <button class="home-page__map-button" type="button" @click="openMap">
        <i class="fa-solid fa-map-location-dot"></i>
      </button>
    </div>

    <div class="home-page__random">
      <button class="random-button" type="button" @click="getRandomPlace">
        <i class="fa-solid fa-shuffle"></i>
        <span>随缘一吃</span>
      </button>
    </div>

    <div class="home-page__tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
          :title="tab.label"
        />
      </van-tabs>
    </div>

    <div class="home-page__tags">
      <van-tag
        v-for="tag in tagOptions"
        :key="tag.value"
        :type="selectedTag === tag.value ? 'primary' : 'default'"
        :plain="selectedTag !== tag.value"
        @click="selectedTag = tag.value"
      >
        {{ tag.text }}
      </van-tag>
    </div>

    <div v-if="initialLoading" class="skeleton-list">
      <div v-for="index in 3" :key="index" class="skeleton-card">
        <van-skeleton title avatar :row="3" :loading="true">
          <template #template>
            <div class="skeleton-card__cover"></div>
            <div class="skeleton-card__body">
              <van-skeleton-title class="skeleton-card__title" />
              <van-skeleton-paragraph row-width="80%" />
              <van-skeleton-paragraph row-width="55%" />
            </div>
          </template>
        </van-skeleton>
      </div>
    </div>

    <van-pull-refresh
      v-else
      v-model:refreshing="refreshing"
      success-text="刷新成功"
      @refresh="onRefresh"
    >
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多美食内容了"
        @load="onLoad"
      >
        <div v-if="filteredPosts.length" class="post-list">
          <article
            v-for="post in filteredPosts"
            :key="post.id"
            class="post-card"
            @click="goToPlaceDetail(post.id)"
          >
            <div class="post-card__cover" :style="buildCoverStyle(post)">
              <span class="post-card__city">{{ post.city }}</span>
              <div v-if="post.isFavorited" class="post-card__favorited">
                <i class="fa-solid fa-heart"></i>
              </div>
            </div>

            <div class="post-card__content">
              <div class="post-card__header">
                <h2>{{ post.name }}</h2>
                <span>{{ new Date(post.createdAt).toLocaleDateString('zh-CN') }}</span>
              </div>

              <p class="post-card__desc">
                {{ post.description || post.notes || '这家店值得收藏，后续可查看完整攻略详情。' }}
              </p>

              <div class="post-card__footer">
                <div class="post-card__location">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>{{ post.address }}</span>
                </div>

                <div class="post-card__stats">
                  <span>
                    <i class="fa-regular fa-thumbs-up"></i>
                    {{ post.likesCount }}
                  </span>
                  <span>
                    <i class="fa-regular fa-bookmark"></i>
                    {{ post.favoritesCount }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <van-empty
          v-else
          image="search"
          description="暂无符合条件的美食内容"
        />
      </van-list>
    </van-pull-refresh>

    <van-dialog
      v-model:show="showRandomDialog"
      title="随缘一吃"
      :show-confirm-button="false"
      class="random-dialog"
    >
      <div v-if="randomPlace" class="random-place-card">
        <div class="random-place-card__cover" :style="buildCoverStyle(randomPlace)">
          <span class="random-place-card__city">{{ randomPlace.city }}</span>
        </div>

        <div class="random-place-card__content">
          <h3>{{ randomPlace.name }}</h3>
          <p class="random-place-card__address">
            <i class="fa-solid fa-location-dot"></i>
            {{ randomPlace.address }}
          </p>

          <div v-if="randomPlace.tags?.length" class="random-place-card__tags">
            <van-tag
              v-for="tag in randomPlace.tags"
              :key="tag"
"
              type="primary"
              size="small"
            >
              {{ tag }}
            </van-tag>
          </div>

          <div class="random-place-card__rating" v-if="randomPlace.rating">
            <van-rate
              :model-value="randomPlace.rating"
              readonly
              :size="16"
              color="#FFD21E"
              void-color="#C8C9CC"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="random-dialog__actions">
          <van-button
            type="default"
            @click="onRandomPlaceAction('reroll')"
          >
            <i class="fa-solid fa-shuffle"></i>
            再摇一次
          </van-button>
          <van-button
            type="primary"
            @click="onRandomPlaceAction('navigate')"
          >
            <i class="fa-solid fa-location-dot"></i>
            查看详情
          </van-button>
          <van-button
            type="success"
            @click="onRandomPlaceAction('checkin')"
          >
            <i class="fa-solid fa-check"></i>
            标记去过
          </van-button>
        </div>
      </template>
    </van-dialog>
  </section>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-page__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-page__search {
  flex: 1;
  padding: 0;
}

.home-page__map-button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  color: #ff6b3d;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.home-page__random {
  padding: 0 16px;
}

.random-button {
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff6b3d 0%, #ffb347 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(255, 107, 61, 0.3);
  transition: transform 0.2s;
}

.random-button:active {
  transform: scale(0.98);
}

.home-page__tabs {
  padding: 0 16px;
}

.home-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px;
}

.skeleton-list,
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card,
.post-card {
  overflow: hidden;
;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.skeletonkeleton-card {
  padding: 0;
}

.skeleton-card :deep(.van-skeleton) {
  display: block;
}

.skeleton-card__cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.12), rgba(255, 179, 71, 0.22));
}

.skeleton-card__body {
  padding: 16px;
}

.skeleton-card__title {
  width: 60%;
}

.post-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.post-card__city {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: #ff6b3d;
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  font-weight: 600;
}

.post-card__favorited {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  color: #ff6b3d;
}

.post-card__content {
  padding: 16px;
}

.post-card__header,
.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.post-card__header h2,
.post-card__desc,
.post-card__location span,
.post-card__header span,
.post-card__stats span {
  margin: 0;
}

.post-card__header h2 {
  flex: 1;
  color: #333333;
  font-size: 18px;
  line-height: 1.4;
}

.post-card__header span {
  color: #999999;
  font-size: 12px;
  white-space: nowrap;
}

.post-card__desc {
  margin-top: 10px;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-card__footer {
  margin-top: 14px;
  align-items: flex-end;
}

.post-card__location {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: #999999;
  font-size: 12px;
}

.post-card__location span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-card__stats {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #999999;
  font-size: 12px;
  white-space: nowrap;
}

.post-card__stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.random-dialog {
  border-radius: 16px;
}

.random-place-card {
  overflow: hidden;
  border-radius: 12px;
}

.random-place-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.random-place-card__city {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: #ff6b3d;
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  font-weight: 600;
}

.random-place
-card__content {
  padding: 20px;
}

.random-place-card__content h3 {
  margin: 0 0 12px;
  color: #333333;
  font-size: 20px;
  line-height: 1.4;
}

.random-place-card__address {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666666;
  font-size: 14px;
  margin-bottom: 16px;
}

.random-place-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.random-place-card__rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.random-dialog__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.random-dialog__actions .van-button {
  width: 100%;
}
</style>
