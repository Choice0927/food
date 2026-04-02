<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { loginApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const submitting = ref(false)

const form = reactive({
  account: '',
  password: '',
})

const handleSubmit = async () => {
  if (!form.account.trim() || !form.password.trim()) {
    showFailToast('请输入账号和密码')
    return
  }

  const loadingToast = showLoadingToast({
    message: '登录中...',
    forbidClick: true,
    duration: 0,
  })

  submitting.value = true

  try {
    const { data } = await loginApi({
      account: form.account,
      password: form.password,
    })

    authStore.setAuth(data)
    showSuccessToast(data.message || '登录成功')

    await router.replace(route.query.redirect || '/home')
  } catch (error) {
    showFailToast(error.response?.data?.message || '登录失败，请稍后重试')
  } finally {
    loadingToast.close()
    submitting.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-page__hero">
      <p>欢迎回来</p>
      <h1>登录美食旅行攻略</h1>
      <span>使用手机号或邮箱登录，继续你的探店与行程记录。</span>
    </div>

    <div class="auth-card">
      <div class="auth-card__header">
        <h2>账号登录</h2>
        <p>使用 Vant 表单与 JWT 鉴权流程</p>
      </div>

      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.account"
            name="account"
            label="账号"
            placeholder="请输入手机号或邮箱"
            clearable
          >
            <template #left-icon>
              <i class="fa-regular fa-user auth-field__icon"></i>
            </template>
          </van-field>

          <van-field
            v-model="form.password"
            name="password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            clearable
          >
            <template #left-icon>
              <i class="fa-solid fa-lock auth-field__icon"></i>
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
            登录
          </van-button>
        </div>
      </van-form>

      <div class="auth-card__footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
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
