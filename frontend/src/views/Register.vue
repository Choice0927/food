<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { registerApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)

const form = reactive({
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const handleSubmit = async () => {
  if (!form.email.trim() && !form.phone.trim()) {
    showFailToast('邮箱或手机号至少填写一项')
    return
  }

  if (form.password.trim().length < 6) {
    showFailToast('密码长度不能少于 6 位')
    return
  }

  if (form.password !== form.confirmPassword) {
    showFailToast('两次输入的密码不一致')
    return
  }

  const loadingToast = showLoadingToast({
    message: '注册中...',
    forbidClick: true,
    duration: 0,
  })

  submitting.value = true

  try {
    const { data } = await registerApi({
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
      password: form.password,
    })

    authStore.setAuth(data)
    showSuccessToast(data.message || '注册成功')

    await router.replace('/home')
  } catch (error) {
    showFailToast(error.response?.data?.message || '注册失败，请稍后重试')
  } finally {
    loadingToast.close()
    submitting.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-page__hero">
      <p>创建账号</p>
      <h1>开始记录你的旅行美食灵感</h1>
      <span>注册后即可保存打卡、收藏攻略并规划专属行程。</span>
    </div>

    <div class="auth-card">
      <div class="auth-card__header">
        <h2>注册账号</h2>
        <p>支持手机号或邮箱注册，登录成功后自动进入首页</p>
      </div>

      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称，可选"
            clearable
          >
            <template #left-icon>
              <i class="fa-regular fa-id-badge auth-field__icon"></i>
            </template>
          </van-field>

          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱，可选"
            clearable
          >
            <template #left-icon>
              <i class="fa-regular fa-envelope auth-field__icon"></i>
            </template>
          </van-field>

          <van-field
            v-model="form.phone"
            name="phone"
            label="手机"
            placeholder="请输入手机号，可选"
            clearable
          >
            <template #left-icon>
              <i class="fa-solid fa-mobile-screen auth-field__icon"></i>
            </template>
          </van-field>

          <van-field
            v-model="form.password"
            name="password"
            label="密码"
            type="password"
            placeholder="请输入密码，不少于 6 位"
            clearable
          >
            <template #left-icon>
              <i class="fa-solid fa-lock auth-field__icon"></i>
            </template>
          </van-field>

          <van-field
            v-model="form.confirmPassword"
            name="confirmPassword"
            label="确认"
            type="password"
            placeholder="请再次输入密码"
            clearable
          >
            <template #left-icon>
              <i class="fa-solid fa-shield-heart auth-field__icon"></i>
            </template>
          </van-field>
        </van-cell-group>

        <div class="auth-card__submit">
          <van-button
            round
            block
            native-type="submit"
            type="primary"
            :loading="submitting"
          >
            注册并进入首页
          </van-button>
        </div>
      </van-form>

      <div class="auth-card__footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 0 20px 32px;
  background: #f8f8f8;
}

.auth-page__hero {
  padding: 56px 4px 96px;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b3d, #ffb347);
  margin: 0 -20px;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
}

.auth-page__hero p,
.auth-page__hero h1,
.auth-page__hero span {
  display: block;
  margin: 0 auto;
  width: min(100%, 388px);
}

.auth-page__hero p {
  font-size: 14px;
  opacity: 0.92;
}

.auth-page__hero h1 {
  margin-top: 10px;
  font-size: 28px;
  line-height: 1.35;
}

.auth-page__hero span {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.92;
}

.auth-card {
  width: min(100%, 388px);
  margin: -52px auto 0;
  padding: 24px 20px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(255, 107, 61, 0.14);
}

.auth-card__header h2,
.auth-card__header p {
  margin: 0;
}

.auth-card__header h2 {
  color: #333333;
  font-size: 22px;
}

.auth-card__header p {
  margin-top: 8px;
  color: #999999;
  font-size: 13px;
  line-height: 1.6;
}

.auth-field__icon {
  color: #ff6b3d;
  font-size: 16px;
  margin-right: 8px;
}

.auth-card__submit {
  margin-top: 24px;
}

.auth-card__footer {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
  font-size: 14px;
  color: #999999;
}

.auth-card__footer a {
  color: #ff6b3d;
  font-weight: 600;
}
</style>
