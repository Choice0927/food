# 美食旅行攻略 H5 项目骨架

本仓库已根据需求文档生成前后端分离项目骨架：

- `frontend`：Vue 3 + Vite + Vant + Pinia + Vue Router + axios + Font Awesome 6
- `backend`：Node.js + Express + MongoDB（mongoose）

## 目录结构

```text
food/
├─ frontend
└─ backend
```

## 前端启动

1. 进入前端目录：

```bash
cd frontend
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发环境：

```bash
npm run dev
```

4. 打包生产版本：

```bash
npm run build
```

## 后端启动

1. 进入后端目录：

```bash
cd backend
```

2. 复制环境变量文件：

```bash
cp .env.example .env
```

Windows PowerShell 可使用：

```powershell
Copy-Item .env.example .env
```

3. 配置 `.env`：

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food-travel
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-your-jwt-secret
```

4. 安装依赖：

```bash
npm install
```

5. 启动开发环境：

```bash
npm run dev
```

6. 启动生产模式：

```bash
npm start
```

## 默认接口

- 根接口：`GET /`
- 测试接口：`GET /api/health`

示例返回：

```json
{
  "message": "Backend service is running",
  "timestamp": "2026-03-30T00:00:00.000Z",
  "database": "connected"
}
```

## 当前骨架说明

- 前端已配置全局主题色 `#FF6B3D`
- 前端已覆盖 Vant 主题变量，并提供基础移动端布局与底部 Tab 占位
- 后端已完成 Express 应用入口、MongoDB 连接配置、测试接口与环境变量模板

## 后续建议

- 按需求文档继续补充用户、打卡、行程、收藏、评论等模块
- 为后端增加模型、控制器、中间件与鉴权逻辑
- 为前端补充 API 封装、登录态管理与页面拆分
