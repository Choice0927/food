<script setup>
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const quickActions = [
  { icon: 'fa-solid fa-location-dot', label: '地图入口' },
  { icon: 'fa-solid fa-fire', label: '热门攻略' },
  { icon: 'fa-solid fa-camera', label: '打卡发布' },
]

const recommendationList = [
  {
    title: '宽窄巷子必吃川味清单',
    city: '成都',
    desc: '适合初次到访的热门小店合集，覆盖火锅、小吃与咖啡馆。',
  },
  {
    title: '春熙路深夜觅食路线',
    city: '成都',
    desc: '夜游路线占位数据，后续可对接真实攻略内容与分页加载。',
  },
]
</script>

<template>
  <section class="page">
    <div class="hero-card">
      <div>
        <p class="hero-card__eyebrow">移动端优先 · H5 App</p>
        <h1>发现旅行中的每一口惊喜</h1>
        <p class="hero-card__desc">
          当前城市：{{ appStore.currentCity }}，已完成主题色、Vant 变量和基础页面骨架初始化。
        </p>
      </div>
      <van-tag round type="primary">#FF6B3D</van-tag>
    </div>

    <van-search
      shape="round"
      placeholder="搜索城市、店名或关键词"
      readonly
      class="page__search"
    />

    <div class="quick-grid">
      <button
        v-for="item in quickActions"
        :key="item.label"
        type="button"
        class="quick-grid__item"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </button>
    </div>

    <div class="section-header">
      <h2>推荐攻略占位</h2>
      <span>后续可接入接口数据</span>
    </div>

    <article
      v-for="item in recommendationList"
      :key="item.title"
      class="recommend-card"
    >
      <div class="recommend-card__cover"></div>
      <div class="recommend-card__content">
        <div class="recommend-card__meta">
          <van-tag plain type="primary">{{ item.city }}</van-tag>
          <span>推荐</span>
        </div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.recommend-card,
.quick-grid__item {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 16px;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b3d, #ffb347);
}

.hero-card h1,
.hero-card p {
  margin: 0;
}

.hero-card h1 {
  margin-top: 8px;
  font-size: 24px;
  line-height: 1.35;
}

.hero-card__eyebrow,
.hero-card__desc {
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.92;
}

.page__search {
  padding: 0;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quick-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 12px;
  border: none;
  color: #333333;
}

.quick-grid__item i {
  font-size: 20px;
  color: #ff6b3d;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #999999;
}

.section-header h2,
.recommend-card h3,
.recommend-card p {
  margin: 0;
}

.section-header h2 {
  color: #333333;
  font-size: 18px;
}

.recommend-card {
  overflow: hidden;
}

.recommend-card__cover {
  height: 148px;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.2), rgba(255, 179, 71, 0.32));
}

.recommend-card__content {
  padding: 16px;
}

.recommend-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #999999;
  font-size: 12px;
}

.recommend-card h3 {
  font-size: 17px;
  color: #333333;
}

.recommend-card p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #666666;
}
</style>
