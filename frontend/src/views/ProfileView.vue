<template>
  <section class="page">
    <div class="profile-card">
      <div class="profile-card__avatar">
        <i class="fa-solid fa-utensils"></i>
      </div>
      <div class="profile-card__info">
        <h2>旅行美食家</h2>
        <p>个人中心占位，后续可接入登录态、收藏、心愿单与我的打卡。</p>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-grid__item">
        <strong>12</strong>
        <span>累计打卡</span>
      </div>
      <div class="stat-grid__item">
        <strong>6</strong>
        <span>我的行程</span>
      </div>
      <div class="stat-grid__item">
        <strong>28</strong>
        <span>我的收藏</span>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell title="我的行程" is-link />
      <van-cell title="我的收藏" is-link />
      <van-cell title="账号设置" is-link />
    </van-cell-group>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card,
.stat-grid__item {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
}

.profile-card__avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b3d, #ffb347);
  font-size: 24px;
}

.profile-card__info h2,
.profile-card__info p {
  margin: 0;
}

.profile-card__info h2 {
  color: #333333;
  font-size: 18px;
}

.profile-card__info p {
  margin-top: 8px;
  color: #999999;
  font-size: 13px;
  line-height: 1.6;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
}

.stat-grid__item strong {
  color: #ff6b3d;
  font-size: 20px;
}

.stat-grid__item span {
  color: #999999;
  font-size: 12px;
}
</style>
