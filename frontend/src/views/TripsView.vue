<template>
  <section class="page">
    <div class="summary-card">
      <div>
        <p class="summary-card__label">行程规划模块</p>
        <h2>前后端分离骨架已就绪</h2>
      </div>
      <van-button type="primary" round size="small">新建行程</van-button>
    </div>

    <van-empty
      image="search"
      description="这里预留我的行程列表、路线规划和地图模式入口。"
    />
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.summary-card__label,
.summary-card h2 {
  margin: 0;
}

.summary-card__label {
  color: #999999;
  font-size: 12px;
}

.summary-card h2 {
  margin-top: 8px;
  color: #333333;
  font-size: 18px;
}
</style>
