import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const currentCity = ref('成都')
  const tabs = ref([
    {
      name: 'home',
      path: '/home',
      label: '首页',
      icon: 'fa-solid fa-house',
    },
    {
      name: 'trips',
      path: '/trips',
      label: '行程',
      icon: 'fa-solid fa-route',
    },
    {
      name: 'profile',
      path: '/profile',
      label: '我的',
      icon: 'fa-regular fa-user',
    },
  ])

  const currentTheme = computed(() => ({
    primaryColor: '#FF6B3D',
    secondaryColor: '#FFB347',
    backgroundColor: '#F8F8F8',
  }))

  return {
    currentCity,
    currentTheme,
    tabs,
  }
})
