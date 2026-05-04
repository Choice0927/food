<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import { clearNavigationHistory } from '@/utils/back-handler'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  account: '',
  password: ''
})

const loading = ref(false)

const onSubmit = async () => {
  if (!form.value.account.trim() || !form.value.password) {
    showFailToast('请输入账号和密码')
    return
  }

  loading.value = true
  const toast = showLoadingToast({
    message: '登录中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const { data } = await login({
      account: form.value.account.trim(),
      password: form.value.password
    })

    authStore.setAuth({
      token: data.token,
      user: data.user
    })

    toast.close()
    showSuccessToast('登录成功')

    const redirect = route.query.redirect || '/home'
    router.replace(redirect)
    clearNavigationHistory()
  } catch (error) {
    toast.close()
    showFailToast(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const onRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-page">
    <div class="header">
      <div class="logo">
        <van-icon name="location-o" size="48" color="#ff6b3d" />
      </div>
      <h1 class="title">美食地点收藏助手</h1>
      <p class="subtitle">记录您的美食足迹</p>
    </div>

    <van-form @submit="onSubmit" class="form">
      <van-cell-group inset>
        <van-field
          v-model="form.account"
          name="account"
          placeholder="请输入邮箱或手机号"
          left-icon="user-o"
          :rules="[{ required: true, message: '请输入账号' }]"
        />

        <van-field
          v-model="form.password"
          type="password"
          name="password"
          placeholder="请输入密码"
          left-icon="lock"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>

      <div class="form-actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="登录中..."
          class="submit-btn"
        >
          登录
        </van-button>

        <van-button
          round
          block
          plain
          type="primary"
          class="register-btn"
          @click="onRegister"
        >
          注册账号
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(180deg, #fff5f0 0%, #fff 100%);
}

.header {
  text-align: center;
  margin-bottom: 40px;
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
  margin-bottom: 12px;
  --van-button-primary-background: linear-gradient(135deg, #ff6b3d 0%, #ffb347 100%);
  --van-button-primary-border-color: transparent;
}

.register-btn {
  --van-button-plain-primary-border-color: #ff6b3d;
  --van-button-plain-primary-color: #ff6b3d;
}

:deep(.van-field) {
  align-items: center;
}

:deep(.van-field__left-icon) {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

:deep(.van-field__body) {
  display: flex;
  align-items: center;
}
</style>
