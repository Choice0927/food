<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { register } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const validateForm = () => {
  if (!form.value.nickname.trim()) {
    showFailToast('请输入昵称')
    return false
  }
  
  if (!form.value.email.trim() && !form.value.phone.trim()) {
    showFailToast('请输入邮箱或手机号')
    return false
  }
  
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    showFailToast('邮箱格式不正确')
    return false
  }
  
  if (form.value.phone && !/^1\d{10}$/.test(form.value.phone)) {
    showFailToast('手机号格式不正确')
    return false
  }
  
  if (!form.value.password || form.value.password.length < 6) {
    showFailToast('密码长度不能少于6位')
    return false
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    showFailToast('两次输入的密码不一致')
    return false
  }
  
  return true
}

const onSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  const toast = showLoadingToast({
    message: '注册中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const { data } = await register({
      nickname: form.value.nickname.trim(),
      email: form.value.email.trim() || undefined,
      phone: form.value.phone.trim() || undefined,
      password: form.value.password
    })

    authStore.setAuth({
      token: data.token,
      user: data.user
    })

    toast.close()
    showSuccessToast('注册成功')
    router.replace('/home')
  } catch (error) {
    toast.close()
    showFailToast(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const onLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="header">
      <div class="logo">
        <van-icon name="location-o" size="48" color="#ff6b3d" />
      </div>
      <h1 class="title">创建账号</h1>
      <p class="subtitle">开始记录您的美食足迹</p>
    </div>

    <van-form @submit="onSubmit" class="form">
      <van-cell-group inset>
        <van-field
          v-model="form.nickname"
          name="nickname"
          placeholder="请输入昵称"
          left-icon="user-o"
          :rules="[{ required: true, message: '请输入昵称' }]"
        />

        <van-field
          v-model="form.email"
          name="email"
          placeholder="请输入邮箱（选填）"
          left-icon="envelop-o"
        />

        <van-field
          v-model="form.phone"
          name="phone"
          placeholder="请输入手机号（选填）"
          left-icon="phone-o"
        />

        <van-field
          v-model="form.password"
          type="password"
          name="password"
          placeholder="请输入密码（至少6位）"
          left-icon="lock"
          :rules="[{ required: true, message: '请输入密码' }]"
        />

        <van-field
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="请再次输入密码"
          left-icon="lock"
          :rules="[{ required: true, message: '请确认密码' }]"
        />
      </van-cell-group>

      <div class="form-actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="注册中..."
          class="submit-btn"
        >
          注册
        </van-button>

        <div class="login-link">
          <span>已有账号？</span>
          <a @click="onLogin">立即登录</a>
        </div>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(180deg, #fff5f0 0%, #fff 100%);
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(255, 107, 61, 0.15);
}

.title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.form {
  margin-top: 20px;
}

.form-actions {
  margin-top: 24px;
  padding: 0 16px;
}

.submit-btn {
  margin-bottom: 16px;
  --van-button-primary-background: linear-gradient(135deg, #ff6b3d 0%, #ffb347 100%);
  --van-button-primary-border-color: transparent;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #ff6b3d;
  cursor: pointer;
  margin-left: 4px;
}
</style>
