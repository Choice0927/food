import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import http from '@/api/http'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isFavorited = computed(() => (placeId) => {
    return favorites.value.some((fav) => fav.placeId === placeId)
  })

  const fetchFavorites = async ({ page = 1, limit = 10 } = {}) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await http.get('/favorites', {
        params: { page, limit },
      })

      if (page === 1) {
        favorites.value = data.list || []
      } else {
        favorites.value = [...favorites.value, ...(data.list || [])]
      }

      return data
    } catch (err) {
      error.value = err.response?.data?.message || '获取收藏列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleFavorite = async (placeId) => {
    error.value = null

    try {
      const { data } = await http.post('/favorites', { placeId })

      if (data.favorited) {
        const place = await getPlaceDetail(placeId)
        if (place) {
          favorites.value.unshift(place)
        }
      } else {
        favorites.value = favorites.value.filter((fav) => fav.placeId !== placeId)
      }

      return data
    } catch (err) {
      error.value = err.response?.data?.message || '操作失败'
      throw err
    }
  }

  const checkFavoriteStatus = async (placeId) => {
    try {
      const { data } = await http.get(`/favorites/check/${placeId}`)
      return data.favorited
    } catch (err) {
      console.error('检查收藏状态失败', err)
      return false
    }
  }

  const getPlaceDetail = async (placeId) => {
    try {
      const { data } = await http.get(`/places/${placeId}`)
      return data.place
    } catch (err) {
      console.error('获取地点详情失败', err)
      return null
    }
  }

  const resetFavorites = () => {
    favorites.value = []
    error.value = null
  }

  return {
    favorites,
    loading,
    error,
    isFavorited,
    fetchFavorites,
    toggleFavorite,
    checkFavoriteStatus,
    resetFavorites,
  }
})
