/**
 * 权限请求对话框组件
 * 用于在需要权限时显示友好的用户提示
 */

<template>
  <van-dialog
    :model-value="modelValue"
    :title="title"
    :show-cancel-button="false"
    :show-confirm-button="true"
    confirm-button-text="去授权"
    confirm-button-color="#ff6b3d"
    @confirm="handleConfirm"
  >
    <div class="permission-dialog-content">
      <div class="permission-icon">
        <van-icon :name="icon" size="48" color="#ff6b3d" />
      </div>
      <p class="permission-description">{{ description }}</p>
      <p v-if="rationale" class="permission-rationale">{{ rationale }}</p>
      <p class="permission-tip">
        您可以在系统设置中管理权限
      </p>
    </div>
  </van-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rationale: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const title = computed(() => {
  const titleMap = {
    location: '需要定位权限',
    camera: '需要相机权限',
    photos: '需要相册访问权限',
    storage: '需要存储权限'
  }
  return titleMap[props.type] || '需要权限'
})

const icon = computed(() => {
  const iconMap = {
    location: 'location-o',
    camera: 'photograph-o',
    photos: 'photo-o',
    storage: 'folder-o'
  }
  return iconMap[props.type] || 'info-o'
})

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>
