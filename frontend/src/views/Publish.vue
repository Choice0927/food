<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { createPostApi } from '@/api/posts'

const router = useRouter()

const formData = ref({
  name: '',
  city: '',
  address: '',
  latitude: null,
  longitude: null,
  description: '',
  notes: '',
  images: [],
  tags: [],
  rating: 0,
})

const cities = ref([
  { text: '成都', value: '成都' },
  { text: '重庆', value: '重庆' },
  { text: '北京', value: '北京' },
  { text: '上海', value: '上海' },
  { text: '广州', value: '广州' },
  { text: '深圳', value: '深圳' },
  { text: '杭州', value: '杭州' },
  { text: '西安', value: '西安' },
  { text: '武汉', value: '武汉' },
  { text: '南京', value: '南京' },
])

const showCityPicker = ref(false)

const tagOptions = ref([
  { text: '火锅', value: '火锅' },
  { text: '烧烤', value: '烧烤' },
  { text: '小吃', value: '小吃' },
  { text: '甜品', value: '甜品' },
  { text: '咖啡', value: '咖啡' },
  { text: '下午茶', value: '下午茶' },
  { text: '晚餐', value: '晚餐' },
  { text: '早餐', value: '早餐' },
  { text: '海鲜', value: '海鲜' },
  { text: '素食', value: '素食' },
])

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

const onAfterRead = async (file) => {
  if (file.status === 'done') {
    return
  }

  if (file.file && file.file.size > 5 * 1024 * 1024) {
    showFailToast('图片大小不能超过 5MB')
    return
  }

  file.status = 'uploading'
  file.message = '上传中...'

  try {
    const formData = new FormData()
    formData.append('images', file.file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('上传失败')
    }

    const result = await response.json()
    file.url = result.url
    file.status = 'done'
    file.message = ''
  } catch (error) {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

const onDeleteImage = () => {
  if (formData.value.images.length >= 9) {
    showFailToast('最多上传 9 张图片')
  }
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

      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=zh-CN`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.display_name) {
            formData.value.address = data.display_name
          }
          showSuccessToast('位置获取成功')
        })
        .catch(() => {
          showSuccessToast('位置获取成功，请手动填写地址')
        })
    },
    (error) => {
      showFailToast('获取位置失败，请检查定位权限')
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  )
}

const validateForm = () => {
  if (!formData.value.name.trim()) {
    showFailToast('请输入店名')
    return false
  }

  if (!formData.value.city) {
    showFailToast('请选择城市')
    return false
  }

  if (!formData.value.address.trim()) {
    showFailToast('请输入地址')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const uploadingImages = formData.value.images.filter((img) => img.status === 'uploading')
  if (uploadingImages.length > 0) {
    showFailToast('请等待图片上传完成')
    return
  }

  showConfirmDialog({
    title: '确认发布',
    message: '确定要发布这条美食打卡吗？',
  })
    .then(async () => {
      loading.value = true

      try {
        const postData = new FormData()
        postData.append('name', formData.value.name)
        postData.append('city', formData.value.city)
        postData.append('address', formData.value.address)

        if (formData.value.latitude) {
          postData.append('latitude', formData.value.latitude)
        }

        if (formData.value.longitude) {
          postData.append('longitude', formData.value.longitude)
        }

        if (formData.value.description) {
          postData.append('description', formData.value.description)
        }

        if (formData.value.notes) {
          postData.append('notes', formData.value.notes)
        }

        if (formData.value.rating > 0) {
          postData.append('rating', formData.value.rating)
        }

        if (formData.value.tags.length > 0) {
          postData.append('tags', formData.value.tags.join(','))
        }

        const uploadedImages = formData.value.images
          .filter((img) => img.status === 'done' && img.url)
          .map((img) => img.file)

        uploadedImages.forEach((file) => {
          postData.append('images', file)
        })

        await createPostApi(postData)

        showSuccessToast('发布成功')

        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } catch (error) {
        showFailToast(error.response?.data?.message || '发布失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {})
}
</script>

<template>
  <section class="publish-page">
    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          name="name"
          label="店名"
          placeholder="请输入店名"
          :rules="[{ required: true, message: '请输入店名' }]"
          left-icon="fa-solid fa-store"
        />

        <van-field
          v-model="formData.city"
          name="city"
          readonly
          clickable
          label="城市"
          placeholder="请选择城市"
          :rules="[{ required: true, message: '请选择城市' }]"
          left-icon="fa-solid fa-location-dot"
          @click="showCityPicker = true"
        />

        <van-field
          v-model="formData.address"
          name="address"
          label="地址"
          placeholder="请输入地址"
          :rules="[{ required: true, message: '请输入地址' }]"
          left-icon="fa-solid fa-map-pin"
        >
          <template #button>
            <van-button size="small" type="primary" @click="getLocation">
              <i class="fa-solid fa-crosshairs"></i>
              获取位置
            </van-button>
          </template>
        </van-field>

        <van-field
          v-model="formData.description"
          name="description"
          label="描述"
          type="textarea"
          rows="3"
          autosize
          placeholder="分享你的美食体验..."
          maxlength="500"
          show-word-limit
          left-icon="fa-solid fa-pen"
        />

        <van-field
          v-model="formData.notes"
          name="notes"
          label="备注"
          type="textarea"
          rows="2"
          autosize
          placeholder="添加一些小贴士..."
          maxlength="200"
          show-word-limit
          left-icon="fa-solid fa-note-sticky"
        />
      </van-cell-group>

      <van-cell-group inset class="publish-page__rating">
        <van-field label="评分" left-icon="fa-solid fa-star">
          <template #input>
            <van-rate
              v-model="formData.rating"
              :size="24"
              color="#FFD21E"
              void-color="#C8C9CC"
              allow-half
            />
          </template>
        </van-field>
      </van-cell-group>

      <van-cell-group inset class="publish-page__tags">
        <van-field
          readonly
          clickable
          label="标签"
          placeholder="请选择标签"
          left-icon="fa-solid fa-tags"
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
      </van-cell-group>

      <van-cell-group inset class="publish-page__images">
        <van-field label="图片" left-icon="fa-solid fa-image">
          <template #input>
            <van-uploader
              v-model="formData.images"
              :max-count="9"
              :max-size="5 * 1024 * 1024"
              accept="image/*"
              :after-read="onAfterRead"
              @delete="onDeleteImage"
              preview-size="100px"
              multiple
            />
          </template>
        </van-field>
      </van-cell-group>

      <div class="publish-page__footer">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="发布中..."
        >
          发布美食打卡
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showCityPicker" position="bottom" round>
      <van-picker
        :columns="cities"
        @confirm="onCityConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showTagPicker" position="bottom" round>
      <van-picker
        :columns="tagOptions"
        multiple
        @confirm="onTagConfirm"
        @cancel="showTagPicker = false"
      />
    </van-popup>
  </section>
</template>

<style scoped>
.publish-page {
  padding-bottom: 100px;
}

.publish-page__rating,
.publish-page__tags,
.publish-page__images {
  margin-top: 16px;
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

.publish-page__footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  z-index: 100;
}
</style>
