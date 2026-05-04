<template>
  <van-popup :show="show" @update:show="handleClose" position="bottom" round>
    <div class="upload-method-selector">
      <div class="selector-header">
        <h3>选择图片来源</h3>
        <div class="close-icon" @click="handleClose">✕</div>
      </div>
      
      <div class="selector-content">
        <button 
          class="method-button camera-button"
          @click="handleCamera"
        >
          <div class="method-icon">
            <van-icon name="photograph-o" size="32" />
          </div>
          <span class="method-label">拍照</span>
        </button>
        
        <button 
          class="method-button gallery-button"
          @click="handleGallery"
        >
          <div class="method-icon">
            <van-icon name="photo-o" size="32" />
          </div>
          <span class="method-label">相册</span>
        </button>
        
        <button 
          class="method-button file-button"
          @click="handleFile"
        >
          <div class="method-icon">
            <van-icon name="folder-o" size="32" />
          </div>
          <span class="method-label">文件</span>
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['camera', 'gallery', 'file', 'close'])

const handleClose = () => {
  emit('close')
}

const handleCamera = () => {
  emit('camera')
  handleClose()
}

const handleGallery = () => {
  emit('gallery')
  handleClose()
}

const handleFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.style.display = 'none'
  
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      emit('file', file)
    })
  }
  
  document.body.appendChild(input)
  input.click()
  document.body.removeChild(input)
}
</script>

<style scoped>
.upload-method-selector {
  background: #fff;
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.close-icon {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.selector-content {
  display: flex;
  gap: 12px;
  padding: 20px;
}

.method-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 12px;
  transition: all 0.2s;
}

.method-button:active {
  transform: scale(0.98);
  background: #ebebeb;
}

.camera-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.camera-button:active {
  background: linear-gradient(135deg, #5a6fd0 0%, #6e8efb 100%);
}

.gallery-button {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-color: #ff9a9e;
}

.gallery-button:active {
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
}

.file-button {
  background: #fff;
}

.method-icon {
  color: #fff;
}

.file-button .method-icon {
  color: #ff6b3d;
}

.method-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-top: 8px;
}

.camera-button .method-label,
.gallery-button .method-label {
  color: #fff;
}
</style>
