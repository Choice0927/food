<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { usePlacesStore } from '@/stores/places'
import { clearNavigationHistory } from '@/utils/back-handler'

const router = useRouter()
const authStore = useAuthStore()
const placesStore = usePlacesStore()

const user = computed(() => authStore.user)
const placeCount = computed(() => placesStore.places.length)

const menuItems = [
  { icon: 'orders-o', text: '我的收藏', to: '/home' },
  { icon: 'user-o', text: '个人信息', action: 'profile' },
  { icon: 'setting-o', text: '设置', action: 'settings' },
  { icon: 'question-o', text: '帮助与反馈', action: 'help' },
]

const handleMenuClick = (item) => {
  if (item.to) {
    router.push(item.to)
  } else if (item.action === 'profile') {
    showSuccessToast('功能开发中')
  } else if (item.action === 'settings') {
    showSuccessToast('功能开发中')
  } else if (item.action === 'help') {
    showSuccessToast('功能开发中')
  }
}

const onLogout = () => {
  showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      authStore.clearAuth()
      placesStore.resetPlaces()
      router.push('/login')
      clearNavigationHistory()
    })
    .catch(() => {})
}
</script>

<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <van-image
          round
          width="80"
          height="80"
          :src="user?.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
          fit="cover"
        />
      </div>
      <div class="user-info">
        <h3 class="user-name">{{ user?.nickname || '未设置昵称' }}</h3>
        <p class="user-email">{{ user?.email || user?.phone || '' }}</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ placeCount }}</span>
        <span class="stat-label">收藏地点</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ placesStore.cities.length }}</span>
        <span class="stat-label">覆盖城市</span>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-card">
      <van-cell
        v-for="item in menuItems"
        :key="item.text"
        :title="item.text"
        :icon="item.icon"
        is-link
        @click="handleMenuClick(item)"
      />
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button
        block
        round
        type="danger"
        plain
        @click="onLogout"
      >
        退出登录
      </van-button>
    </div>

    <div class="version-info">
      <p>美食地点收藏助手 v1.0.0</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 16px;
  padding-bottom: calc(16px + var(--van-tabbar-height));
  background: #f8f8f8;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-email {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.stats-card {
  display: flex;
  padding: 20px;
  background: linear-gradient(135deg, #ff6b3d 0%, #ffb347 100%);
  border-radius: 12px;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  text-align: center;
  color: #fff;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.menu-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.menu-card :deep(.van-cell__title) {
  font-size: 15px;
}

.menu-card :deep(.van-icon) {
  font-size: 20px;
  color: #ff6b3d;
}

.logout-section {
  margin: 24px 0;
}

.version-info {
  text-align: center;
  padding: 16px;
}

.version-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
}
</style>
