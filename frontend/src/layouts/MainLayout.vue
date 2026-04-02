<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const pageTitle = computed(() => route.meta.title || '美食旅行攻略')

const goToPublish = () => {
  router.push('/publish')
}
</script>

<template>
  <div class="app-shell layout">
    <van-nav-bar :title="pageTitle" fixed placeholder />

    <main class="layout__content">
      <router-view />
    </main>

    <button class="layout__fab" type="button" aria-label="新增美食打卡占位按钮" @click="goToPublish">
      <i class="fa-solid fa-plus"></i>
    </button>

    <van-tabbar route placeholder>
      <van-tabbar-item
        v-for="tab in appStore.tabs"
        :key="tab.name"
        :to="tab.path"
      >
        <span>{{ tab.label }}</span>
        <template #icon>
          <i :class="tab.icon"></i>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.layout {
  position: relative;
}

.layout__content {
  padding: 16px 16px 24px;
}

.layout__fab {
  position: fixed;
  left: 50%;
  bottom: 88px;
  z-index: 20;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b3d, #ffb347);
  box-shadow: 0 8px 24px rgba(255, 107, 61, 0.28);
  transform: translateX(-50%);
}

.layout__fab:active {
  transform: translateX(-50%) scale(0.96);
}
</style>
