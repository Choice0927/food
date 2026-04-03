<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { usePlacesStore } from '@/stores/places'

const router = useRouter()
const placesStore = usePlacesStore()

const formData = ref({
  name: '',
  city: '',
  address: '',
  latitude: null,
  longitude: null,
  description: '',
  images: [],
  tags: [],
  rating: 0,
})

const cities = [
  { text: '北京', value: '北京' },
  { text: '上海', value: '上海' },
  { text: '广州', value: '广州' },
  { text: '深圳', value: '深圳' },
  { text: '杭州', value: '杭州' },
  { text: '成都', value: '成都' },
  { text: '重庆', value: '重庆' },
  { text: '武汉', value: '武汉' },
  { text: '西安', value: '西安' },
  { text: '南京', value: '南京' },
]

const tagOptions = [
  { text: '火锅', value: '火锅' },
  { text: '烧烤', value: '烧烤' },
  { text: '日料', value: '日料' },
  { text: '韩料', value: '韩料' },
  { text: '西餐', value: '西餐' },
  { text: '中餐', value: '中餐' },
  { text: '小吃', value: '小吃' },
  { text: '甜品', value: '甜品' },
  { text: '咖啡', value: '咖啡' },
  { text: '奶茶', value: '奶茶' },
  { text: '酒吧', value: '酒吧' },
  { text: '景点', value: '景点' },
]

const showCityPicker = ref(false)
const showTagPicker = ref(false)
const loading = ref(false)

const onCityConfirm = ({ selectedOptions }) => {
  formData.value.city = selectedOptions[0].value
  showCityPicker.value = false
}

const onTagConfirm = ({ selectedOptions }) => {
  formData.value.tags = selectedOptions.map((option) => option.value)
  showTagPicker.value = false
}

const getLocation = () => {
  if (!navigator.geolocation) {
    showFailToast('您的浏览器不支持定位功能')
    return
  }

  showLoadingToast({
    message: '获取位置中...',
    forbidClick: true,
    duration: 0,
  })

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      formData.value.latitude = latitude
      formData.value.longitude = longitude
      showSuccessToast('位置获取成功')
    },
    (error) => {
      showFailToast('获取位置失败，请检查定位权限')
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const validateForm = () => {
  if (!formData.value.name.trim()) {
    showFailToast('请输入地点名称')
    return false
  }
  if (!formData.value.city) {
    showFailToast('请选择城市')
    return false
  }
  if (!formData.value.address.trim()) {
    showFailToast('请输入详细地址')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await placesStore.createPlace(formData.value)
    showSuccessToast('添加成功')
    router.push('/home')
  } catch (error) {
    showFailToast(error.message || '添加失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="add-place-page">
    <van-nav-bar
      title="添加地点"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <van-form @submit="handleSubmit" class="form">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          name="name"
          label="名称"
          placeholder="请输入地点名称"
          :rules="[{ required: true, message: '请输入地点名称' }]"
        />

        <van-field
          v-model="formData.city"
          name="city"
          readonly
          clickable
          label="城市"
          placeholder="请选择城市"
          :rules="[{ required: true, message: '请选择城市' }]"
          @click="showCityPicker = true"
        />

        <van-field
          v-model="formData.address"
          name="address"
          label="地址"
          placeholder="请输入详细地址"
          :rules="[{ required: true, message: '请输入地址' }]"
        >
          <template #button>
            <van-button size="small" type="primary" @click="getLocation">
              <van-icon name="location-o" />
              定位
            </van-button>
          </template>
        </van-field>

        <van-field
          v-model="formData.description"
          name="description"
          label="备注"
          type="textarea"
          rows="3"
          autosize
          placeholder="添加一些备注信息..."
          maxlength="300"
          show-word-limit
        />

        <van-field
          readonly
          clickable
          label="标签"
          placeholder="请选择标签"
          @click="showTagPicker = true"
        >
          <template #input>
            <div class="tags-display">
              <van-tag
                v-for="tag in formData.tags"
                :key="tag"
                type="primary"
                size="medium"
              >
                {{ tag }}
              </van-tag>
              <span v-if="!formData.tags.length" class="tags-placeholder">请选择标签</span>
            </div>
          </template>
        </van-field>

        <van-cell title="评分" class="rating-cell">
          <template #value>
            <van-rate
              v-model="formData.rating"
              :size="24"
              color="#FFD21E"
              void-color="#C8C9CC"
              allow-half
            />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="form-footer">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="保存中..."
        >
          保存
        </van-button>
      </div>
    </van-form>

    <!-- 城市选择器 -->
    <van-popup v-model:show="showCityPicker" position="bottom" round>
      <van-picker
        :columns="cities"
        @confirm="onCityConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>

    <!-- 标签选择器 -->
    <van-popup v-model:show="showTagPicker" position="bottom" round>
      <van-picker
        :columns="tagOptions"
        multiple
        @confirm="onTagConfirm"
        @cancel="showTagPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.add-place-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100px;
}

.form {
  margin-top: 12px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tags-placeholder {
  color: #c8c9cc;
  font-size: 14px;
}

.rating-cell :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.form-footer {
  margin: 24px 16px;
}
</style>
