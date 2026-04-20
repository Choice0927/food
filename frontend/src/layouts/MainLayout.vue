<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tabRoutes = {
  home: '/home',
  add: '/add',
  profile: '/profile',
}

const activeTab = computed(() => {
  const path = route.path
  if (path === '/home' || path === '/') return 'home'
  if (path === '/add') return 'add'
  if (path === '/profile') return 'profile'
  return 'home'
})

const onTabChange = (name) => {
  const targetPath = tabRoutes[name]

  if (targetPath && targetPath !== route.path) {
    router.push(targetPath)
  }
}

const onLogout = () => {
  showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      authStore.clearAuth()
      router.push('/login')
    })
    .catch(() => {})
}
</script>

<template>
  <div class="main-layout">
    <main class="main-content">
      <router-view />
    </main>

    <van-tabbar :model-value="activeTab" @change="onTabChange" class="tabbar">
      <van-tabbar-item name="home" icon="home-o">
        我的收藏
      </van-tabbar-item>
      <van-tabbar-item name="add">
        <template #icon>
          <div class="add-btn">
            <van-icon name="plus" />
          </div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f8f8;
}

.main-content {
  flex: 1 1 auto;
  height: 200px;
  padding: 16px;
}

.tabbar {
  --van-tabbar-item-active-color: #ff6b3d;
}

.add-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b3d 0%, #ffb347 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(255, 107, 61, 0.4);
}

.add-text {
  font-size: 12px;
  color: #666;
}
</style>
