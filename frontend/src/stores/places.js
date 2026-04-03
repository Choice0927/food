import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getPlacesApi,
  createPlaceApi,
  updatePlaceApi,
  deletePlaceApi,
} from '@/api/places'

export const usePlacesStore = defineStore('places', () => {
  const places = ref([])
  const currentPlace = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const cities = computed(() => {
    const citySet = new Set(places.value.map((p) => p.city))
    return Array.from(citySet).filter(Boolean)
  })

  const fetchPlaces = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await getPlacesApi(params)
      places.value = data.data?.list || []
      return data.data
    } catch (err) {
      error.value = err.response?.data?.message || '获取列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlaceById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await getPlacesApi.getPlaceDetailApi(id)
      currentPlace.value = data.data
      return data.data
    } catch (err) {
      error.value = err.response?.data?.message || '获取详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPlace = async (placeData) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await createPlaceApi(placeData)
      places.value.unshift(data.data)
      return data.data
    } catch (err) {
      error.value = err.response?.data?.message || '创建失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlace = async (id, placeData) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await updatePlaceApi(id, placeData)
      const index = places.value.findIndex((p) => p._id === id)
      if (index !== -1) {
        places.value[index] = data.data
      }
      return data.data
    } catch (err) {
      error.value = err.response?.data?.message || '更新失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePlace = async (id) => {
    loading.value = true
    error.value = null

    try {
      await deletePlaceApi(id)
      places.value = places.value.filter((p) => p._id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || '删除失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPlaces = () => {
    places.value = []
    currentPlace.value = null
    error.value = null
  }

  return {
    places,
    currentPlace,
    loading,
    error,
    cities,
    fetchPlaces,
    fetchPlaceById,
    createPlace,
    updatePlace,
    deletePlace,
    resetPlaces,
  }
})
